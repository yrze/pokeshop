export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import {
  ValidationError,
  getOptionalTrimmedString,
  getOrderStatus,
} from "@/lib/validation";

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
  const body = await req.json();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const status = getOrderStatus(body.status);
    const trackingNumber = getOptionalTrimmedString(
      body.trackingNumber,
      "trackingNumber",
      { maxLength: 200 }
    );
    const notes = getOptionalTrimmedString(body.notes, "notes", {
      maxLength: 2000,
    });

    const data: Record<string, unknown> = {};
    if (status) {
      data.status = status;

      let history: Array<{ status: string; timestamp: string }> = [];
      try {
        history = order.statusHistory ? JSON.parse(order.statusHistory) : [];
      } catch {
        history = [];
      }

      history.push({ status, timestamp: new Date().toISOString() });
      data.statusHistory = JSON.stringify(history);
    }
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    if (notes !== undefined) data.notes = notes;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: { items: { include: { card: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("admin/orders PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
