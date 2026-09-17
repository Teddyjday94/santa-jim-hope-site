import assert from "node:assert/strict";
import test from "node:test";

import {
  FORM_ENDPOINT,
  buildInquiryPayload,
  submitInquiry,
} from "../lib/inquiry-delivery.mjs";

const inquiry = {
  name: "Test Parent",
  email: "test@example.com",
  phone: "555-0100",
  eventType: "home-visit",
  preferredDate: "2026-12-12",
  startTime: "18:30",
  endTime: "19:30",
  location: "Baton Rouge, LA",
  guestCount: "12",
  notes: "Automated test request",
  _honey: "",
};

test("buildInquiryPayload maps the selected service and booking details", () => {
  assert.deepEqual(buildInquiryPayload(inquiry), {
    name: "Test Parent",
    email: "test@example.com",
    phone: "555-0100",
    eventType: "home-visit",
    serviceSlug: "home-visit",
    preferredDate: "2026-12-12",
    startTime: "18:30",
    endTime: "19:30",
    location: "Baton Rouge, LA",
    guestCount: "12",
    notes: "Automated test request",
    _honey: "",
  });
});

test("submitInquiry posts JSON to the scheduler booking API", async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ success: true, status: "pending" }) };
  };

  await submitInquiry(inquiry, fetchImpl);

  assert.equal(FORM_ENDPOINT, "/api/santa/bookings");
  assert.equal(request.url, FORM_ENDPOINT);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.Accept, "application/json");
  assert.equal(request.options.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(request.options.body), buildInquiryPayload(inquiry));
});

test("submitInquiry forwards scheduler conflict messages", async () => {
  await assert.rejects(
    submitInquiry(inquiry, async () => ({
      ok: false,
      status: 409,
      json: async () => ({ error: "That time is no longer available. Please choose another." }),
    })),
    /no longer available/i,
  );
});

test("submitInquiry reports generic delivery failures when the server gives no message", async () => {
  await assert.rejects(
    submitInquiry(inquiry, async () => ({ ok: false, json: async () => ({}) })),
    /could not send your request/i,
  );
});

test("honeypot submissions do not make a network request", async () => {
  let called = false;
  await submitInquiry({ ...inquiry, _honey: "bot" }, async () => {
    called = true;
  });
  assert.equal(called, false);
});
