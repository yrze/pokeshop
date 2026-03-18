import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { price, stock, published, name, description } = body;

    const card = await prisma.card.update({
      where: { id },
      data: {
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
        ...(stock !== undefined ? { stock: parseInt(stock) } : {}),
        ...(published !== undefined ? { published } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });
    return NextResponse.json(card);
  } catch (err) {
    console.error("admin/cards PATCH error:", err);
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
