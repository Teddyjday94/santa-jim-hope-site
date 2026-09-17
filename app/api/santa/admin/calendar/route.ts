import { NextRequest, NextResponse } from "next/server";
import { assertSantaAdmin, bearerToken, invokeSupabaseFunction } from "@/lib/santa-supabase";

export async function POST(request: NextRequest) {
  const token = bearerToken(request);
  const { authorized } = await assertSantaAdmin(token);
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "A Calendar action is required." }, { status: 400 });
  }
  const allowedActions = new Set(["status", "auth-url", "exchange", "disconnect"]);
  if (!allowedActions.has(body.action)) {
    return NextResponse.json({ error: "That Calendar action is not available from the browser." }, { status: 403 });
  }

  const response = await invokeSupabaseFunction("santa-calendar-admin", body, token);
  const result = await response.json().catch(() => ({ error: "Calendar returned an invalid response." }));
  return NextResponse.json(result, { status: response.status });
}
