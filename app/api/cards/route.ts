import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  const cards = await prisma.card.findMany({
    where: {
      published: true,
      ...(search ? { name: { contains: search } } : {}),
      ...(type ? { types: { contains: type } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}
