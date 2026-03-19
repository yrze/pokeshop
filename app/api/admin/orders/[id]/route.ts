import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { card: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, trackingNumber, notes } = await req.json();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (status) {
    data.status = status;
    // Append to status history
    const history = order.statusHistory ? JSON.parse(order.statusHistory) : [];
    history.push({ status, timestamp: new Date().toISOString() });
    data.statusHistory = JSON.stringify(history);
  }
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
  if (notes !== undefined) data.notes = notes;

  const updated = await prisma.order.update({
    where: { id },
    data,
    include: { items: { include: { card: true } } },
  });

  return NextResponse.json(updated);
}
