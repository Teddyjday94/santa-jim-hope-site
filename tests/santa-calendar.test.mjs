import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public availability merges Google Calendar busy intervals without exposing tokens", async () => {
  const route = await read("app/api/santa/availability/route.ts");
  assert.match(route, /santa-calendar-public/);
  assert.match(route, /calendarBusy|googleBusy/i);
  assert.match(route, /buildAvailableSlots/);
  assert.doesNotMatch(route, /refresh_token|access_token/);
});

test("Santa admin dashboard can connect and disconnect Google Calendar", async () => {
  const dashboard = await read("components/santa/admin-dashboard.tsx");
  assert.match(dashboard, /Google Calendar/);
  assert.match(dashboard, /Connect Google Calendar/);
  assert.match(dashboard, /Disconnect/);
  assert.match(dashboard, /google_code|calendar.*code|searchParams/i);
});

test("admin calendar API forwards authenticated operations to the protected Edge Function", async () => {
  const route = await read("app/api/santa/admin/calendar/route.ts");
  assert.match(route, /bearerToken/);
  assert.match(route, /assertSantaAdmin/);
  assert.match(route, /santa-calendar-admin/);
  assert.match(route, /Authorization/);
});

test("confirming a booking attempts Google Calendar event creation and records sync state", async () => {
  const route = await read("app/api/santa/admin/bookings/route.ts");
  assert.match(route, /create-event/);
  assert.match(route, /calendar_sync_status/);
  assert.match(route, /google_event_id/);
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
});
