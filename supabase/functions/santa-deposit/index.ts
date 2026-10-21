import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { checkoutExpiry, checkoutSessionForm, verifyStripeSignature } from "./stripe.ts";
import { addBookingToCalendar } from "./google-calendar.ts";

// Public deposit flow for accepted Santa Jim bookings. Deployed with
// verify_jwt off: families reach it through the site's /deposit page with a
// per-booking token, and Stripe reaches it as a signed webhook.
const SANTA_SITE_ID = "a0d14a7f-7e08-4042-a6c9-0f83c03eefb3";
export {};

type BookingRow = {
  id: string;
  service_slug: string;
  customer_name: string;
  customer_email: string;
  event_location: string;
  local_date: string;
  local_start_time: string;
  local_end_time: string;
  status: string;
  hold_expires_at: string | null;
  deposit_status: string;
  deposit_amount_cents: number | null;
  calendar_sync_status: string;
};

const BOOKING_FIELDS = "id,service_slug,customer_name,customer_email,event_location,local_date,local_start_time,local_end_time,status,hold_expires_at,deposit_status,deposit_amount_cents,calendar_sync_status";
const TOKEN_PATTERN = /^[a-f0-9]{48,96}$/;
const ALLOWED_ORIGINS = [
  /^https:\/\/santa-jim-hope-site(?:-[a-z0-9-]+)?\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/,
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function envKey(name: string, legacyName: string) {
  const raw = Deno.env.get(name);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed.default) return parsed.default;
    } catch {
      // Fall through to the legacy key while projects migrate key formats.
    }
  }
  return Deno.env.get(legacyName) ?? "";
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const secretKey = envKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const extraOrigin = Deno.env.get("SANTA_SITE_ORIGIN") ?? "";

async function rest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("apikey", secretKey);
  if (secretKey.startsWith("eyJ")) headers.set("Authorization", `Bearer ${secretKey}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${supabaseUrl}/rest/v1/${path}`, { ...init, headers });
}

function originAllowed(origin: string) {
  return origin === extraOrigin || ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
}

async function serviceName(slug: string) {
  const response = await rest(`santa_services?site_id=eq.${SANTA_SITE_ID}&slug=eq.${encodeURIComponent(slug)}&select=name&limit=1`);
  const rows = response.ok ? await response.json() as Array<{ name?: string }> : [];
  return rows[0]?.name || slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

async function bookingBy(filter: string) {
  const response = await rest(`santa_booking_requests?${filter}&site_id=eq.${SANTA_SITE_ID}&select=${BOOKING_FIELDS}&limit=1`);
  if (!response.ok) throw new Error("Booking could not be loaded.");
  return (await response.json() as BookingRow[])[0] ?? null;
}

/** What the family sees: awaiting, expired, paid, or closed. */
function depositState(booking: BookingRow, nowMs = Date.now()) {
  if (booking.deposit_status === "paid") return "paid";
  if (booking.status === "confirmed") return "confirmed";
  if (booking.status !== "pending" || booking.deposit_status !== "awaiting") return booking.status === "expired" ? "expired" : "closed";
  if (!booking.hold_expires_at || Date.parse(booking.hold_expires_at) <= nowMs) return "expired";
  return "awaiting";
}

async function lookup(token: string) {
  const booking = await bookingBy(`deposit_token=eq.${token}`);
  if (!booking) return json({ error: "This deposit link was not found." }, 404);
  return json({
    state: depositState(booking),
    serviceName: await serviceName(booking.service_slug),
    customerName: booking.customer_name,
    eventLocation: booking.event_location,
    date: booking.local_date,
    startTime: booking.local_start_time.slice(0, 5),
    endTime: booking.local_end_time.slice(0, 5),
    amountCents: booking.deposit_amount_cents,
    holdExpiresAt: booking.hold_expires_at,
  });
}

async function checkout(token: string, origin: string) {
  if (!stripeSecretKey) return json({ error: "Online deposits are not set up yet. Please contact Santa Jim." }, 503);
  if (!originAllowed(origin)) return json({ error: "Invalid return address." }, 400);

  const booking = await bookingBy(`deposit_token=eq.${token}`);
  if (!booking) return json({ error: "This deposit link was not found." }, 404);
  const state = depositState(booking);
  if (state !== "awaiting") return json({ error: "This deposit can no longer be paid online.", state }, 409);
  const expiresAtSeconds = checkoutExpiry(Date.parse(booking.hold_expires_at ?? ""));
  if (!expiresAtSeconds || !booking.deposit_amount_cents) {
    return json({ error: "Your date hold is about to end. Please contact Santa Jim to finish booking.", state: "expired" }, 409);
  }

  const name = await serviceName(booking.service_slug);
  const form = checkoutSessionForm({
    bookingId: booking.id,
    amountCents: booking.deposit_amount_cents,
    productName: `Santa Jim deposit – ${name}`,
    description: `Non-refundable deposit for ${booking.local_date}. The rest is due on the day of the event.`,
    customerEmail: booking.customer_email,
    successUrl: `${origin}/deposit/${token}?paid=1`,
    cancelUrl: `${origin}/deposit/${token}`,
    expiresAtSeconds,
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${stripeSecretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const session = await response.json().catch(() => ({})) as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.url || !session.id) {
    console.error("Stripe checkout failed", session.error?.message);
    return json({ error: "The payment page could not be opened. Please try again." }, 502);
  }
  await rest(`santa_booking_requests?id=eq.${booking.id}&site_id=eq.${SANTA_SITE_ID}`, {
    method: "PATCH",
    body: JSON.stringify({ stripe_checkout_session_id: session.id }),
  });
  return json({ url: session.url });
}

async function patchBooking(id: string, filter: string, fields: Record<string, unknown>) {
  return rest(`santa_booking_requests?id=eq.${id}&site_id=eq.${SANTA_SITE_ID}${filter}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(fields),
  });
}

/** Record the payment, confirm the booking and add it to Google Calendar. */
async function confirmPaidBooking(bookingId: string, session: { id?: string; payment_intent?: string | null }) {
  const booking = await bookingBy(`id=eq.${encodeURIComponent(bookingId)}`);
  if (!booking) {
    console.error("Paid deposit for unknown booking", bookingId);
    return;
  }

  if (booking.deposit_status !== "paid") {
    const paid = await patchBooking(booking.id, "", {
      deposit_status: "paid",
      deposit_paid_at: new Date().toISOString(),
      stripe_checkout_session_id: session.id ?? null,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    });
    if (!paid.ok) throw new Error("The deposit payment could not be recorded.");
  }

  if (booking.status === "confirmed") return;
  if (booking.status !== "pending" && booking.status !== "expired") {
    await patchBooking(booking.id, "", {
      calendar_sync_error: `A deposit was paid after this request was ${booking.status}. Review it in Stripe and refund if needed.`,
    });
    return;
  }

  const confirmed = await patchBooking(booking.id, `&status=eq.${booking.status}`, {
    status: "confirmed",
    calendar_sync_status: "pending",
    calendar_sync_error: null,
  });
  const rows = confirmed.ok ? await confirmed.json() as BookingRow[] : [];
  if (!rows[0]) {
    // Usually the hold had expired and someone else took the time.
    await patchBooking(booking.id, "", {
      calendar_sync_error: "The deposit was paid, but the booking could not be confirmed automatically (the time may have been taken). Review it and contact the family.",
    });
    return;
  }

  const settingsResponse = await rest(`santa_schedule_settings?site_id=eq.${SANTA_SITE_ID}&select=timezone&limit=1`);
  const settingsRows = settingsResponse.ok ? await settingsResponse.json() as Array<{ timezone?: string }> : [];
  const calendar = await addBookingToCalendar(rest, SANTA_SITE_ID, {
    id: booking.id,
    service_name: await serviceName(booking.service_slug),
    customer_name: booking.customer_name,
    event_location: booking.event_location,
    local_date: booking.local_date,
    local_start_time: rows[0].local_start_time,
    local_end_time: rows[0].local_end_time,
    deposit_amount_cents: booking.deposit_amount_cents,
  }, settingsRows[0]?.timezone || "America/Chicago");

  await patchBooking(booking.id, "", calendar.status === "synced"
    ? { google_event_id: calendar.eventId, calendar_sync_status: "synced", calendar_sync_error: null }
    : calendar.status === "not_connected"
      ? { calendar_sync_status: "not_connected", calendar_sync_error: null }
      : { calendar_sync_status: "error", calendar_sync_error: calendar.error });
}

async function webhook(request: Request) {
  const payload = await request.text();
  const valid = await verifyStripeSignature(payload, request.headers.get("stripe-signature") ?? "", stripeWebhookSecret);
  if (!valid) return json({ error: "Invalid signature." }, 400);

  const event = JSON.parse(payload) as {
    type?: string;
    data?: { object?: { id?: string; payment_status?: string; payment_intent?: string | null; metadata?: { booking_id?: string } } };
  };
  const session = event.data?.object;
  const paidEvent = event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
  const bookingId = session?.metadata?.booking_id ?? "";
  if (!paidEvent || session?.payment_status !== "paid" || !bookingId) return json({ received: true, ignored: true });

  // Throwing returns 500, so Stripe retries until the payment is recorded.
  await confirmPaidBooking(bookingId, session);
  return json({ received: true });
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!supabaseUrl || !secretKey) return json({ error: "Deposit backend is not configured." }, 503);

  try {
    if (request.headers.has("stripe-signature")) return await webhook(request);

    const body = await request.json().catch(() => ({})) as { action?: string; token?: string; origin?: string };
    const token = String(body.token ?? "");
    if (!TOKEN_PATTERN.test(token)) return json({ error: "This deposit link was not found." }, 404);
    if (body.action === "lookup") return await lookup(token);
    if (body.action === "checkout") return await checkout(token, String(body.origin ?? ""));
    return json({ error: "Unknown deposit action." }, 400);
  } catch (error) {
    console.error("santa-deposit failed", error instanceof Error ? error.message : error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
