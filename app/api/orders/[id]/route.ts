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

  // Require email header or query param to prevent IDOR enumeration
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email required for order lookup" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { card: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Verify the email matches the order
  if (order.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
