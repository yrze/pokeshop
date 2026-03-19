export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import {
  ValidationError,
  getNumber,
  getOptionalBoolean,
  getOptionalTrimmedString,
  getRequiredTrimmedString,
} from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const data: {
      price?: number;
      stock?: number;
      published?: boolean;
      name?: string;
      description?: string | null;
    } = {};

    if (body.price !== undefined) {
      data.price = getNumber(body.price, "price", { min: 0, max: 100000 });
    }
    if (body.stock !== undefined) {
      data.stock = getNumber(body.stock, "stock", {
        min: 0,
        max: 10000,
        integer: true,
      });
    }
    if (body.published !== undefined) {
      data.published = getOptionalBoolean(body.published, "published");
    }
    if (body.name !== undefined) {
      data.name = getRequiredTrimmedString(body.name, "name", { maxLength: 200 });
    }
    if (body.description !== undefined) {
      data.description =
        getOptionalTrimmedString(body.description, "description", {
          maxLength: 5000,
        }) ?? null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const card = await prisma.card.update({
      where: { id },
      data,
    });
    return NextResponse.json(card);
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("admin/cards PATCH error:", err);
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
