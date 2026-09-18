export function bookingTransitionPlan({ currentStatus, requestedStatus, googleEventId }) {
  if (currentStatus === "pending" && (requestedStatus === "confirmed" || requestedStatus === "declined")) {
    return {
      allowed: true,
      expectedStatus: "pending",
      calendarAction: requestedStatus === "confirmed" ? "create-event" : null,
    };
  }

  if (currentStatus === "confirmed" && requestedStatus === "cancelled") {
    return {
      allowed: true,
      expectedStatus: "confirmed",
      calendarAction: googleEventId ? "cancel-event" : null,
    };
  }

  if (currentStatus === "cancelled" && requestedStatus === "cancelled") {
    return {
      allowed: true,
      expectedStatus: "cancelled",
      calendarAction: null,
    };
  }

  return { allowed: false, expectedStatus: null, calendarAction: null };
}
