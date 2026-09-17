import { NextRequest, NextResponse } from "next/server";
import { SANTA_SITE_ID } from "@/lib/santa-config";
import { assertSantaAdmin, bearerToken, supabaseRest } from "@/lib/santa-supabase";

type SettingsRecord = Record<string, unknown>;
type ServiceRecord = Record<string, unknown>;

function validDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validTime(value: unknown) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

async function authorize(request: NextRequest) {
  const token = bearerToken(request);
  const result = await assertSantaAdmin(token);
  return result.authorized ? token : "";
}

export async function GET(request: NextRequest) {
  const token = await authorize(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [settingsResponse, servicesResponse] = await Promise.all([
    supabaseRest(`santa_schedule_settings?site_id=eq.${SANTA_SITE_ID}&select=season_start,season_end,default_start_time,default_end_time,slot_step_minutes,pending_hold_minutes,timezone&limit=1`, {}, token),
    supabaseRest(`santa_services?site_id=eq.${SANTA_SITE_ID}&select=slug,name,duration_minutes,buffer_minutes,active,sort_order&order=sort_order.asc`, {}, token),
  ]);
  if (!settingsResponse.ok || !servicesResponse.ok) {
    return NextResponse.json({ error: "Could not load scheduler settings." }, { status: 502 });
  }
  const settingsRows = await settingsResponse.json() as SettingsRecord[];
  const services = await servicesResponse.json() as ServiceRecord[];
  return NextResponse.json({ settings: settingsRows[0] ?? null, services });
}

export async function PUT(request: NextRequest) {
  const token = await authorize(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    settings?: {
      seasonStart?: string;
      seasonEnd?: string;
      defaultStartTime?: string;
      defaultEndTime?: string;
      slotStepMinutes?: number;
      pendingHoldMinutes?: number;
    };
    services?: Array<{ slug?: string; durationMinutes?: number; bufferMinutes?: number; active?: boolean }>;
  } | null;
  const settings = body?.settings;
  if (!settings || !validDate(settings.seasonStart) || !validDate(settings.seasonEnd) || !validTime(settings.defaultStartTime) || !validTime(settings.defaultEndTime)) {
    return NextResponse.json({ error: "Enter valid season dates and default hours." }, { status: 400 });
  }
  if (settings.seasonEnd! < settings.seasonStart! || settings.defaultEndTime! <= settings.defaultStartTime!) {
    return NextResponse.json({ error: "Season end and default end time must come after their start values." }, { status: 400 });
  }

  const slotStepMinutes = Number(settings.slotStepMinutes ?? 15);
  const pendingHoldMinutes = Number(settings.pendingHoldMinutes ?? 1440);
  if (!Number.isInteger(slotStepMinutes) || slotStepMinutes < 5 || slotStepMinutes > 120 || !Number.isInteger(pendingHoldMinutes) || pendingHoldMinutes < 15 || pendingHoldMinutes > 10080) {
    return NextResponse.json({ error: "Scheduler intervals are outside the allowed range." }, { status: 400 });
  }

  const PATCH = "PATCH";
  const settingsResponse = await supabaseRest(
    `santa_schedule_settings?site_id=eq.${SANTA_SITE_ID}`,
    {
      method: PATCH,
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        season_start: settings.seasonStart,
        season_end: settings.seasonEnd,
        default_start_time: settings.defaultStartTime,
        default_end_time: settings.defaultEndTime,
        slot_step_minutes: slotStepMinutes,
        pending_hold_minutes: pendingHoldMinutes,
        updated_at: new Date().toISOString(),
      }),
    },
    token,
  );
  if (!settingsResponse.ok) return NextResponse.json({ error: "Could not save scheduler settings." }, { status: 502 });

  const serviceUpdates = (body.services ?? []).filter((service) => service.slug);
  for (const service of serviceUpdates) {
    const durationMinutes = Number(service.durationMinutes);
    const bufferMinutes = Number(service.bufferMinutes);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 720 || !Number.isInteger(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 240) {
      return NextResponse.json({ error: `Invalid duration or buffer for ${service.slug}.` }, { status: 400 });
    }
    const response = await supabaseRest(
      `santa_services?site_id=eq.${SANTA_SITE_ID}&slug=eq.${encodeURIComponent(String(service.slug))}`,
      {
        method: PATCH,
        body: JSON.stringify({
          duration_minutes: durationMinutes,
          buffer_minutes: bufferMinutes,
          active: service.active !== false,
          updated_at: new Date().toISOString(),
        }),
      },
      token,
    );
    if (!response.ok) return NextResponse.json({ error: `Could not save ${service.slug}.` }, { status: 502 });
  }

  return GET(request);
}
