export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const card = await prisma.card.findFirst({
    where: { id, published: true },
  });
  if (!card) {
    return NextResponse.json({ cards: [] });
  }

  let types: string[] = [];
  try { types = card.types ? JSON.parse(card.types) : []; } catch { types = []; }
  const primaryType = types[0] || "";

  const cards = await prisma.card.findMany({
    where: {
      published: true,
      id: { not: id },
      OR: [
        ...(primaryType ? [{ types: { contains: primaryType } }] : []),
        ...(card.setCode ? [{ setCode: card.setCode }] : []),
      ],
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cards });
}
