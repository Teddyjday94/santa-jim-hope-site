import { NextRequest, NextResponse } from "next/server";
import { SANTA_SITE_ID } from "@/lib/santa-config";
import { assertSantaAdmin, bearerToken, supabaseRest } from "@/lib/santa-supabase";

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
    `santa_booking_requests?site_id=eq.${SANTA_SITE_ID}&select=id,service_slug,customer_name,customer_email,customer_phone,event_location,guest_count,notes,local_date,local_start_time,local_end_time,status,hold_expires_at,calendar_sync_status,created_at&order=local_date.asc,local_start_time.asc`,
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

  const response = await supabaseRest(
    `santa_booking_requests?id=eq.${encodeURIComponent(body.id)}&site_id=eq.${SANTA_SITE_ID}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: body.status }),
    },
    token,
  );
  if (!response.ok) {
    const detail = await response.text();
    const conflict = detail.includes("23P01") || detail.toLowerCase().includes("overlap");
    return NextResponse.json({ error: conflict ? "That booking conflicts with another active request." : "Could not update the request." }, { status: conflict ? 409 : 502 });
  }
  const updated = await response.json() as BookingRecord[];
  return NextResponse.json({ booking: updated[0] ?? null });
}
