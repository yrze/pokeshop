export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cards = await prisma.card.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      name, setName, setCode, number, rarity, types,
      hp, imageUrl, imageLarge, description, artist,
      price, stock, tcgId, sourceUrl, published,
    } = body;

    if (!name || !imageUrl || price === undefined) {
      return NextResponse.json({ error: "name, imageUrl, and price are required" }, { status: 400 });
    }

    const card = await prisma.card.create({
      data: {
        name,
        setName: setName || null,
        setCode: setCode || null,
        number: number || null,
        rarity: rarity || null,
        types: types ? JSON.stringify(types) : null,
        hp: hp || null,
        imageUrl,
        imageLarge: imageLarge || null,
        description: description || null,
        artist: artist || null,
        price: parseFloat(price),
        stock: stock !== undefined ? parseInt(stock) : 10,
        tcgId: tcgId || null,
        sourceUrl: sourceUrl || null,
        published: published !== false,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (err) {
    console.error("admin/cards POST error:", err);
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
  }
}
