import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { checkoutExpiry, checkoutSessionForm, stripeSignature, verifyStripeSignature } from "../supabase/functions/santa-deposit/stripe.ts";
import { calendarEventBody } from "../supabase/functions/santa-deposit/google-calendar.ts";
import { buildDepositRequestEmail } from "../lib/santa-acceptance-email.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Stripe webhook signatures are verified against the raw body and timestamp", async () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ type: "checkout.session.completed" });
  const nowMs = 1_800_000_000_000;
  const timestamp = String(nowMs / 1000);
  const signature = await stripeSignature(payload, timestamp, secret);

  assert.equal(await verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, { nowMs }), true);
  assert.equal(await verifyStripeSignature(payload, `t=${timestamp},v1=bad,v1=${signature}`, secret, { nowMs }), true);
  assert.equal(await verifyStripeSignature(`${payload} `, `t=${timestamp},v1=${signature}`, secret, { nowMs }), false);
  assert.equal(await verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, "whsec_other", { nowMs }), false);
  assert.equal(await verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, { nowMs: nowMs + 10 * 60 * 1000 }), false);
  assert.equal(await verifyStripeSignature(payload, "", secret, { nowMs }), false);
});

test("checkout sessions end with the date hold, within Stripe's 30 minute to 24 hour window", () => {
  const now = 1_800_000_000_000;
  const hour = 60 * 60 * 1000;
  assert.equal(checkoutExpiry(now + 2 * hour, now), Math.floor((now + 2 * hour) / 1000));
  assert.equal(checkoutExpiry(now + 48 * hour, now), Math.floor((now + 23 * hour) / 1000));
  assert.equal(checkoutExpiry(now + 10 * 60 * 1000, now), null);
});

test("checkout session form charges the deposit in USD and tags the booking", () => {
  const form = checkoutSessionForm({
    bookingId: "booking-1",
    amountCents: 5000,
    productName: "Santa Jim deposit – Home visit",
    description: "Non-refundable deposit",
    customerEmail: "family@example.com",
    successUrl: "https://santa-jim-hope-site.vercel.app/deposit/abc?paid=1",
    cancelUrl: "https://santa-jim-hope-site.vercel.app/deposit/abc",
    expiresAtSeconds: 1_800_000_000,
  });
  assert.equal(form.get("mode"), "payment");
  assert.equal(form.get("line_items[0][price_data][currency]"), "usd");
  assert.equal(form.get("line_items[0][price_data][unit_amount]"), "5000");
  assert.equal(form.get("metadata[booking_id]"), "booking-1");
  assert.equal(form.get("payment_intent_data[metadata][booking_id]"), "booking-1");
  assert.equal(form.get("customer_email"), "family@example.com");
});

test("paid-deposit calendar events carry who, when and where only", () => {
  const event = calendarEventBody({
    id: "11111111-2222-3333-4444-555555555555",
    service_name: "Home visit",
    customer_name: "Jamie Parker",
    event_location: "Gonzales, Louisiana",
    local_date: "2026-12-12",
    local_start_time: "18:30:00",
    local_end_time: "20:00:00",
    deposit_amount_cents: 5000,
  }, "America/Chicago");
  assert.equal(event.summary, "Home visit – Jamie Parker");
  assert.equal(event.location, "Gonzales, Louisiana");
  assert.match(event.description, /6:30 PM – 8:00 PM/);
  assert.match(event.description, /Deposit paid: \$50/);
  assert.deepEqual(event.start, { dateTime: "2026-12-12T18:30:00", timeZone: "America/Chicago" });
});

test("deposit Edge Function keeps contact details out of Google and checks Stripe signatures", async () => {
  const fn = await read("supabase/functions/santa-deposit/index.ts");
  const calendar = await read("supabase/functions/santa-deposit/google-calendar.ts");
  assert.match(fn, /verifyStripeSignature/);
  assert.match(fn, /STRIPE_WEBHOOK_SECRET/);
  assert.match(fn, /checkout\.session\.completed/);
  assert.match(fn, /payment_status !== "paid"/);
  assert.doesNotMatch(calendar, /customer_email|customer_phone|guest_count|booking\.notes/);
});

test("deposit request email links the family to their payment page and says it is non-refundable", () => {
  const email = buildDepositRequestEmail({
    booking: { id: "b1", customer_name: "Jamie Parker", customer_email: "jamie@example.com" },
    depositUrl: "https://santa-jim-hope-site.vercel.app/deposit/abc123",
    amountCents: 5000,
    holdUntil: new Date("2026-12-01T18:00:00Z"),
    deliveryMode: "live",
    testRecipient: "business@example.com",
    from: "Santa Jim <santa@example.com>",
  });
  assert.deepEqual(email.to, ["jamie@example.com"]);
  assert.match(email.text, /\$50 non-refundable deposit/);
  assert.match(email.text, /https:\/\/santa-jim-hope-site\.vercel\.app\/deposit\/abc123/);
  assert.match(email.html, /href="https:\/\/santa-jim-hope-site\.vercel\.app\/deposit\/abc123"/);

  const testEmail = buildDepositRequestEmail({
    booking: { id: "b1", customer_name: "Jamie Parker", customer_email: "jamie@example.com" },
    depositUrl: "https://example.com/deposit/abc123",
    amountCents: 5000,
    holdUntil: new Date("2026-12-01T18:00:00Z"),
    deliveryMode: "test",
    testRecipient: "business@example.com",
    from: "",
  });
  assert.deepEqual(testEmail.to, ["business@example.com"]);
});

test("accepting with a deposit holds the date instead of confirming it", async () => {
  const route = await read("app/api/santa/admin/bookings/route.ts");
  assert.match(route, /body\.status === "deposit"/);
  assert.match(route, /deposit_status: "awaiting"/);
  assert.match(route, /status=eq\.pending&deposit_status=eq\.not_required/);
  assert.match(route, /hold_expires_at: holdUntil/);
});

test("deposit pages are not indexed", async () => {
  const page = await read("app/deposit/[token]/page.tsx");
  const nextConfig = await read("next.config.ts");
  assert.match(page, /robots: \{ index: false, follow: false \}/);
  assert.match(nextConfig, /\/deposit\/:path\*/);
  assert.match(page, /non-refundable/);
});
