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

function moneyLabel(cents) {
  return `$${(Number(cents) / 100).toFixed(2).replace(/\.00$/, "")}`;
}

function holdLabel(holdUntil) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  }).format(holdUntil);
}

export function buildDepositRequestEmail({ booking, depositUrl, amountCents, holdUntil, deliveryMode, testRecipient, from }) {
  const mode = normalizeMode(deliveryMode);
  const customerName = clean(booking?.customer_name) || "there";
  const customerEmail = clean(booking?.customer_email);
  const recipient = mode === "live" ? customerEmail : clean(testRecipient);
  const amount = moneyLabel(amountCents);
  const testIntroduction = mode === "test"
    ? `TEST MODE\nIntended customer: ${customerEmail || "No customer email provided"}\n\n`
    : "";
  const greeting = `Hello ${customerName},`;
  const message = `Santa Jim has accepted your booking request. To lock in your date, please pay the ${amount} non-refundable deposit. Your date is held until ${holdLabel(holdUntil)}.`;
  const text = `${testIntroduction}${greeting}\n\n${message}\n\nPay your deposit: ${depositUrl}\n\nThank you,\nSanta Jim`;
  const testBanner = mode === "test"
    ? `<p style="padding:12px;background:#fff3cd;color:#664d03"><strong>TEST MODE</strong><br>Intended customer: ${escapeHtml(customerEmail || "No customer email provided")}</p>`
    : "";

  return {
    from: clean(from),
    to: recipient ? [recipient] : [],
    subject: mode === "test" ? "TEST — Santa Jim accepted: please pay your deposit" : "Santa Jim accepted: please pay your deposit",
    text,
    html: `${testBanner}<p>${escapeHtml(greeting)}</p><p>${escapeHtml(message)}</p><p><a href="${escapeHtml(depositUrl)}">Pay your ${escapeHtml(amount)} deposit</a></p><p>Thank you,<br>Santa Jim</p>`,
  };
}

export async function sendDepositRequestEmail({ booking, depositUrl, amountCents, holdUntil, apiKey, deliveryMode, testRecipient, from, fetchImpl = fetch }) {
  const email = buildDepositRequestEmail({ booking, depositUrl, amountCents, holdUntil, deliveryMode, testRecipient, from });
  return deliverBookingEmail({ email, booking, apiKey, deliveryMode, idempotencyKey: `santa-deposit-request/${clean(booking?.id)}`, fetchImpl });
}

export async function sendAcceptanceEmail({ booking, apiKey, deliveryMode, testRecipient, from, fetchImpl = fetch }) {
  const email = buildAcceptanceEmail({ booking, deliveryMode, testRecipient, from });
  return deliverBookingEmail({ email, booking, apiKey, deliveryMode, idempotencyKey: `santa-booking-accepted/${clean(booking?.id)}`, fetchImpl });
}

async function deliverBookingEmail({ email, booking, apiKey, deliveryMode, idempotencyKey, fetchImpl }) {
  const mode = normalizeMode(deliveryMode);
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
        "Idempotency-Key": idempotencyKey,
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
