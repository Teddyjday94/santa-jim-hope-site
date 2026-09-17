export const FORM_ENDPOINT = "/api/santa/bookings";

export function buildInquiryPayload(values) {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    eventType: values.eventType,
    serviceSlug: values.eventType,
    preferredDate: values.preferredDate,
    startTime: values.startTime,
    endTime: values.endTime,
    location: values.location,
    guestCount: values.guestCount,
    notes: values.notes,
    _honey: values._honey,
  };
}

export async function submitInquiry(values, fetchImpl = fetch) {
  if (values._honey) return { success: true };

  const response = await fetchImpl(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildInquiryPayload(values)),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false || result.success === "false") {
    throw new Error(result.error || "We could not send your request. Please try again.");
  }

  return result;
}
