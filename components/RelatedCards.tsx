"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/lib/types";
import { Sparkles } from "lucide-react";

export default function RelatedCards({ cardId }: { cardId: string }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cards/${cardId}/related`)
      .then((r) => r.json())
      .then((data) => setCards(data.cards || []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, [cardId]);

  if (!loading && cards.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        <Sparkles className="w-4 h-4" /> You May Also Like
      </h3>
      {loading ? (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex-shrink-0 w-36 animate-pulse">
              <div className="aspect-[2.5/3.5] bg-gray-200 dark:bg-gray-800 rounded-xl mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={`/cards/${card.id}`}
              className="flex-shrink-0 w-36 group"
            >
              <div className="relative aspect-[2.5/3.5] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-1.5">
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                  sizes="144px"
                />
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-red-600 transition-colors">
                {card.name}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">€{card.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
