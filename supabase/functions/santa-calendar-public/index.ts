const SANTA_SITE_ID = "a0d14a7f-7e08-4042-a6c9-0f83c03eefb3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Connection = {
  calendar_id: string;
  access_token: string;
  refresh_token: string | null;
  access_token_expires_at: string | null;
  granted_scope: string | null;
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
      // Fall through while projects migrate key formats.
    }
  }
  return Deno.env.get(legacyName) ?? "";
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const secretKey = envKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");

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

function googleCredentials() {
  return {
    clientId: Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID") ?? "",
    clientSecret: Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET") ?? "",
  };
}

async function loadConnection() {
  const response = await rest(
    `santa_google_calendar_connections?site_id=eq.${SANTA_SITE_ID}&select=calendar_id,access_token,refresh_token,access_token_expires_at,granted_scope&limit=1`,
  );
  if (!response.ok) throw new Error("Calendar connection could not be loaded.");
  const rows = await response.json() as Connection[];
  return rows[0] ?? null;
}

async function refreshAccessToken(connection: Connection) {
  const expiresAt = connection.access_token_expires_at ? Date.parse(connection.access_token_expires_at) : 0;
  if (connection.access_token && expiresAt > Date.now() + 120_000) return connection;

  const { clientId, clientSecret } = googleCredentials();
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
  const token = await tokenResponse.json().catch(() => ({})) as {
    access_token?: string;
    expires_in?: number;
    scope?: string;
    error_description?: string;
  };
  if (!tokenResponse.ok || !token.access_token) throw new Error(token.error_description || "Google Calendar access could not be refreshed.");

  const expires = new Date(Date.now() + Number(token.expires_in ?? 3600) * 1000).toISOString();
  await rest(`santa_google_calendar_connections?site_id=eq.${SANTA_SITE_ID}`, {
    method: "PATCH",
    body: JSON.stringify({
      access_token: token.access_token,
      access_token_expires_at: expires,
      granted_scope: token.scope ?? connection.granted_scope,
      updated_at: new Date().toISOString(),
    }),
  });
  return { ...connection, access_token: token.access_token, access_token_expires_at: expires };
}

function nextDate(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
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

function localDateTime(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${pick("year")}-${pick("month")}-${pick("day")}`,
    time: `${pick("hour")}:${pick("minute")}`,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!supabaseUrl || !secretKey) return json({ error: "Calendar backend is not configured." }, 503);

  const body = await req.json().catch(() => ({})) as { date?: string };
  const date = String(body.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "A valid schedule date is required." }, 400);

  try {
    const settingsResponse = await rest(
      `santa_schedule_settings?site_id=eq.${SANTA_SITE_ID}&select=season_start,season_end,timezone&limit=1`,
    );
    if (!settingsResponse.ok) throw new Error("Schedule settings could not be loaded.");
    const settingsRows = await settingsResponse.json() as Array<{ season_start: string; season_end: string; timezone: string }>;
    const settings = settingsRows[0];
    if (!settings || date < settings.season_start || date > settings.season_end) {
      return json({ connected: false, busy: [] });
    }

    const stored = await loadConnection();
    if (!stored) return json({ connected: false, busy: [] });

    const { clientId, clientSecret } = googleCredentials();
    if (!clientId || !clientSecret) return json({ connected: true, error: "Google Calendar credentials are missing." }, 503);

    const connection = await refreshAccessToken(stored);
    const timezone = settings.timezone || "America/Chicago";
    const offset = offsetForDate(date, timezone);
    const tomorrow = nextDate(date);
    const tomorrowOffset = offsetForDate(tomorrow, timezone);

    const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: `${date}T00:00:00${offset}`,
        timeMax: `${tomorrow}T00:00:00${tomorrowOffset}`,
        timeZone: timezone,
        items: [{ id: connection.calendar_id || "primary" }],
      }),
    });
    if (!response.ok) throw new Error("Google Calendar availability could not be checked.");
    const result = await response.json() as {
      calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
    };
    const calendar = Object.values(result.calendars ?? {})[0];
    const busy = (calendar?.busy ?? []).flatMap((period) => {
      const start = localDateTime(period.start, timezone);
      const end = localDateTime(period.end, timezone);
      if (end.date < date || start.date > date) return [];
      return [{
        startTime: start.date < date ? "00:00" : start.time,
        endTime: end.date > date ? "23:59" : end.time,
      }];
    });

    await rest(`santa_google_calendar_connections?site_id=eq.${SANTA_SITE_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    });

    return json({ connected: true, busy });
  } catch (error) {
    return json({ connected: true, error: error instanceof Error ? error.message : "Google Calendar availability failed." }, 502);
  }
});
