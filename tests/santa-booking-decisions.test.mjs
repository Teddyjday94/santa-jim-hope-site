import test from "node:test";
import assert from "node:assert/strict";
import { buildBookingDecisionNotification } from "../lib/santa-booking-notifications.mjs";
import { bookingTransitionPlan } from "../lib/santa-booking-actions.mjs";
import { buildAcceptanceEmail, sendAcceptanceEmail } from "../lib/santa-acceptance-email.mjs";

const booking = {
  id: "booking-123",
  customer_name: "Jamie Customer",
  customer_email: "jamie@example.com",
  service_slug: "home-visit",
  local_date: "2026-12-12",
  local_start_time: "14:00:00",
};

test("accepted-booking test notification names the intended customer and explains the deposit", () => {
  const notification = buildBookingDecisionNotification({
    decision: "confirmed",
    booking,
    testRecipient: "thomasdbiz26@gmail.com",
  });

  assert.equal(notification.recipient, "thomasdbiz26@gmail.com");
  assert.equal(notification.fields.intendedCustomerEmail, "jamie@example.com");
  assert.match(notification.fields._subject, /^TEST .*accepted/i);
  assert.match(notification.fields.message, /Santa Jim has accepted your request/i);
  assert.match(notification.fields.message, /contact you for more details/i);
  assert.match(notification.fields.message, /\$50 deposit/i);
  assert.match(notification.fields.message, /secure (?:the|your) (?:approved )?booking/i);
});

test("acceptance email test mode goes only to the business inbox and names the intended customer", () => {
  const email = buildAcceptanceEmail({
    booking,
    deliveryMode: "test",
    testRecipient: "thomasdbiz26@gmail.com",
    from: "Santa Jim <bookings@example.com>",
  });

  assert.deepEqual(email.to, ["thomasdbiz26@gmail.com"]);
  assert.match(email.subject, /^TEST .*accepted/i);
  assert.match(email.text, /Intended customer: jamie@example\.com/i);
  assert.match(email.text, /Santa Jim has accepted your booking request/i);
  assert.match(email.text, /contact you with further booking details/i);
  assert.match(email.text, /\$50 deposit/i);
  assert.match(email.text, /payment information/i);
});

test("acceptance email live mode goes to the customer without a test subject", () => {
  const email = buildAcceptanceEmail({
    booking,
    deliveryMode: "live",
    testRecipient: "thomasdbiz26@gmail.com",
    from: "Santa Jim <bookings@example.com>",
  });

  assert.deepEqual(email.to, ["jamie@example.com"]);
  assert.doesNotMatch(email.subject, /^TEST/i);
  assert.doesNotMatch(email.text, /Intended customer:/i);
});

test("acceptance email send uses Resend and a stable booking idempotency key", async () => {
  let request;
  const result = await sendAcceptanceEmail({
    booking,
    apiKey: "re_test_secret",
    deliveryMode: "test",
    testRecipient: "thomasdbiz26@gmail.com",
    from: "Santa Jim <bookings@example.com>",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ id: "email-123" }) };
    },
  });

  assert.equal(result.sent, true);
  assert.equal(result.mode, "test");
  assert.equal(result.recipient, "thomasdbiz26@gmail.com");
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.options.headers.Authorization, "Bearer re_test_secret");
  assert.equal(request.options.headers["Idempotency-Key"], "santa-booking-accepted/booking-123");
  assert.deepEqual(JSON.parse(request.options.body).to, ["thomasdbiz26@gmail.com"]);
});

test("acceptance email test mode falls back to the existing business inbox channel", async () => {
  let request;
  const result = await sendAcceptanceEmail({
    booking,
    apiKey: "",
    deliveryMode: "test",
    testRecipient: "thomasdbiz26@gmail.com",
    from: "",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({}) };
    },
  });

  assert.equal(result.sent, true);
  assert.equal(result.mode, "test");
  assert.equal(result.provider, "formsubmit");
  assert.equal(request.url, "https://formsubmit.co/ajax/thomasdbiz26%40gmail.com");
  assert.match(JSON.parse(request.options.body).message, /\$50 deposit/i);
});

test("acceptance email live mode fails safely without Resend credentials", async () => {
  let calls = 0;
  const result = await sendAcceptanceEmail({
    booking,
    apiKey: "",
    deliveryMode: "live",
    testRecipient: "thomasdbiz26@gmail.com",
    from: "",
    fetchImpl: async () => {
      calls += 1;
      return { ok: true };
    },
  });

  assert.equal(result.sent, false);
  assert.equal(result.mode, "live");
  assert.equal(calls, 0);
});

test("declined-booking test notification asks the customer to choose another date", () => {
  const notification = buildBookingDecisionNotification({
    decision: "declined",
    booking,
    testRecipient: "thomasdbiz26@gmail.com",
  });

  assert.equal(notification.recipient, "thomasdbiz26@gmail.com");
  assert.equal(notification.fields.intendedCustomerEmail, "jamie@example.com");
  assert.match(notification.fields._subject, /^TEST .*not available/i);
  assert.match(notification.fields.message, /not available on this day/i);
  assert.match(notification.fields.message, /choose another available date/i);
  assert.doesNotMatch(notification.fields.message, /deposit/i);
});

test("only supported booking decisions can produce notifications", () => {
  assert.throws(() => buildBookingDecisionNotification({
    decision: "cancelled",
    booking,
    testRecipient: "thomasdbiz26@gmail.com",
  }), /Unsupported booking decision/);
});

test("confirmed bookings cancel through Calendar when an event exists", () => {
  assert.deepEqual(bookingTransitionPlan({
    currentStatus: "confirmed",
    requestedStatus: "cancelled",
    googleEventId: "santabooking123",
  }), {
    allowed: true,
    expectedStatus: "confirmed",
    calendarAction: "cancel-event",
  });
});

test("confirmed bookings without a Calendar event can still be cancelled", () => {
  assert.deepEqual(bookingTransitionPlan({
    currentStatus: "confirmed",
    requestedStatus: "cancelled",
    googleEventId: null,
  }), {
    allowed: true,
    expectedStatus: "confirmed",
    calendarAction: null,
  });
});

test("a repeated cancellation is treated as an already-completed transition", () => {
  assert.deepEqual(bookingTransitionPlan({
    currentStatus: "cancelled",
    requestedStatus: "cancelled",
    googleEventId: null,
  }), {
    allowed: true,
    expectedStatus: "cancelled",
    calendarAction: null,
  });
});

test("invalid booking status transitions are rejected", () => {
  assert.deepEqual(bookingTransitionPlan({
    currentStatus: "declined",
    requestedStatus: "cancelled",
    googleEventId: null,
  }), {
    allowed: false,
    expectedStatus: null,
    calendarAction: null,
  });
});
