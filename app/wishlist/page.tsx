"use client";

import { useWishlist } from "@/components/WishlistContext";
import CardGrid from "@/components/CardGrid";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Card } from "@/lib/types";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  // Convert wishlist items to Card objects for CardGrid
  const cards: Card[] = wishlist.map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
    price: item.price,
    stock: 1, // Wishlist items assumed in stock for display
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">Wishlist</h1>
        {wishlist.length > 0 && (
          <span className="text-sm text-gray-400 dark:text-gray-500">({wishlist.length} card{wishlist.length !== 1 ? "s" : ""})</span>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-32">
          <Heart className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No favorites yet</h2>
          <p className="text-gray-400 dark:text-gray-500 mb-6">Click the heart icon on any card to save it here</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Browse Cards
          </Link>
        </div>
      ) : (
        <CardGrid cards={cards} />
      )}
    </div>
  );
}
