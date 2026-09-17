import { NextRequest, NextResponse } from "next/server";
import { buildAvailableSlots, type SantaBookingInterval, type SantaDayRule } from "@/lib/santa-scheduler.mjs";
import { SANTA_SITE_ID } from "@/lib/santa-config";
import { supabaseRest } from "@/lib/santa-supabase";

type StoredDayRule = NonNullable<SantaDayRule> & { date: string };

function trimTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "";
}

function dayMode(value: unknown): StoredDayRule["mode"] {
  return value === "normal" || value === "photos_only" || value === "blocked" || value === "custom"
    ? value
    : "blocked";
}

function bookingStatus(value: unknown): SantaBookingInterval["status"] {
  return value === "pending" || value === "confirmed" || value === "declined" || value === "cancelled" || value === "expired"
    ? value
    : "expired";
}

function windows(value: unknown): Array<{ start: string; end: string }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.start !== "string" || typeof record.end !== "string") return [];
    return [{ start: record.start, end: record.end }];
  });
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const serviceSlug = request.nextUrl.searchParams.get("service") ?? "";
  const encodedSiteId = encodeURIComponent(SANTA_SITE_ID);

  const [settingsResponse, servicesResponse, rulesResponse] = await Promise.all([
    supabaseRest(`santa_schedule_settings?site_id=eq.${encodedSiteId}&select=season_start,season_end,default_start_time,default_end_time,slot_step_minutes,pending_hold_minutes,timezone&limit=1`),
    supabaseRest(`santa_services?site_id=eq.${encodedSiteId}&active=eq.true&select=slug,name,duration_minutes,buffer_minutes,active,sort_order&order=sort_order.asc`),
    supabaseRest(`santa_day_rules?site_id=eq.${encodedSiteId}&select=date,mode,allowed_service_slugs,windows&order=date.asc`),
  ]);

  if (!settingsResponse.ok || !servicesResponse.ok || !rulesResponse.ok) {
    return NextResponse.json({ error: "Availability is temporarily unavailable." }, { status: 503 });
  }

  const settingsRows = await settingsResponse.json() as Array<Record<string, unknown>>;
  const serviceRows = await servicesResponse.json() as Array<Record<string, unknown>>;
  const ruleRows = await rulesResponse.json() as Array<Record<string, unknown>>;
  const rawSettings = settingsRows[0];
  if (!rawSettings) return NextResponse.json({ error: "Schedule is not configured." }, { status: 503 });

  const settings = {
    seasonStart: String(rawSettings.season_start),
    seasonEnd: String(rawSettings.season_end),
    defaultStartTime: trimTime(String(rawSettings.default_start_time)),
    defaultEndTime: trimTime(String(rawSettings.default_end_time)),
    slotStepMinutes: Number(rawSettings.slot_step_minutes),
    pendingHoldMinutes: Number(rawSettings.pending_hold_minutes),
    timezone: String(rawSettings.timezone),
  };
  const services = serviceRows.map((row) => ({
    slug: String(row.slug),
    name: String(row.name),
    durationMinutes: Number(row.duration_minutes),
    bufferMinutes: Number(row.buffer_minutes),
    active: Boolean(row.active),
  }));
  const dayRules: StoredDayRule[] = ruleRows.map((row) => ({
    date: String(row.date),
    mode: dayMode(row.mode),
    allowedServiceSlugs: Array.isArray(row.allowed_service_slugs) ? row.allowed_service_slugs.map(String) : [],
    windows: windows(row.windows),
  }));

  if (!date || !serviceSlug) {
    return NextResponse.json({ settings, services, dayRules });
  }

  const rule = dayRules.find((candidate) => candidate.date === date) ?? null;
  const busyResponse = await supabaseRest(
    `santa_booking_requests?site_id=eq.${encodedSiteId}&local_date=eq.${encodeURIComponent(date)}&select=local_date,local_start_time,local_end_time,local_blocked_until_time,status,hold_expires_at`
  );
  if (!busyResponse.ok) {
    return NextResponse.json({ error: "Availability is temporarily unavailable." }, { status: 503 });
  }
  const busyRows = await busyResponse.json() as Array<Record<string, unknown>>;
  const bookings: SantaBookingInterval[] = busyRows.map((row) => ({
    date: String(row.local_date),
    startTime: trimTime(String(row.local_start_time)),
    endTime: trimTime(String(row.local_blocked_until_time ?? row.local_end_time)),
    status: bookingStatus(row.status),
  }));
  const slots = buildAvailableSlots({ date, serviceSlug, services, settings, rule, bookings });

  return NextResponse.json({ settings, services, dayRules, date, serviceSlug, rule, slots });
}
