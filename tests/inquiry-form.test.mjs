import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the inquiry form collects the planned event details", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  for (const name of ["name", "email", "phone", "eventType", "preferredDate", "location", "guestCount", "notes"]) {
    assert.match(form, new RegExp(`name=["']${name}["']`));
  }
});

test("the confirmation says that data was not sent or stored", async () => {
  const form = await readFile(new URL("../components/santa/inquiry-form.tsx", import.meta.url), "utf8");

  assert.match(form, /has not sent or stored your information/);
  assert.match(form, /role="status"/);
});
