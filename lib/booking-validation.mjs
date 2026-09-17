/**
 * Validate the fields used by the Santa Jim scheduler request.
 * The scheduler derives the end time from the selected service/slot, so
 * customers never have to enter an end time themselves.
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateInquiry(values) {
  const errors = {};
  const name = String(values.name ?? "").trim();
  const email = String(values.email ?? "").trim();
  const eventType = String(values.eventType ?? "");
  const preferredDate = String(values.preferredDate ?? "");
  const startTime = String(values.startTime ?? "");
  const endTime = String(values.endTime ?? "");
  const location = String(values.location ?? "").trim();
  const guestCount = String(values.guestCount ?? "");

  if (!name) errors.name = "Enter your name.";
  if (!email) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!eventType) errors.eventType = "Choose an event type.";
  if (!preferredDate) errors.preferredDate = "Choose a preferred date.";
  if (!startTime) errors.startTime = "Choose a start time.";
  if (endTime && startTime && endTime <= startTime) errors.endTime = "Choose an end time later than the start time.";
  if (!location) errors.location = "Enter the event location.";
  if (guestCount && Number(guestCount) <= 0) errors.guestCount = "Guest count must be a positive number.";
  return errors;
}
