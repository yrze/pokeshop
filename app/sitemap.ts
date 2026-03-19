import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://pokeshop.up.railway.app";

  try {
    const cards = await prisma.card.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    });

    const cardUrls = cards.map((card) => ({
      url: `${baseUrl}/cards/${card.id}`,
      lastModified: card.updatedAt,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
      ...cardUrls,
    ];
  } catch (error) {
    console.error("sitemap generation failed:", error);

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ];
  }
}
