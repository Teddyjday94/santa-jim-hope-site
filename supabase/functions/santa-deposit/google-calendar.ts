// Adds a deposit-paid booking to Santa Jim's Google Calendar. Mirrors the
// event format in santa-calendar-admin: only who, when and where go to
// Google; contact details and notes stay in the Santa Portal.

type Rest = (path: string, init?: RequestInit) => Promise<Response>;

type Connection = {
  calendar_id: string;
  access_token: string;
  refresh_token: string | null;
  access_token_expires_at: string | null;
  granted_scope: string | null;
};

export type CalendarBooking = {
  id: string;
  service_name: string;
  customer_name: string;
  event_location: string;
  local_date: string;
  local_start_time: string;
  local_end_time: string;
  deposit_amount_cents: number | null;
};

export type CalendarResult =
  | { status: "synced"; eventId: string }
  | { status: "not_connected" }
  | { status: "error"; error: string };

function timeLabel(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minuteText} ${hour >= 12 ? "PM" : "AM"}`;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T12:00:00Z`));
}

export function googleEventId(bookingId: string) {
  return `santa${bookingId.replaceAll("-", "").toLowerCase()}`;
}

export function calendarEventBody(booking: CalendarBooking, timezone: string) {
  const start = booking.local_start_time.slice(0, 5);
  const end = booking.local_end_time.slice(0, 5);
  const customer = booking.customer_name.trim() || "Guest";
  const location = booking.event_location.trim();
  const deposit = booking.deposit_amount_cents ? `$${(booking.deposit_amount_cents / 100).toFixed(2).replace(/\.00$/, "")}` : "";
  const description = [
    `${booking.service_name} for ${customer}`,
    `When: ${dateLabel(booking.local_date)}, ${timeLabel(start)} – ${timeLabel(end)}`,
    location ? `Where: ${location}` : null,
    deposit ? `Deposit paid: ${deposit}` : null,
    "",
    "Contact details and notes are in the Santa Portal.",
    `Booking reference: ${booking.id}`,
  ].filter((line) => line !== null).join("\n");

  return {
    id: googleEventId(booking.id),
    summary: `${booking.service_name} – ${customer}`,
    description,
    ...(location ? { location } : {}),
    start: { dateTime: `${booking.local_date}T${start}:00`, timeZone: timezone },
    end: { dateTime: `${booking.local_date}T${end}:00`, timeZone: timezone },
  };
}

async function accessToken(rest: Rest, siteId: string, connection: Connection) {
  const expiresAt = connection.access_token_expires_at ? Date.parse(connection.access_token_expires_at) : 0;
  if (connection.access_token && expiresAt > Date.now() + 120_000) return connection.access_token;

  const clientId = Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET") ?? "";
  if (!clientId || !clientSecret || !connection.refresh_token) throw new Error("Google Calendar needs to be reconnected.");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const token = await tokenResponse.json().catch(() => ({})) as { access_token?: string; expires_in?: number; scope?: string; error_description?: string };
  if (!tokenResponse.ok || !token.access_token) throw new Error(token.error_description || "Google Calendar access could not be refreshed.");

  await rest(`santa_google_calendar_connections?site_id=eq.${siteId}`, {
    method: "PATCH",
    body: JSON.stringify({
      access_token: token.access_token,
      access_token_expires_at: new Date(Date.now() + Number(token.expires_in ?? 3600) * 1000).toISOString(),
      granted_scope: token.scope ?? connection.granted_scope,
      updated_at: new Date().toISOString(),
    }),
  });
  return token.access_token;
}

export async function addBookingToCalendar(rest: Rest, siteId: string, booking: CalendarBooking, timezone: string): Promise<CalendarResult> {
  try {
    const connectionResponse = await rest(
      `santa_google_calendar_connections?site_id=eq.${siteId}&select=calendar_id,access_token,refresh_token,access_token_expires_at,granted_scope&limit=1`,
    );
    if (!connectionResponse.ok) throw new Error("Calendar connection could not be loaded.");
    const connection = (await connectionResponse.json() as Connection[])[0];
    if (!connection) return { status: "not_connected" };

    const token = await accessToken(rest, siteId, connection);
    const calendarId = encodeURIComponent(connection.calendar_id || "primary");
    const body = calendarEventBody(booking, timezone);
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=none`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    // 409 means this booking's event already exists (Stripe retried the webhook).
    if (response.status === 409) return { status: "synced", eventId: body.id };
    const result = await response.json().catch(() => ({})) as { id?: string; error?: { message?: string } };
    if (!response.ok || !result.id) throw new Error(result.error?.message || "The Google Calendar event could not be created.");
    return { status: "synced", eventId: result.id };
  } catch (error) {
    return { status: "error", error: error instanceof Error ? error.message : "Google Calendar could not be updated." };
  }
}
