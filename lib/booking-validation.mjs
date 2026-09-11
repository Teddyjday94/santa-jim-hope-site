/**
 * Validate the fields used by the local-only inquiry preview.
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
export function validateInquiry(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.eventType) errors.eventType = "Choose an event type.";
  if (!values.preferredDate) errors.preferredDate = "Choose a preferred date.";
  if (!values.startTime) errors.startTime = "Choose a start time.";
  if (!values.endTime) errors.endTime = "Choose an end time.";
  else if (values.startTime && values.endTime <= values.startTime) errors.endTime = "Choose an end time later than the start time.";
  if (!values.location.trim()) errors.location = "Enter the event location.";
  if (values.guestCount && Number(values.guestCount) <= 0) errors.guestCount = "Guest count must be a positive number.";
  return errors;
}
