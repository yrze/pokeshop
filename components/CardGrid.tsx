"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";
import { useToast } from "./ToastContext";
import { useWishlist } from "./WishlistContext";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Card, TYPE_BG_COLORS } from "@/lib/types";

export default function CardGrid({ cards }: { cards: Card[] }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (cards.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400 dark:text-gray-500">
        <p className="text-5xl mb-4">🃏</p>
        <p className="text-xl font-medium">No cards found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {cards.map((card, index) => {
        const types: string[] = card.types ? JSON.parse(card.types) : [];
        const typeColor = types[0] ? TYPE_BG_COLORS[types[0]] || "bg-gray-400" : "bg-gray-400";
        const inStock = card.stock > 0;
        const wishlisted = isWishlisted(card.id);

        return (
          <div
            key={card.id}
            className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1 flex flex-col animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative block aspect-[2.5/3.5] bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <Link href={`/cards/${card.id}`}>
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                />
              </Link>
              {!inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                  <span className="text-white font-bold text-sm bg-red-600 px-3 py-1 rounded-full">Sold Out</span>
                </div>
              )}
              {types[0] && (
                <span className={`absolute top-2 left-2 text-xs font-bold text-white px-2 py-0.5 rounded-full ${typeColor}`}>
                  {types[0]}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist({ id: card.id, name: card.name, imageUrl: card.imageUrl, price: card.price });
                  addToast(wishlisted ? `${card.name} removed from wishlist` : `${card.name} added to wishlist`, wishlisted ? "info" : "success");
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    wishlisted ? "fill-red-500 text-red-500" : "text-white/80 hover:text-red-400"
                  }`}
                />
              </button>
            </div>

            <div className="p-3 flex flex-col flex-1">
              <Link href={`/cards/${card.id}`}>
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:text-red-600 transition-colors leading-tight">
                  {card.name}
                </h3>
              </Link>
              {card.setName && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{card.setName}</p>
              )}
              {card.rarity && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{card.rarity}</span>
                </div>
              )}

              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                  €{card.price.toFixed(2)}
                </span>
                <button
                  onClick={() => {
                    addItem({ id: card.id, name: card.name, imageUrl: card.imageUrl, price: card.price });
                    addToast(`${card.name} added to cart!`);
                  }}
                  disabled={!inStock}
                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Add to cart"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
