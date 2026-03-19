export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id.length > 50) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email required for order lookup" }, { status: 401 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id, email },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      total: true,
      status: true,
      statusHistory: true,
      trackingNumber: true,
      createdAt: true,
      items: {
        include: {
          card: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              setName: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
