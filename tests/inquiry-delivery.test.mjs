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
  eventType: "Home visit",
  preferredDate: "2026-12-12",
  location: "Baton Rouge, LA",
  guestCount: "12",
  notes: "Automated test request",
  _honey: "",
};

test("buildInquiryPayload maps every booking detail and delivery metadata", () => {
  assert.deepEqual(buildInquiryPayload(inquiry), {
    _subject: "New Santa Jim booking inquiry",
    _template: "table",
    _replyto: "test@example.com",
    name: "Test Parent",
    email: "test@example.com",
    phone: "555-0100",
    eventType: "Home visit",
    preferredDate: "2026-12-12",
    location: "Baton Rouge, LA",
    guestCount: "12",
    notes: "Automated test request",
    _honey: "",
  });
});

test("submitInquiry posts JSON to the configured FormSubmit inbox", async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ success: true }) };
  };

  await submitInquiry(inquiry, fetchImpl);

  assert.equal(request.url, FORM_ENDPOINT);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.Accept, "application/json");
  assert.equal(request.options.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(request.options.body), buildInquiryPayload(inquiry));
});

test("submitInquiry reports delivery failures", async () => {
  await assert.rejects(
    submitInquiry(inquiry, async () => ({ ok: false, json: async () => ({ success: false }) })),
    /could not send/i,
  );
});

test("honeypot submissions do not make a network request", async () => {
  let called = false;
  await submitInquiry({ ...inquiry, _honey: "bot" }, async () => {
    called = true;
  });
  assert.equal(called, false);
});
