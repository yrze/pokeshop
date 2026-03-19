import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple in-memory rate limiter for order lookups
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const email = req.nextUrl.searchParams.get("email");
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { email: email.toLowerCase() },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { card: { select: { id: true, name: true, imageUrl: true } } },
        take: 1,
      },
    },
  });

  // Strip sensitive fields before returning
  const safeOrders = orders.map(({ transactionId, notes, statusHistory, ...order }) => order);

  return NextResponse.json(safeOrders);
}
