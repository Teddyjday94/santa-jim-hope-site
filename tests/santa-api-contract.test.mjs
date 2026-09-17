import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("availability endpoint reads only safe scheduler data and returns slots", async () => {
  const source = await read("app/api/santa/availability/route.ts");
  assert.match(source, /santa_schedule_settings/);
  assert.match(source, /santa_services/);
  assert.match(source, /santa_day_rules/);
  assert.match(source, /local_start_time/);
  assert.match(source, /buildAvailableSlots/);
  assert.doesNotMatch(source, /customer_email/);
});

test("booking endpoint creates a pending request and keeps test email routing", async () => {
  const source = await read("app/api/santa/bookings/route.ts");
  const config = await read("lib/santa-config.ts");
  assert.match(source, /create_santa_booking|santa_booking_requests/);
  assert.match(source, /"pending"/);
  assert.match(source, /SANTA_TEST_NOTIFICATION_EMAIL/);
  assert.match(config, /thomasdbiz26@gmail\.com/);
  assert.match(source, /409/);
});

test("admin booking endpoint requires a bearer token before exposing PII", async () => {
  const source = await read("app/api/santa/admin/bookings/route.ts");
  const helper = await read("lib/santa-supabase.ts");
  assert.match(source, /bearerToken|Authorization/);
  assert.match(source, /assertSantaAdmin/);
  assert.match(helper, /auth\/v1\/user/);
  assert.match(source, /customer_email/);
  assert.match(source, /is_admin|site_members|authorized/i);
});

test("day rule endpoint supports all four scheduler modes", async () => {
  const source = await read("app/api/santa/admin/day-rules/route.ts");
  for (const mode of ["normal", "photos_only", "blocked", "custom"]) {
    assert.match(source, new RegExp(mode));
  }
});
