export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  const authenticated = await verifyAdmin();
  if (!authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
