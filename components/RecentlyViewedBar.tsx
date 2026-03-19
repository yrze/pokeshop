"use client";

import Image from "next/image";
import Link from "next/link";
import { useRecentlyViewed } from "./RecentlyViewedContext";
import { Clock } from "lucide-react";

export default function RecentlyViewedBar({ excludeId }: { excludeId?: string }) {
  const { viewedCards } = useRecentlyViewed();
  const cards = excludeId ? viewedCards.filter((c) => c.id !== excludeId) : viewedCards;

  if (cards.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        <Clock className="w-4 h-4" /> Recently Viewed
      </h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={`/cards/${card.id}`}
            className="flex-shrink-0 w-28 group"
          >
            <div className="relative aspect-[2.5/3.5] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-1.5">
              <Image
                src={card.imageUrl}
                alt={card.name}
                fill
                className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                sizes="112px"
              />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-red-600 transition-colors">
              {card.name}
            </p>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">€{card.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
