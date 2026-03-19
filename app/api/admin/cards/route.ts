export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import {
  ValidationError,
  getNumber,
  getOptionalBoolean,
  getOptionalHttpUrl,
  getOptionalStringArray,
  getOptionalTrimmedString,
  getRequiredHttpUrl,
  getRequiredTrimmedString,
} from "@/lib/validation";

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
    const name = getRequiredTrimmedString(body.name, "name", { maxLength: 200 });
    const imageUrl = getRequiredHttpUrl(body.imageUrl, "imageUrl");
    const price = getNumber(body.price, "price", { min: 0, max: 100000 });
    const stock =
      body.stock === undefined
        ? 10
        : getNumber(body.stock, "stock", { min: 0, max: 10000, integer: true });
    const types = getOptionalStringArray(body.types, "types", 10, 30);
    const published = getOptionalBoolean(body.published, "published");

    const card = await prisma.card.create({
      data: {
        name,
        setName: getOptionalTrimmedString(body.setName, "setName", { maxLength: 200 }) ?? null,
        setCode: getOptionalTrimmedString(body.setCode, "setCode", { maxLength: 50 }) ?? null,
        number: getOptionalTrimmedString(body.number, "number", { maxLength: 50 }) ?? null,
        rarity: getOptionalTrimmedString(body.rarity, "rarity", { maxLength: 100 }) ?? null,
        types: types ? JSON.stringify(types) : null,
        hp: getOptionalTrimmedString(body.hp, "hp", { maxLength: 20 }) ?? null,
        imageUrl,
        imageLarge: getOptionalHttpUrl(body.imageLarge, "imageLarge") ?? null,
        description:
          getOptionalTrimmedString(body.description, "description", { maxLength: 5000 }) ?? null,
        artist: getOptionalTrimmedString(body.artist, "artist", { maxLength: 200 }) ?? null,
        price,
        stock,
        tcgId: getOptionalTrimmedString(body.tcgId, "tcgId", { maxLength: 100 }) ?? null,
        sourceUrl: getOptionalHttpUrl(body.sourceUrl, "sourceUrl") ?? null,
        published: published ?? true,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("admin/cards POST error:", err);
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
  }
}
