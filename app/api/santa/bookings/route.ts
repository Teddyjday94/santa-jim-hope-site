import { NextRequest, NextResponse } from "next/server";
import { SANTA_SITE_ID, SANTA_TEST_NOTIFICATION_EMAIL } from "@/lib/santa-config";
import { supabaseRpc } from "@/lib/santa-supabase";

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

  const availabilityUrl = new URL("/api/santa/availability", request.url);
  availabilityUrl.searchParams.set("date", payload.p_local_date);
  availabilityUrl.searchParams.set("service", payload.p_service_slug);
  const availabilityResponse = await fetch(availabilityUrl, { cache: "no-store" });
  const availability = await availabilityResponse.json().catch(() => ({})) as { slots?: Array<{ startTime: string; endTime: string }> };
  if (!availabilityResponse.ok || !availability.slots?.some((slot) => slot.startTime === payload.p_local_start_time)) {
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
