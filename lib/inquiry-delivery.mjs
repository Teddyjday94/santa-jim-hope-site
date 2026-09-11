export const FORM_ENDPOINT = "https://formsubmit.co/ajax/thomasdbiz26@gmail.com";

export function buildInquiryPayload(values) {
  return {
    _subject: "New Santa Jim booking inquiry",
    _template: "table",
    _replyto: values.email,
    name: values.name,
    email: values.email,
    phone: values.phone,
    eventType: values.eventType,
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
    throw new Error("We could not send your inquiry. Please try again.");
  }

  return result;
}
