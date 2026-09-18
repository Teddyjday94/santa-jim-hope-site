import { NextRequest, NextResponse } from "next/server";
import { loadSantaAvailability } from "@/lib/santa-availability-service.mjs";
import { SANTA_SITE_ID } from "@/lib/santa-config";
import { invokeSupabaseFunction, supabaseRest } from "@/lib/santa-supabase";

export async function GET(request: NextRequest) {
  const result = await loadSantaAvailability({
    date: request.nextUrl.searchParams.get("date") ?? "",
    serviceSlug: request.nextUrl.searchParams.get("service") ?? "",
    siteId: SANTA_SITE_ID,
    supabaseRest,
    invokeSupabaseFunction,
  });

  return NextResponse.json(result.body, { status: result.status });
}
