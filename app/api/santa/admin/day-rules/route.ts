import { NextRequest, NextResponse } from "next/server";
import { SANTA_SITE_ID } from "@/lib/santa-config";
import { assertSantaAdmin, bearerToken, supabaseRest } from "@/lib/santa-supabase";

const DAY_MODES = new Set(["normal", "photos_only", "blocked", "custom"]);

async function adminToken(request: NextRequest) {
  const token = bearerToken(request);
  const { authorized } = await assertSantaAdmin(token);
  return authorized ? token : "";
}

export async function GET(request: NextRequest) {
  const token = await adminToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const response = await supabaseRest(
    `santa_day_rules?site_id=eq.${SANTA_SITE_ID}&select=id,date,mode,allowed_service_slugs,windows&order=date.asc`,
    {},
    token,
  );
  if (!response.ok) return NextResponse.json({ error: "Could not load day rules." }, { status: 502 });
  return NextResponse.json({ dayRules: await response.json() });
}

export async function PUT(request: NextRequest) {
  const token = await adminToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    date?: string;
    mode?: string;
    allowedServiceSlugs?: string[];
    windows?: Array<{ start: string; end: string }>;
  } | null;
  if (!body?.date || !body.mode || !DAY_MODES.has(body.mode)) {
    return NextResponse.json({ error: "Choose a valid date and day mode." }, { status: 400 });
  }

  const payload = {
    site_id: SANTA_SITE_ID,
    date: body.date,
    mode: body.mode,
    allowed_service_slugs: body.mode === "custom" ? (body.allowedServiceSlugs ?? []) : [],
    windows: body.mode === "custom" ? (body.windows ?? []) : [],
    updated_at: new Date().toISOString(),
  };
  const response = await supabaseRest(
    `santa_day_rules?on_conflict=site_id,date`,
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    },
    token,
  );
  if (!response.ok) return NextResponse.json({ error: "Could not save the day rule." }, { status: 502 });
  return NextResponse.json({ dayRule: (await response.json())[0] ?? null });
}
