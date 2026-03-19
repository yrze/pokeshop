import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cards = await prisma.card.findMany({
    where: { published: true },
    select: { id: true, updatedAt: true },
  });

  const cardUrls = cards.map((card) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://pokeshop.up.railway.app"}/cards/${card.id}`,
    lastModified: card.updatedAt,
  }));

  return [
    {
      url: process.env.NEXT_PUBLIC_BASE_URL || "https://pokeshop.up.railway.app",
      lastModified: new Date(),
    },
    ...cardUrls,
  ];
}
