import { NextRequest, NextResponse } from "next/server";

const allowedPrefix = "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/";

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");

  if (!src || !src.startsWith(allowedPrefix)) {
    return NextResponse.json({ error: "Invalid gallery image." }, { status: 400 });
  }

  try {
    const upstream = await fetch(src, {
      next: { revalidate: 60 * 60 * 24 * 30 },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Gallery image unavailable." }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400");

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Gallery image unavailable." }, { status: 502 });
  }
}
