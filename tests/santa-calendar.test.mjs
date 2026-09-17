import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mergeCalendarBusyIntervals } from "../lib/santa-calendar.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public availability merges Google Calendar busy intervals without exposing tokens", async () => {
  const route = await read("app/api/santa/availability/route.ts");
  assert.match(route, /santa-calendar-public/);
  assert.match(route, /calendarBusy|googleBusy/i);
  assert.match(route, /buildAvailableSlots/);
  assert.match(route, /Calendar service could not be reached/);
  assert.doesNotMatch(route, /refresh_token|access_token/);
});

test("Santa admin dashboard can connect and disconnect Google Calendar", async () => {
  const dashboard = await read("components/santa/admin-dashboard.tsx");
  assert.match(dashboard, /Google Calendar/);
  assert.match(dashboard, /Connect Google Calendar/);
  assert.match(dashboard, /Disconnect/);
  assert.match(dashboard, /google_code|calendar.*code|searchParams/i);
  assert.match(dashboard, /searchParams\.get\("error"\)/);
});

test("admin calendar API forwards authenticated operations to the protected Edge Function", async () => {
  const route = await read("app/api/santa/admin/calendar/route.ts");
  const helper = await read("lib/santa-supabase.ts");
  assert.match(route, /bearerToken/);
  assert.match(route, /assertSantaAdmin/);
  assert.match(route, /santa-calendar-admin/);
  assert.match(helper, /Authorization/);
  assert.match(route, /status.*auth-url.*exchange.*disconnect/s);
  assert.doesNotMatch(route, /delete-event/);
});

test("confirming a booking attempts Google Calendar event creation and records sync state", async () => {
  const route = await read("app/api/santa/admin/bookings/route.ts");
  assert.match(route, /create-event/);
  assert.match(route, /calendar_sync_status/);
  assert.match(route, /google_event_id/);
  assert.match(route, /status=eq\.pending/);
  assert.match(route, /calendar_sync_status=in\./);
  assert.match(route, /rollback-event/);
  assert.match(route, /Calendar service could not be reached/);
});

test("Calendar Edge Functions keep OAuth secrets and tokens server-side", async () => {
  const adminFunction = await read("supabase/functions/santa-calendar-admin/index.ts");
  const publicFunction = await read("supabase/functions/santa-calendar-public/index.ts");
  assert.match(adminFunction, /GOOGLE_CALENDAR_CLIENT_ID/);
  assert.match(adminFunction, /GOOGLE_CALENDAR_CLIENT_SECRET/);
  assert.match(adminFunction, /oauth2\.googleapis\.com\/token/);
  assert.match(adminFunction, /calendar\.events/);
  assert.match(publicFunction, /calendar\/v3\/freeBusy/);
  assert.match(publicFunction, /busy/);
  assert.doesNotMatch(publicFunction, /refresh_token.*JSON\.stringify|access_token.*JSON\.stringify/);
  assert.doesNotMatch(adminFunction, /booking\.customer_email|booking\.customer_phone|booking\.event_location|booking\.guest_count|booking\.notes/);
  assert.match(adminFunction, /function googleEventId/);
  assert.match(adminFunction, /action === "rollback-event"/);
  assert.doesNotMatch(adminFunction, /action === "delete-event"/);
});

test("Calendar migrations reproduce booking sync fields and storage hardening", async () => {
  const migration = await read("supabase/migrations/20260917140000_complete_santa_google_calendar_sync.sql");
  assert.match(migration, /google_event_id/);
  assert.match(migration, /calendar_sync_status/);
  assert.match(migration, /calendar_sync_error/);
  assert.match(migration, /unique index/i);
});

test("CI type-checks both Supabase Calendar functions with Deno", async () => {
  const workflow = await read(".github/workflows/verify.yml");
  assert.match(workflow, /setup-deno/);
  assert.match(workflow, /deno check[\s\S]*santa-calendar-admin[\s\S]*santa-calendar-public/);
});

test("Google Calendar busy periods join scheduler conflicts without trusting malformed times", () => {
  const existing = [{ date: "2026-12-12", startTime: "10:00", endTime: "11:15", status: "pending" }];
  const merged = mergeCalendarBusyIntervals("2026-12-12", existing, [
    { startTime: "13:00", endTime: "14:30" },
    { startTime: "15:00", endTime: "15:00" },
    { startTime: "not-a-time", endTime: "16:00" },
  ]);

  assert.deepEqual(merged, [
    ...existing,
    { date: "2026-12-12", startTime: "13:00", endTime: "14:30", status: "confirmed" },
  ]);
});
