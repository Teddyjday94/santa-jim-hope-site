import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the inquiry form preserves customer fields and scheduler selections", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  for (const name of ["name", "email", "phone", "eventType", "preferredDate", "startTime", "endTime", "location", "guestCount", "notes"]) {
    assert.match(form, new RegExp(`name=["']${name}["']`));
  }
  assert.match(form, /\/api\/santa\/availability/);
  assert.match(form, /scheduler-service/);
  assert.match(form, /scheduler-times/);
  assert.match(form, /aria-pressed/);
});

test("start and end times reach the form only through scheduler-controlled hidden fields", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(form, /name="startTime"\s+type="time"/);
  assert.doesNotMatch(form, /name="endTime"\s+type="time"/);
  assert.match(form, /type="hidden" name="startTime"/);
  assert.match(form, /type="hidden" name="endTime"/);
});

test("only photo sessions use time slots; other experiences take the family's start and end time", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/api/santa/bookings/route.ts", import.meta.url), "utf8");

  assert.match(form, /usesTimeSlots\(selectedService\)/);
  assert.match(form, /Start time \*/);
  assert.match(form, /End time \*/);
  assert.match(route, /usesTimeSlots\(payload\.p_service_slug\)/);
  assert.match(route, /validateOpenTimeBooking/);
  assert.match(route, /p_local_end_time/);
});

test("scheduling starts from a month calendar that marks Pictures with Santa days", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  assert.match(form, /function BookingCalendar/);
  assert.match(form, /booking-calendar__day--photo/);
  assert.match(form, /Photos only/);
  assert.match(form, /Only photo sessions can be booked/);
  assert.ok(form.indexOf("<BookingCalendar") < form.indexOf("What would you like to schedule?"), "the day is chosen before the experience");
});

test("Zoom calls skip the event location field", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  assert.match(form, /ZOOM_SERVICE_SLUG = "zoom-call"/);
  assert.match(form, /name="location" value="Zoom \(online\)"/);
});

test("the inquiry form sends a pending request and reports accessible status", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  assert.match(form, /submitInquiry/);
  assert.match(form, /pending Santa Jim(?:’|'|&apos;)s approval/i);
  assert.match(form, /name="_honey"/);
  assert.match(form, /role="status"/);
  assert.match(form, /role="alert"/);
  assert.doesNotMatch(form, /has not sent or stored your information/);
});
