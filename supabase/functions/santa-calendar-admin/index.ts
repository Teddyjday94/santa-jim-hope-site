import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SANTA_SITE_ID = "a0d14a7f-7e08-4042-a6c9-0f83c03eefb3";
export {};
const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type JsonRecord = Record<string, unknown>;
type Connection = {
  site_id: string;
  calendar_id: string;
  access_token: string;
  refresh_token: string | null;
  access_token_expires_at: string | null;
  granted_scope: string | null;
  connected_at: string;
  last_sync_at: string | null;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
const publishableKey = envKey("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");

function backendHeaders(init?: HeadersInit) {
  const headers = new Headers(init);
  headers.set("apikey", secretKey);
  if (secretKey.startsWith("eyJ")) headers.set("Authorization", `Bearer ${secretKey}`);
  return headers;
}

async function rest(path: string, init: RequestInit = {}) {
  const headers = backendHeaders(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${supabaseUrl}/rest/v1/${path}`, { ...init, headers });
}

async function getUser(req: Request) {
  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ") || !publishableKey) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: authorization },
  });
  if (!response.ok) return null;
  return response.json() as Promise<{ id: string; email?: string }>;
}

async function isAuthorized(userId: string) {
  const encodedUser = encodeURIComponent(userId);
  const [profileResponse, membershipResponse] = await Promise.all([
    rest(`profiles?user_id=eq.${encodedUser}&select=role&limit=1`),
    rest(`site_members?user_id=eq.${encodedUser}&site_id=eq.${SANTA_SITE_ID}&select=site_id&limit=1`),
  ]);
  const profiles = profileResponse.ok ? await profileResponse.json() as Array<{ role?: string }> : [];
  const memberships = membershipResponse.ok ? await membershipResponse.json() as Array<{ site_id?: string }> : [];
  return profiles[0]?.role === "admin" || memberships.length > 0;
}

function googleCredentials() {
  return {
    clientId: Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID") ?? "",
    clientSecret: Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET") ?? "",
  };
}

async function loadConnection() {
  const response = await rest(
    `santa_google_calendar_connections?site_id=eq.${SANTA_SITE_ID}&select=site_id,calendar_id,access_token,refresh_token,access_token_expires_at,granted_scope,connected_at,last_sync_at&limit=1`,
  );
  if (!response.ok) throw new Error("Calendar connection could not be loaded.");
  const rows = await response.json() as Connection[];
  return rows[0] ?? null;
}

async function refreshAccessToken(connection: Connection) {
  const expiresAt = connection.access_token_expires_at ? Date.parse(connection.access_token_expires_at) : 0;
  if (connection.access_token && expiresAt > Date.now() + 120_000) return connection;

  const { clientId, clientSecret } = googleCredentials();
  if (!clientId || !clientSecret || !connection.refresh_token) {
    throw new Error("Google Calendar needs to be reconnected.");
  }

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
  const token = await tokenResponse.json().catch(() => ({})) as {
    access_token?: string;
    expires_in?: number;
    scope?: string;
    error_description?: string;
  };
  if (!tokenResponse.ok || !token.access_token) {
    throw new Error(token.error_description || "Google Calendar access could not be refreshed.");
  }

  const expires = new Date(Date.now() + Number(token.expires_in ?? 3600) * 1000).toISOString();
  const updateResponse = await rest(`santa_google_calendar_connections?site_id=eq.${SANTA_SITE_ID}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      access_token: token.access_token,
      access_token_expires_at: expires,
      granted_scope: token.scope ?? connection.granted_scope,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!updateResponse.ok) throw new Error("Refreshed Calendar access could not be stored.");
  const updated = await updateResponse.json() as Connection[];
  return updated[0] ?? { ...connection, access_token: token.access_token, access_token_expires_at: expires };
}

function offsetForDate(date: string, timezone: string) {
  const probe = new Date(`${date}T12:00:00Z`);
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  }).formatToParts(probe).find((item) => item.type === "timeZoneName")?.value ?? "GMT-06:00";
  if (part === "GMT") return "+00:00";
  return part.replace("GMT", "");
}

async function hasGoogleConflict(connection: Connection, booking: Record<string, unknown>, timezone: string) {
  const date = String(booking.local_date);
  const start = String(booking.local_start_time).slice(0, 5);
  const blockedUntil = String(booking.local_blocked_until_time ?? booking.local_end_time).slice(0, 5);
  const offset = offsetForDate(date, timezone);
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: `${date}T${start}:00${offset}`,
      timeMax: `${date}T${blockedUntil}:00${offset}`,
      timeZone: timezone,
      items: [{ id: connection.calendar_id || "primary" }],
    }),
  });
  if (!response.ok) throw new Error("Google Calendar availability could not be checked.");
  const result = await response.json() as { calendars?: Record<string, { busy?: unknown[] }> };
  const first = Object.values(result.calendars ?? {})[0];
  return Array.isArray(first?.busy) && first.busy.length > 0;
}

function googleEventId(bookingId: string) {
  return `santa${bookingId.replaceAll("-", "").toLowerCase()}`;
}

async function existingEvent(connection: Connection, eventId: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(connection.calendar_id || "primary")}/events/${eventId}`,
    { headers: { Authorization: `Bearer ${connection.access_token}` } },
  );
  if (response.status === 404 || response.status === 410) return null;
  const result = await response.json().catch(() => ({})) as { id?: string; htmlLink?: string; error?: { message?: string } };
  if (!response.ok) throw new Error(result.error?.message || "The Calendar event could not be checked.");
  return result;
}

async function createEvent(connection: Connection, booking: Record<string, unknown>, timezone: string) {
  const eventId = googleEventId(String(booking.id));
  const existing = await existingEvent(connection, eventId);
  if (existing?.id) return { conflict: false as const, eventId: existing.id, htmlLink: existing.htmlLink ?? null };

  if (await hasGoogleConflict(connection, booking, timezone)) {
    return { conflict: true as const };
  }

  const date = String(booking.local_date);
  const start = String(booking.local_start_time).slice(0, 5);
  const end = String(booking.local_end_time).slice(0, 5);
  const service = String(booking.service_slug).split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const description = `Santa Jim scheduler booking reference: ${String(booking.id)}`;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(connection.calendar_id || "primary")}/events?sendUpdates=none`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: eventId,
        summary: `Santa Jim — ${service}`,
        description,
        start: { dateTime: `${date}T${start}:00`, timeZone: timezone },
        end: { dateTime: `${date}T${end}:00`, timeZone: timezone },
      }),
    },
  );
  const result = await response.json().catch(() => ({})) as { id?: string; htmlLink?: string; error?: { message?: string } };
  if (response.status === 409) {
    const duplicate = await existingEvent(connection, eventId);
    if (duplicate?.id) return { conflict: false as const, eventId: duplicate.id, htmlLink: duplicate.htmlLink ?? null };
  }
  if (!response.ok || !result.id) throw new Error(result.error?.message || "The Google Calendar event could not be created.");
  return { conflict: false as const, eventId: result.id, htmlLink: result.htmlLink ?? null };
}

async function deleteEvent(connection: Connection, eventId: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(connection.calendar_id || "primary")}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${connection.access_token}` } },
  );
  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error("The Calendar event could not be removed.");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!supabaseUrl || !secretKey || !publishableKey) return json({ error: "Calendar backend is not configured." }, 503);

  const user = await getUser(req);
  if (!user || !(await isAuthorized(user.id))) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({})) as JsonRecord;
  const action = String(body.action ?? "status");
  const { clientId, clientSecret } = googleCredentials();
  const configured = Boolean(clientId && clientSecret);

  try {
    if (action === "status") {
      const connection = await loadConnection();
      return json({
        configured,
        connected: Boolean(connection),
        calendarId: connection?.calendar_id ?? null,
        connectedAt: connection?.connected_at ?? null,
        lastSyncAt: connection?.last_sync_at ?? null,
      });
    }

    if (action === "auth-url") {
      if (!configured) return json({ error: "Google Calendar OAuth credentials have not been added yet.", configured: false }, 503);
      const redirectUri = String(body.redirectUri ?? "");
      if (!/^https:\/\//.test(redirectUri) && !/^http:\/\/localhost(?::\d+)?\//.test(redirectUri)) {
        return json({ error: "A valid Calendar redirect URL is required." }, 400);
      }
      const state = crypto.randomUUID();
      await rest(`santa_google_oauth_states?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, { method: "DELETE" });
      const stateResponse = await rest("santa_google_oauth_states", {
        method: "POST",
        body: JSON.stringify({
          state,
          site_id: SANTA_SITE_ID,
          user_id: user.id,
          redirect_uri: redirectUri,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        }),
      });
      if (!stateResponse.ok) return json({ error: "Google Calendar connection could not be started." }, 502);

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        access_type: "offline",
        prompt: "consent select_account",
        login_hint: "santajimofbr@gmail.com",
        include_granted_scopes: "true",
        scope: CALENDAR_SCOPES.join(" "),
        state,
      });
      return json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, state });
    }

    if (action === "exchange") {
      if (!configured) return json({ error: "Google Calendar OAuth credentials have not been added yet." }, 503);
      const code = String(body.code ?? "");
      const state = String(body.state ?? "");
      const redirectUri = String(body.redirectUri ?? "");
      if (!code || !state || !redirectUri) return json({ error: "The Google authorization response is incomplete." }, 400);

      const stateResponse = await rest(
        `santa_google_oauth_states?state=eq.${encodeURIComponent(state)}&site_id=eq.${SANTA_SITE_ID}&user_id=eq.${encodeURIComponent(user.id)}&select=state,redirect_uri,expires_at&limit=1`,
      );
      const states = stateResponse.ok ? await stateResponse.json() as Array<{ redirect_uri: string; expires_at: string }> : [];
      const storedState = states[0];
      if (!storedState || storedState.redirect_uri !== redirectUri || Date.parse(storedState.expires_at) <= Date.now()) {
        return json({ error: "The Google Calendar authorization request expired or did not match." }, 400);
      }
      await rest(`santa_google_oauth_states?state=eq.${encodeURIComponent(state)}`, { method: "DELETE" });

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      const token = await tokenResponse.json().catch(() => ({})) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        scope?: string;
        error_description?: string;
      };
      if (!tokenResponse.ok || !token.access_token) return json({ error: token.error_description || "Google did not return Calendar access." }, 502);

      const existing = await loadConnection();
      const refreshToken = token.refresh_token ?? existing?.refresh_token ?? null;
      if (!refreshToken) return json({ error: "Google did not return offline access. Reconnect and approve Calendar access again." }, 502);

      const saveResponse = await rest("santa_google_calendar_connections?on_conflict=site_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          site_id: SANTA_SITE_ID,
          calendar_id: "primary",
          access_token: token.access_token,
          refresh_token: refreshToken,
          access_token_expires_at: new Date(Date.now() + Number(token.expires_in ?? 3600) * 1000).toISOString(),
          granted_scope: token.scope ?? CALENDAR_SCOPES.join(" "),
          connected_by: user.id,
          connected_at: existing?.connected_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      if (!saveResponse.ok) return json({ error: "Google Calendar access was granted but could not be stored." }, 502);
      return json({ connected: true });
    }

    if (action === "disconnect") {
      const connection = await loadConnection();
      const revokeToken = connection?.refresh_token || connection?.access_token;
      if (revokeToken) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(revokeToken)}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).catch(() => undefined);
      }
      const deleteResponse = await rest(`santa_google_calendar_connections?site_id=eq.${SANTA_SITE_ID}`, { method: "DELETE" });
      if (!deleteResponse.ok) return json({ error: "Google access was revoked, but the local Calendar connection could not be removed." }, 502);
      return json({ connected: false });
    }

    if (action === "create-event") {
      const bookingId = String(body.bookingId ?? "");
      if (!bookingId) return json({ error: "Booking ID is required." }, 400);
      const bookingResponse = await rest(
        `santa_booking_requests?id=eq.${encodeURIComponent(bookingId)}&site_id=eq.${SANTA_SITE_ID}&select=id,service_slug,local_date,local_start_time,local_end_time,local_blocked_until_time,status,calendar_sync_status&limit=1`,
      );
      const bookings = bookingResponse.ok ? await bookingResponse.json() as Array<Record<string, unknown>> : [];
      const booking = bookings[0];
      if (!booking) return json({ error: "Booking request was not found." }, 404);
      if (String(booking.status) !== "pending" || String(booking.calendar_sync_status) !== "pending") {
        return json({ error: "Only a claimed pending request can be added to Calendar." }, 409);
      }

      const stored = await loadConnection();
      if (!stored) return json({ connected: false, error: "Google Calendar is not connected." }, 409);
      const connection = await refreshAccessToken(stored);
      const settingsResponse = await rest(`santa_schedule_settings?site_id=eq.${SANTA_SITE_ID}&select=timezone&limit=1`);
      const settingsRows = settingsResponse.ok ? await settingsResponse.json() as Array<{ timezone?: string }> : [];
      const timezone = settingsRows[0]?.timezone || "America/Chicago";
      const created = await createEvent(connection, booking, timezone);
      if (created.conflict) return json({ connected: true, conflict: true, error: "Google Calendar is busy during that requested time." }, 409);
      return json({ connected: true, eventId: created.eventId, htmlLink: created.htmlLink });
    }

    if (action === "rollback-event") {
      const bookingId = String(body.bookingId ?? "");
      if (!bookingId) return json({ error: "Booking ID is required." }, 400);
      const bookingResponse = await rest(
        `santa_booking_requests?id=eq.${encodeURIComponent(bookingId)}&site_id=eq.${SANTA_SITE_ID}&select=id,status,calendar_sync_status&limit=1`,
      );
      const bookings = bookingResponse.ok ? await bookingResponse.json() as Array<Record<string, unknown>> : [];
      const booking = bookings[0];
      if (!booking || String(booking.status) !== "pending" || String(booking.calendar_sync_status) !== "pending") {
        return json({ error: "Only an unfinished Calendar confirmation can be rolled back." }, 409);
      }
      const stored = await loadConnection();
      if (!stored) return json({ connected: false, error: "Google Calendar is not connected." }, 409);
      const connection = await refreshAccessToken(stored);
      const eventId = googleEventId(bookingId);
      await deleteEvent(connection, eventId);
      return json({ deleted: true, eventId });
    }

    if (action === "cancel-event") {
      const bookingId = String(body.bookingId ?? "");
      if (!bookingId) return json({ error: "Booking ID is required." }, 400);
      const bookingResponse = await rest(
        `santa_booking_requests?id=eq.${encodeURIComponent(bookingId)}&site_id=eq.${SANTA_SITE_ID}&select=id,status,google_event_id&limit=1`,
      );
      const bookings = bookingResponse.ok ? await bookingResponse.json() as Array<Record<string, unknown>> : [];
      const booking = bookings[0];
      if (!booking) return json({ error: "Booking was not found." }, 404);
      if (String(booking.status) === "cancelled") {
        return json({ deleted: false, eventId: null, alreadyCancelled: true });
      }
      if (String(booking.status) !== "confirmed") {
        return json({ error: "Only a confirmed booking can be removed from Calendar." }, 409);
      }
      const eventId = String(booking.google_event_id ?? "");
      if (!eventId) return json({ deleted: false, eventId: null });
      const stored = await loadConnection();
      if (!stored) return json({ connected: false, error: "Google Calendar is not connected." }, 409);
      const connection = await refreshAccessToken(stored);
      await deleteEvent(connection, eventId);
      return json({ deleted: true, eventId });
    }

    return json({ error: "Unknown Calendar action." }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Google Calendar request failed." }, 502);
  }
});
