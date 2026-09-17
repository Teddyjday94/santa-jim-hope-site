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

test("customers cannot type arbitrary scheduler start or end times", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(form, /name="startTime"\s+type="time"/);
  assert.doesNotMatch(form, /name="endTime"\s+type="time"/);
  assert.match(form, /type="hidden" name="startTime"/);
  assert.match(form, /type="hidden" name="endTime"/);
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
