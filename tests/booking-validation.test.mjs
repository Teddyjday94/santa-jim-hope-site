import test from "node:test";
import assert from "node:assert/strict";
import { validateInquiry } from "../lib/booking-validation.mjs";

const valid = {
  name: "Jamie Parker",
  email: "jamie@example.com",
  phone: "225-555-0147",
  eventType: "Home visit",
  preferredDate: "2026-12-12",
  location: "Gonzales, Louisiana",
  guestCount: "12",
  notes: "A small family gathering",
};

test("returns no errors for a complete inquiry", () => {
  assert.deepEqual(validateInquiry(valid), {});
});

test("reports every required empty field", () => {
  const errors = validateInquiry({ name: "", email: "", phone: "", eventType: "", preferredDate: "", location: "", guestCount: "", notes: "" });
  assert.deepEqual(Object.keys(errors).sort(), ["email", "eventType", "location", "name", "preferredDate"].sort());
});

test("rejects malformed email and negative guest count", () => {
  const errors = validateInquiry({ ...valid, email: "wrong", guestCount: "-2" });
  assert.equal(errors.email, "Enter a valid email address.");
  assert.equal(errors.guestCount, "Guest count must be a positive number.");
});
