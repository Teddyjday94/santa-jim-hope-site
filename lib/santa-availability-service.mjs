import { mergeCalendarBusyIntervals } from "./santa-calendar.mjs";
import { buildAvailableSlots } from "./santa-scheduler.mjs";

function trimTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

function dayMode(value) {
  return value === "normal" || value === "photos_only" || value === "blocked" || value === "custom"
    ? value
    : "blocked";
}

function bookingStatus(value) {
  return value === "pending" || value === "confirmed" || value === "declined" || value === "cancelled" || value === "expired"
    ? value
    : "expired";
}

function windows(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    if (typeof item.start !== "string" || typeof item.end !== "string") return [];
    return [{ start: item.start, end: item.end }];
  });
}

export async function validateBookingAvailability({
  date,
  serviceSlug,
  startTime,
  loadAvailability,
}) {
  const result = await loadAvailability({ date, serviceSlug });
  if (result.status !== 200 || !Array.isArray(result.body?.slots)) {
    return {
      available: false,
      reason: "availability_error",
      error: result.body?.error || "Availability is temporarily unavailable.",
    };
  }

  const slot = result.body.slots.find((candidate) => candidate.startTime === startTime);
  if (!slot) return { available: false, reason: "slot_unavailable" };
  return { available: true, endTime: slot.endTime };
}

export async function loadSantaAvailability({
  date,
  serviceSlug,
  siteId,
  supabaseRest,
  invokeSupabaseFunction,
}) {
  const encodedSiteId = encodeURIComponent(siteId);
  const [settingsResponse, servicesResponse, rulesResponse] = await Promise.all([
    supabaseRest(`santa_schedule_settings?site_id=eq.${encodedSiteId}&select=season_start,season_end,default_start_time,default_end_time,slot_step_minutes,pending_hold_minutes,timezone&limit=1`),
    supabaseRest(`santa_services?site_id=eq.${encodedSiteId}&active=eq.true&select=slug,name,duration_minutes,buffer_minutes,active,sort_order&order=sort_order.asc`),
    supabaseRest(`santa_day_rules?site_id=eq.${encodedSiteId}&select=date,mode,allowed_service_slugs,windows&order=date.asc`),
  ]);

  if (!settingsResponse.ok || !servicesResponse.ok || !rulesResponse.ok) {
    return { status: 503, body: { error: "Availability is temporarily unavailable." } };
  }

  const settingsRows = await settingsResponse.json();
  const serviceRows = await servicesResponse.json();
  const ruleRows = await rulesResponse.json();
  const rawSettings = settingsRows[0];
  if (!rawSettings) {
    return { status: 503, body: { error: "Schedule is not configured." } };
  }

  const settings = {
    seasonStart: String(rawSettings.season_start),
    seasonEnd: String(rawSettings.season_end),
    defaultStartTime: trimTime(rawSettings.default_start_time),
    defaultEndTime: trimTime(rawSettings.default_end_time),
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
  const dayRules = ruleRows.map((row) => ({
    date: String(row.date),
    mode: dayMode(row.mode),
    allowedServiceSlugs: Array.isArray(row.allowed_service_slugs) ? row.allowed_service_slugs.map(String) : [],
    windows: windows(row.windows),
  }));

  if (!date || !serviceSlug) {
    return { status: 200, body: { settings, services, dayRules } };
  }

  const rule = dayRules.find((candidate) => candidate.date === date) ?? null;
  const busyResponse = await supabaseRest(
    `santa_booking_requests?site_id=eq.${encodedSiteId}&local_date=eq.${encodeURIComponent(date)}&select=local_date,local_start_time,local_end_time,local_blocked_until_time,status,hold_expires_at`,
  );
  if (!busyResponse.ok) {
    return { status: 503, body: { error: "Availability is temporarily unavailable." } };
  }

  const busyRows = await busyResponse.json();
  const storedBookings = busyRows.map((row) => ({
    date: String(row.local_date),
    startTime: trimTime(row.local_start_time),
    endTime: trimTime(row.local_blocked_until_time ?? row.local_end_time),
    status: bookingStatus(row.status),
  }));
  const calendarResponse = await invokeSupabaseFunction("santa-calendar-public", { date }).catch(() => null);
  if (!calendarResponse) {
    return { status: 503, body: { error: "Calendar service could not be reached." } };
  }
  const calendarData = await calendarResponse.json().catch(() => ({}));
  if (!calendarResponse.ok) {
    return {
      status: 503,
      body: { error: calendarData.error || "Calendar availability is temporarily unavailable." },
    };
  }

  const bookings = mergeCalendarBusyIntervals(date, storedBookings, calendarData.busy ?? []);
  const slots = buildAvailableSlots({ date, serviceSlug, services, settings, rule, bookings });
  return { status: 200, body: { settings, services, dayRules, date, serviceSlug, rule, slots } };
}
