import test from "node:test";
import assert from "node:assert/strict";

import * as availabilityService from "../lib/santa-availability-service.mjs";

const { validateBookingAvailability } = availabilityService;

test("booking revalidation accepts a slot from the shared server availability loader", async () => {
  let loaderCalls = 0;
  const result = await validateBookingAvailability({
    date: "2026-11-03",
    serviceSlug: "photo-session",
    startTime: "10:00",
    loadAvailability: async ({ date, serviceSlug }) => {
      loaderCalls += 1;
      assert.equal(date, "2026-11-03");
      assert.equal(serviceSlug, "photo-session");
      return {
        status: 200,
        body: {
          slots: [{ startTime: "10:00", endTime: "10:15" }],
        },
      };
    },
  });

  assert.equal(loaderCalls, 1);
  assert.deepEqual(result, { available: true, endTime: "10:15" });
});

test("booking revalidation distinguishes loader failure from a real slot conflict", async () => {
  const failedCheck = await validateBookingAvailability({
    date: "2026-11-03",
    serviceSlug: "photo-session",
    startTime: "10:00",
    loadAvailability: async () => ({
      status: 503,
      body: { error: "Calendar availability is temporarily unavailable." },
    }),
  });
  const conflict = await validateBookingAvailability({
    date: "2026-11-03",
    serviceSlug: "photo-session",
    startTime: "10:00",
    loadAvailability: async () => ({ status: 200, body: { slots: [] } }),
  });

  assert.deepEqual(failedCheck, {
    available: false,
    reason: "availability_error",
    error: "Calendar availability is temporarily unavailable.",
  });
  assert.deepEqual(conflict, { available: false, reason: "slot_unavailable" });
});

test("shared availability loader builds slots directly from Supabase and Calendar data", async () => {
  const restCalls = [];
  const result = await availabilityService.loadSantaAvailability({
    date: "2026-11-03",
    serviceSlug: "photo-session",
    siteId: "site-test",
    supabaseRest: async (path) => {
      restCalls.push(path);
      if (path.startsWith("santa_schedule_settings?")) {
        return Response.json([{
          season_start: "2026-11-01",
          season_end: "2026-12-24",
          default_start_time: "10:00:00",
          default_end_time: "11:00:00",
          slot_step_minutes: 15,
          pending_hold_minutes: 1440,
          timezone: "America/Chicago",
        }]);
      }
      if (path.startsWith("santa_services?")) {
        return Response.json([{
          slug: "photo-session",
          name: "Photo session",
          duration_minutes: 15,
          buffer_minutes: 5,
          active: true,
          sort_order: 1,
        }]);
      }
      if (path.startsWith("santa_day_rules?")) return Response.json([]);
      if (path.startsWith("santa_booking_requests?")) return Response.json([]);
      throw new Error(`Unexpected Supabase path: ${path}`);
    },
    invokeSupabaseFunction: async (name, body) => {
      assert.equal(name, "santa-calendar-public");
      assert.deepEqual(body, { date: "2026-11-03" });
      return Response.json({ connected: true, busy: [] });
    },
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body.slots, [
    { startTime: "10:00", endTime: "10:15" },
    { startTime: "10:15", endTime: "10:30" },
    { startTime: "10:30", endTime: "10:45" },
  ]);
  assert.equal(restCalls.length, 4);
});
