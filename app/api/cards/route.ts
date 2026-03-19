import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Validate and sanitize inputs
  const search = (searchParams.get("search") || "").slice(0, 100);
  const type = (searchParams.get("type") || "").slice(0, 30);
  const rarity = (searchParams.get("rarity") || "").slice(0, 50);
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, Math.min(1000, parseInt(searchParams.get("page") || "1") || 1));
  const limit = Math.min(60, Math.max(1, parseInt(searchParams.get("limit") || "24") || 24));

  const rawMinPrice = parseFloat(searchParams.get("minPrice") || "0");
  const rawMaxPrice = parseFloat(searchParams.get("maxPrice") || "0");
  const minPrice = isNaN(rawMinPrice) || rawMinPrice < 0 ? 0 : rawMinPrice;
  const maxPrice = isNaN(rawMaxPrice) || rawMaxPrice < 0 ? 0 : rawMaxPrice;

  // Validate sort value against whitelist
  const VALID_SORTS = ["newest", "oldest", "price_asc", "price_desc", "name_asc", "name_desc"];
  const validSort = VALID_SORTS.includes(sort) ? sort : "newest";

  const where: Record<string, unknown> = { published: true };
  if (search) where.name = { contains: search };
  if (type) where.types = { contains: type };
  if (rarity) where.rarity = rarity;

  // Build price filter safely
  const priceFilter: Record<string, number> = {};
  if (minPrice > 0) priceFilter.gte = minPrice;
  if (maxPrice > 0) priceFilter.lte = maxPrice;
  if (Object.keys(priceFilter).length > 0) where.price = priceFilter;

  const orderByMap: Record<string, object> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
  };
  const orderBy = orderByMap[validSort];

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.card.count({ where }),
  ]);

  return NextResponse.json({
    cards,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
