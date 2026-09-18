function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeMode(value) {
  return value === "live" ? "live" : "test";
}

export function buildAcceptanceEmail({ booking, deliveryMode, testRecipient, from }) {
  const mode = normalizeMode(deliveryMode);
  const customerName = clean(booking?.customer_name) || "there";
  const customerEmail = clean(booking?.customer_email);
  const recipient = mode === "live" ? customerEmail : clean(testRecipient);
  const testIntroduction = mode === "test"
    ? `TEST MODE\nIntended customer: ${customerEmail || "No customer email provided"}\n\n`
    : "";
  const greeting = `Hello ${customerName},`;
  const message = "Santa Jim has accepted your booking request. He will contact you with further booking details, including the $50 deposit and payment information.";
  const text = `${testIntroduction}${greeting}\n\n${message}\n\nThank you,\nSanta Jim`;
  const testBanner = mode === "test"
    ? `<p style="padding:12px;background:#fff3cd;color:#664d03"><strong>TEST MODE</strong><br>Intended customer: ${escapeHtml(customerEmail || "No customer email provided")}</p>`
    : "";

  return {
    from: clean(from),
    to: recipient ? [recipient] : [],
    subject: mode === "test" ? "TEST — Santa Jim accepted your booking request" : "Santa Jim accepted your booking request",
    text,
    html: `${testBanner}<p>${escapeHtml(greeting)}</p><p>${escapeHtml(message)}</p><p>Thank you,<br>Santa Jim</p>`,
  };
}

export async function sendAcceptanceEmail({ booking, apiKey, deliveryMode, testRecipient, from, fetchImpl = fetch }) {
  const mode = normalizeMode(deliveryMode);
  const email = buildAcceptanceEmail({ booking, deliveryMode: mode, testRecipient, from });
  const bookingId = clean(booking?.id);
  const recipient = email.to[0] || "";

  if (mode === "test" && recipient && (!clean(apiKey) || !email.from)) {
    try {
      const response = await fetchImpl(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: email.subject,
          _template: "table",
          intendedCustomerName: clean(booking?.customer_name),
          intendedCustomerEmail: clean(booking?.customer_email),
          message: email.text,
        }),
      });
      return {
        sent: response.ok,
        mode,
        recipient,
        provider: "formsubmit",
        error: response.ok ? null : "Acceptance email could not be delivered.",
      };
    } catch {
      return { sent: false, mode, recipient, provider: "formsubmit", error: "Acceptance email could not be delivered." };
    }
  }

  if (!clean(apiKey) || !email.from || !recipient || !bookingId) {
    return { sent: false, mode, recipient, error: "Acceptance email is not configured." };
  }

  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clean(apiKey)}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `santa-booking-accepted/${bookingId}`,
      },
      body: JSON.stringify(email),
    });

    if (!response.ok) return { sent: false, mode, recipient, error: "Acceptance email could not be delivered." };
    const result = await response.json().catch(() => ({}));
    return { sent: true, mode, recipient, provider: "resend", id: clean(result?.id) || null, error: null };
  } catch {
    return { sent: false, mode, recipient, error: "Acceptance email could not be delivered." };
  }
}
