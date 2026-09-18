import test from "node:test";
import assert from "node:assert/strict";
import { buildBookingDecisionNotification } from "../lib/santa-booking-notifications.mjs";
import { bookingTransitionPlan } from "../lib/santa-booking-actions.mjs";

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
