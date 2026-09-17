import { NextRequest, NextResponse } from "next/server";
import { SANTA_SITE_ID } from "@/lib/santa-config";
import { assertSantaAdmin, bearerToken, invokeSupabaseFunction, supabaseRest } from "@/lib/santa-supabase";

type BookingRecord = Record<string, unknown>;

async function authorize(request: NextRequest) {
  const token = bearerToken(request);
  const { authorized, user } = await assertSantaAdmin(token);
  return { token, authorized, user };
}

export async function GET(request: NextRequest) {
  const { token, authorized } = await authorize(request);
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const response = await supabaseRest(
    `santa_booking_requests?site_id=eq.${SANTA_SITE_ID}&select=id,service_slug,customer_name,customer_email,customer_phone,event_location,guest_count,notes,local_date,local_start_time,local_end_time,status,hold_expires_at,calendar_sync_status,calendar_sync_error,google_event_id,created_at&order=local_date.asc,local_start_time.asc`,
    {},
    token,
  );
  if (!response.ok) return NextResponse.json({ error: "Could not load booking requests." }, { status: 502 });
  const bookings = await response.json() as BookingRecord[];
  return NextResponse.json({ bookings });
}

export async function PATCH(request: NextRequest) {
  const { token, authorized } = await authorize(request);
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { id?: string; status?: string } | null;
  if (!body?.id || !["confirmed", "declined"].includes(body.status ?? "")) {
    return NextResponse.json({ error: "Invalid booking update." }, { status: 400 });
  }

  const bookingPath = `santa_booking_requests?id=eq.${encodeURIComponent(body.id)}&site_id=eq.${SANTA_SITE_ID}`;

  if (body.status === "declined") {
    const response = await supabaseRest(`${bookingPath}&status=eq.pending`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "declined" }),
    }, token);
    if (!response.ok) return NextResponse.json({ error: "Could not decline the request." }, { status: 502 });
    const updated = await response.json() as BookingRecord[];
    if (updated[0]) return NextResponse.json({ booking: updated[0], warning: null });
    return NextResponse.json({ error: "This request is no longer pending." }, { status: 409 });
  }

  const claimResponse = await supabaseRest(
    `${bookingPath}&status=eq.pending&calendar_sync_status=in.(not_connected,error)`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ calendar_sync_status: "pending", calendar_sync_error: null }),
    },
    token,
  );
  if (!claimResponse.ok) return NextResponse.json({ error: "Could not claim the booking request for confirmation." }, { status: 502 });
  const claimed = await claimResponse.json() as BookingRecord[];
  if (!claimed[0]) {
    const currentResponse = await supabaseRest(`${bookingPath}&select=id,status,calendar_sync_status,google_event_id`, {}, token);
    const currentRows = currentResponse.ok ? await currentResponse.json() as BookingRecord[] : [];
    if (currentRows[0]?.status === "confirmed") {
      return NextResponse.json({ booking: currentRows[0], warning: null });
    }
    return NextResponse.json({ error: "This request is already being processed or is no longer pending." }, { status: 409 });
  }

  const calendarResponse = await invokeSupabaseFunction("santa-calendar-admin", {
    action: "create-event",
    bookingId: body.id,
  }, token).catch(() => null);
  const calendarResult = calendarResponse
    ? await calendarResponse.json().catch(() => ({})) as {
      connected?: boolean;
      conflict?: boolean;
      eventId?: string;
      error?: string;
    }
    : { error: "Calendar service could not be reached." };
  const typedCalendarResult = calendarResult as {
    connected?: boolean;
    conflict?: boolean;
    eventId?: string;
    error?: string;
  };

  if (typedCalendarResult.conflict) {
    const message = typedCalendarResult.error || "Google Calendar is busy during that requested time.";
    await supabaseRest(`${bookingPath}&status=eq.pending&calendar_sync_status=eq.pending`, {
      method: "PATCH",
      body: JSON.stringify({ calendar_sync_status: "error", calendar_sync_error: message }),
    }, token);
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const calendarFields: Record<string, string | null> = {};
  let calendarWarning: string | null = null;
  if (calendarResponse?.ok && typedCalendarResult.eventId) {
    calendarFields.google_event_id = typedCalendarResult.eventId;
    calendarFields.calendar_sync_status = "synced";
    calendarFields.calendar_sync_error = null;
  } else if (typedCalendarResult.connected === false) {
    calendarFields.calendar_sync_status = "not_connected";
    calendarFields.calendar_sync_error = null;
  } else {
    calendarWarning = typedCalendarResult.error || "The request was accepted, but Google Calendar could not be updated.";
    calendarFields.calendar_sync_status = "error";
    calendarFields.calendar_sync_error = calendarWarning;
  }

  const response = await supabaseRest(
    `${bookingPath}&status=eq.pending&calendar_sync_status=eq.pending`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "confirmed", ...calendarFields }),
    },
    token,
  );
  const updated = response.ok ? await response.json() as BookingRecord[] : [];
  if (!response.ok || !updated[0]) {
    let rollbackWarning: string | null = null;
    if (typedCalendarResult.eventId) {
      const rollbackResponse = await invokeSupabaseFunction("santa-calendar-admin", {
        action: "rollback-event",
        bookingId: body.id,
      }, token).catch(() => null);
      if (!rollbackResponse?.ok) {
        rollbackWarning = `Calendar event ${typedCalendarResult.eventId} may require manual cleanup for booking ${body.id}.`;
        await supabaseRest(bookingPath, {
          method: "PATCH",
          body: JSON.stringify({ calendar_sync_status: "error", calendar_sync_error: rollbackWarning }),
        }, token).catch(() => undefined);
      }
    }
    return NextResponse.json({
      error: rollbackWarning || "Could not finalize the booking confirmation.",
      eventId: rollbackWarning ? typedCalendarResult.eventId : null,
    }, { status: 502 });
  }

  return NextResponse.json({ booking: updated[0], warning: calendarWarning });
}
