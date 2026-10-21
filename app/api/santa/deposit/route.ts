import { NextRequest, NextResponse } from "next/server";
import { startDepositCheckout } from "@/lib/santa-deposit";

// The Pay button on /deposit/[token] posts here; we send the family on to Stripe.
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");
  const origin = request.nextUrl.origin;
  const { url, error } = await startDepositCheckout(token, origin);
  if (url) return NextResponse.redirect(url, 303);

  const back = new URL(`/deposit/${encodeURIComponent(token)}`, origin);
  back.searchParams.set("error", error ?? "The payment page could not be opened.");
  return NextResponse.redirect(back, 303);
}
