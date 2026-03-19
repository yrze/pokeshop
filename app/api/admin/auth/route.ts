import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOCKOUT_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to avoid timing leak on length difference
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const { password } = await req.json();

  if (!password || typeof password !== "string" || password.length > 200) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !timingSafeCompare(password, adminPassword)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Reset rate limit on success
  loginAttempts.delete(ip);

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours (reduced from 24)

  await prisma.adminSession.create({
    data: { token, expiresAt },
  });

  // Clean up expired sessions periodically
  await prisma.adminSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Stronger CSRF protection
    expires: expiresAt,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (token) {
    await prisma.adminSession.deleteMany({ where: { token } });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
