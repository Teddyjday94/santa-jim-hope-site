function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function titleFromSlug(value) {
  return clean(value).split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function buildBookingDecisionNotification({ decision, booking, testRecipient }) {
  if (decision !== "confirmed" && decision !== "declined") {
    throw new Error("Unsupported booking decision.");
  }

  const intendedCustomerEmail = clean(booking?.customer_email);
  const accepted = decision === "confirmed";
  const message = accepted
    ? "Santa Jim has accepted your request. He will contact you for more details. A $50 deposit is required to secure the approved booking."
    : "Santa Jim is not available on this day. Please choose another available date and submit a new request.";

  return {
    recipient: clean(testRecipient),
    fields: {
      _subject: accepted
        ? `TEST — Santa Jim request accepted for ${clean(booking?.customer_name)}`
        : `TEST — Santa Jim is not available for ${clean(booking?.customer_name)}`,
      _template: "table",
      testMode: "This development message was sent only to the business test inbox.",
      intendedCustomerName: clean(booking?.customer_name),
      intendedCustomerEmail,
      service: titleFromSlug(booking?.service_slug),
      date: clean(booking?.local_date),
      startTime: clean(booking?.local_start_time).slice(0, 5),
      message,
    },
  };
}

export async function sendBookingDecisionNotification({ decision, booking, testRecipient, fetchImpl = fetch }) {
  const notification = buildBookingDecisionNotification({ decision, booking, testRecipient });
  if (!notification.recipient) return false;

  try {
    const response = await fetchImpl(`https://formsubmit.co/ajax/${encodeURIComponent(notification.recipient)}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(notification.fields),
    });
    return response.ok;
  } catch {
    return false;
  }
}
