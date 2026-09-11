import test from "node:test";
import assert from "node:assert/strict";
import { validateInquiry } from "../lib/booking-validation.mjs";

const valid = {
  name: "Jamie Parker",
  email: "jamie@example.com",
  phone: "225-555-0147",
  eventType: "Home visit",
  preferredDate: "2026-12-12",
  startTime: "18:30",
  endTime: "20:00",
  location: "Gonzales, Louisiana",
  guestCount: "12",
  notes: "A small family gathering",
};

test("returns no errors for a complete inquiry", () => {
  assert.deepEqual(validateInquiry(valid), {});
});

test("reports every required empty field", () => {
  const errors = validateInquiry({ name: "", email: "", phone: "", eventType: "", preferredDate: "", startTime: "", endTime: "", location: "", guestCount: "", notes: "" });
  assert.deepEqual(Object.keys(errors).sort(), ["email", "endTime", "eventType", "location", "name", "preferredDate", "startTime"].sort());
});

test("requires the end time to be later than the start time", () => {
  assert.equal(validateInquiry({ ...valid, endTime: "18:30" }).endTime, "Choose an end time later than the start time.");
  assert.equal(validateInquiry({ ...valid, endTime: "17:30" }).endTime, "Choose an end time later than the start time.");
});

test("rejects malformed email and negative guest count", () => {
  const errors = validateInquiry({ ...valid, email: "wrong", guestCount: "-2" });
  assert.equal(errors.email, "Enter a valid email address.");
  assert.equal(errors.guestCount, "Guest count must be a positive number.");
});
