import { NextRequest, NextResponse } from "next/server";
import { parseLink } from "@/lib/parseLink";
import { verifyAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  // Only authenticated admins can parse links (prevents SSRF from public)
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    const trimmed = url.trim();
    if (trimmed.length > 2000) {
      return NextResponse.json({ error: "URL too long" }, { status: 400 });
    }

    const card = await parseLink(trimmed);
    if (!card) {
      return NextResponse.json(
        { error: "Could not find card info for this URL. Try a TCGPlayer, Bulbapedia, or Pokemon TCG API link." },
        { status: 404 }
      );
    }

    return NextResponse.json(card);
  } catch {
    return NextResponse.json({ error: "Failed to parse link" }, { status: 500 });
  }
}
