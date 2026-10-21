// Minimal Stripe helpers for the santa-deposit Edge Function. Plain
// TypeScript with Web Crypto only, so the node test suite can import it.

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

export async function stripeSignature(payload: string, timestamp: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
}

/**
 * Verify a Stripe-Signature header (t=...,v1=...) against the raw body.
 * Rejects stale timestamps so captured requests cannot be replayed.
 */
export async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
  { toleranceSeconds = 300, nowMs = Date.now() }: { toleranceSeconds?: number; nowMs?: number } = {},
) {
  if (!payload || !header || !secret) return false;
  const parts = header.split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1] ?? "";
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value ?? "");
  if (!/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  if (Math.abs(nowMs / 1000 - Number(timestamp)) > toleranceSeconds) return false;
  const expected = await stripeSignature(payload, timestamp, secret);
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

export type DepositCheckout = {
  bookingId: string;
  amountCents: number;
  productName: string;
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  expiresAtSeconds: number;
};

/** Form fields for POST https://api.stripe.com/v1/checkout/sessions. */
export function checkoutSessionForm(checkout: DepositCheckout) {
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(checkout.amountCents),
    "line_items[0][price_data][product_data][name]": checkout.productName,
    "line_items[0][price_data][product_data][description]": checkout.description,
    success_url: checkout.successUrl,
    cancel_url: checkout.cancelUrl,
    client_reference_id: checkout.bookingId,
    "metadata[booking_id]": checkout.bookingId,
    "payment_intent_data[metadata][booking_id]": checkout.bookingId,
    "payment_intent_data[description]": checkout.productName,
    expires_at: String(checkout.expiresAtSeconds),
  });
  if (checkout.customerEmail) form.set("customer_email", checkout.customerEmail);
  return form;
}

/**
 * Stripe Checkout sessions must expire between 30 minutes and 24 hours from
 * now. Ends with the booking hold, capped at 23 hours; null when the hold
 * ends too soon to start a payment.
 */
export function checkoutExpiry(holdExpiresAtMs: number, nowMs = Date.now()) {
  const latest = nowMs + 23 * 60 * 60 * 1000;
  const earliest = nowMs + 31 * 60 * 1000;
  const expires = Math.min(holdExpiresAtMs, latest);
  if (expires < earliest) return null;
  return Math.floor(expires / 1000);
}
