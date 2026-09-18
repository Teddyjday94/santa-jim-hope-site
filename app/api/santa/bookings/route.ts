import { NextRequest, NextResponse } from "next/server";
import { loadSantaAvailability, validateBookingAvailability } from "@/lib/santa-availability-service.mjs";
import { SANTA_SITE_ID, SANTA_TEST_NOTIFICATION_EMAIL } from "@/lib/santa-config";
import { invokeSupabaseFunction, supabaseRest, supabaseRpc } from "@/lib/santa-supabase";

const FORM_ENDPOINT = `https://formsubmit.co/ajax/${SANTA_TEST_NOTIFICATION_EMAIL}`;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (text(body._honey)) return NextResponse.json({ success: true });

  const payload = {
    p_site_id: SANTA_SITE_ID,
    p_service_slug: text(body.serviceSlug || body.eventType),
    p_local_date: text(body.preferredDate),
    p_local_start_time: text(body.startTime),
    p_customer_name: text(body.name),
    p_customer_email: text(body.email),
    p_customer_phone: text(body.phone),
    p_event_location: text(body.location),
    p_guest_count: body.guestCount ? Number(body.guestCount) : null,
    p_notes: text(body.notes),
  };

  if (!payload.p_service_slug || !payload.p_local_date || !payload.p_local_start_time || !payload.p_customer_name || !payload.p_customer_email || !payload.p_event_location) {
    return NextResponse.json({ error: "Complete the required booking fields." }, { status: 400 });
  }

  const availability = await validateBookingAvailability({
    date: payload.p_local_date,
    serviceSlug: payload.p_service_slug,
    startTime: payload.p_local_start_time,
    loadAvailability: ({ date, serviceSlug }) => loadSantaAvailability({
      date,
      serviceSlug,
      siteId: SANTA_SITE_ID,
      supabaseRest,
      invokeSupabaseFunction,
    }),
  });
  if (!availability.available && availability.reason === "availability_error") {
    return NextResponse.json(
      { error: availability.error || "Availability is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
  if (!availability.available) {
    return NextResponse.json({ error: "That time is no longer available. Please choose another." }, { status: 409 });
  }

  const bookingResponse = await supabaseRpc("create_santa_booking", payload);
  if (!bookingResponse.ok) {
    const detail = await bookingResponse.text();
    const conflict = bookingResponse.status === 409 || detail.includes("23P01") || detail.toLowerCase().includes("overlap");
    return NextResponse.json(
      { error: conflict ? "That time was just requested by someone else. Please choose another." : "We could not save your request. Please try again." },
      { status: conflict ? 409 : 502 },
    );
  }

  let notificationSent = false;
  try {
    const notification = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        _subject: "TEST — New Santa Jim scheduler request",
        _template: "table",
        _replyto: payload.p_customer_email,
        name: payload.p_customer_name,
        email: payload.p_customer_email,
        phone: payload.p_customer_phone,
        service: payload.p_service_slug,
        date: payload.p_local_date,
        startTime: payload.p_local_start_time,
        location: payload.p_event_location,
        guestCount: payload.p_guest_count ?? "",
        notes: payload.p_notes,
      }),
    });
    notificationSent = notification.ok;
  } catch {
    notificationSent = false;
  }

  const status = "pending";
  return NextResponse.json({ success: true, status, notificationSent }, { status: 201 });
}
