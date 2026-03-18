import { NextRequest, NextResponse } from "next/server";
import { parseLink } from "@/lib/parseLink";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const card = await parseLink(url.trim());
    if (!card) {
      return NextResponse.json(
        { error: "Could not find card info for this URL. Try a TCGPlayer, Bulbapedia, or Pokemon TCG API link." },
        { status: 404 }
      );
    }

    return NextResponse.json(card);
  } catch (err) {
    console.error("parse-link error:", err);
    return NextResponse.json({ error: "Failed to parse link" }, { status: 500 });
  }
}
