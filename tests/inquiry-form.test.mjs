import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the inquiry form collects the planned event details", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  for (const name of ["name", "email", "phone", "eventType", "preferredDate", "startTime", "endTime", "location", "guestCount", "notes"]) {
    assert.match(form, new RegExp(`name=["']${name}["']`));
  }
});

test("the inquiry form sends through the delivery module and reports status", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  assert.match(form, /submitInquiry/);
  assert.match(form, /Your inquiry has been sent/);
  assert.match(form, /name="_honey"/);
  assert.match(form, /role="status"/);
  assert.match(form, /role="alert"/);
  assert.doesNotMatch(form, /has not sent or stored your information/);
});
