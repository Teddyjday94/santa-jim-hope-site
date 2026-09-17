import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAvailableSlots,
  getAllowedServicesForDate,
  intervalsOverlap,
  validateRequestedSlot,
} from "../lib/santa-scheduler.mjs";

const services = [
  { slug: "home-visit", name: "Home visit", durationMinutes: 60, bufferMinutes: 15, active: true },
  { slug: "photo-session", name: "Photo session", durationMinutes: 15, bufferMinutes: 5, active: true },
  { slug: "corporate-event", name: "Corporate event", durationMinutes: 120, bufferMinutes: 30, active: true },
];

const settings = {
  seasonStart: "2026-11-01",
  seasonEnd: "2026-12-24",
  defaultStartTime: "10:00",
  defaultEndTime: "20:00",
  slotStepMinutes: 15,
};

test("blocked dates return no services or slots", () => {
  const rule = { mode: "blocked" };
  assert.deepEqual(getAllowedServicesForDate({ date: "2026-12-10", services, settings, rule }), []);
  assert.deepEqual(buildAvailableSlots({ date: "2026-12-10", serviceSlug: "home-visit", services, settings, rule, bookings: [] }), []);
});

test("photos-only dates expose only photo sessions", () => {
  const rule = { mode: "photos_only" };
  assert.deepEqual(getAllowedServicesForDate({ date: "2026-12-05", services, settings, rule }).map((s) => s.slug), ["photo-session"]);
  assert.deepEqual(buildAvailableSlots({ date: "2026-12-05", serviceSlug: "home-visit", services, settings, rule, bookings: [] }), []);
  assert.ok(buildAvailableSlots({ date: "2026-12-05", serviceSlug: "photo-session", services, settings, rule, bookings: [] }).length > 0);
});

test("custom dates expose only configured services inside configured windows", () => {
  const rule = {
    mode: "custom",
    allowedServiceSlugs: ["home-visit"],
    windows: [{ start: "17:00", end: "19:00" }],
  };
  assert.deepEqual(getAllowedServicesForDate({ date: "2026-12-12", services, settings, rule }).map((s) => s.slug), ["home-visit"]);
  const slots = buildAvailableSlots({ date: "2026-12-12", serviceSlug: "home-visit", services, settings, rule, bookings: [] });
  assert.deepEqual(slots.map((slot) => slot.startTime), ["17:00", "17:15", "17:30", "17:45"]);
  assert.equal(slots.at(-1).endTime, "18:45");
});

test("dates outside the configured season return no availability", () => {
  assert.deepEqual(buildAvailableSlots({ date: "2026-10-31", serviceSlug: "photo-session", services, settings, rule: null, bookings: [] }), []);
  assert.deepEqual(buildAvailableSlots({ date: "2026-12-25", serviceSlug: "photo-session", services, settings, rule: null, bookings: [] }), []);
});

test("pending and confirmed intervals block overlapping slots but declined bookings do not", () => {
  const bookings = [
    { date: "2026-12-15", startTime: "10:30", endTime: "11:30", status: "pending" },
    { date: "2026-12-15", startTime: "13:00", endTime: "14:00", status: "confirmed" },
    { date: "2026-12-15", startTime: "15:00", endTime: "16:00", status: "declined" },
  ];
  const slots = buildAvailableSlots({ date: "2026-12-15", serviceSlug: "home-visit", services, settings, rule: null, bookings });
  assert.equal(slots.some((slot) => slot.startTime === "10:00"), false);
  assert.equal(slots.some((slot) => slot.startTime === "12:00"), false);
  assert.equal(slots.some((slot) => slot.startTime === "15:00"), true);
});

test("interval overlap uses half-open time ranges", () => {
  assert.equal(intervalsOverlap("10:00", "11:00", "11:00", "12:00"), false);
  assert.equal(intervalsOverlap("10:00", "11:00", "10:59", "12:00"), true);
});

test("validateRequestedSlot rejects manipulated or stale selections", () => {
  const result = validateRequestedSlot({
    date: "2026-12-05",
    serviceSlug: "corporate-event",
    startTime: "12:00",
    services,
    settings,
    rule: { mode: "photos_only" },
    bookings: [],
  });
  assert.deepEqual(result, { valid: false, reason: "service_unavailable" });
});
