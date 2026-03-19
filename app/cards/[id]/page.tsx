"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/ToastContext";
import { useWishlist } from "@/components/WishlistContext";
import { useRecentlyViewed } from "@/components/RecentlyViewedContext";
import CardDetailSkeleton from "@/components/CardDetailSkeleton";
import RelatedCards from "@/components/RelatedCards";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import {
  ArrowLeft, ShoppingCart, Star, Zap, Heart,
  Share2, Minus, Plus, ChevronRight,
} from "lucide-react";
import { Card, TYPE_COLORS } from "@/lib/types";

export default function CardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items } = useCart();
  const { addToast } = useToast();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addViewed } = useRecentlyViewed();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/cards/${id}`)
      .then((r) => {
        if (!r.ok) {
          return null;
        }

        return r.json();
      })
      .then((data) => {
        setCard(data);
        if (data?.id) {
          addViewed({ id: data.id, name: data.name, imageUrl: data.imageUrl, price: data.price });
        }
      })
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, [id, addViewed]);

  if (loading) return <CardDetailSkeleton />;

  if (!card) {
    return <div className="text-center py-32 text-gray-500 dark:text-gray-400">Card not found.</div>;
  }

  const types: string[] = card.types ? JSON.parse(card.types) : [];
  const inCart = items.some((i) => i.id === card.id);
  const wishlisted = isWishlisted(card.id);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ id: card.id, name: card.name, imageUrl: card.imageUrl, price: card.price });
    }
    addToast(`${quantity}× ${card.name} added to cart!`);
    setQuantity(1);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast("Link copied to clipboard!", "info");
    } catch {
      addToast("Couldn't copy link", "error");
    }
  };

  const descriptionLines = card.description?.split("\n") || [];

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {card.setName && (
          <>
            <span className="text-gray-500 dark:text-gray-400">{card.setName}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{card.name}</span>
      </nav>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl dark:shadow-gray-900/50 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-10 min-h-96">
            <div className="relative w-72 h-96 drop-shadow-2xl">
              <Image
                src={card.imageLarge || card.imageUrl}
                alt={card.name}
                fill
                className="object-contain"
                sizes="400px"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col">
            <div className="flex flex-wrap gap-2 mb-3">
              {types.map((t) => (
                <span key={t} className={`text-xs font-bold px-3 py-1 rounded-full ${TYPE_COLORS[t] || "bg-gray-200 dark:bg-gray-700"}`}>
                  {t}
                </span>
              ))}
              {card.rarity && (
                <span className="flex items-center gap-1 text-xs font-medium bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-3 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {card.rarity}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">{card.name}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              {card.setName && <span>{card.setName}</span>}
              {card.number && <span>#{card.number}</span>}
              {card.hp && (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                  <Zap className="w-3 h-3" /> {card.hp} HP
                </span>
              )}
            </div>

            {descriptionLines.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 space-y-2 flex-1">
                {descriptionLines.map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>
                ))}
              </div>
            )}

            {card.artist && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Illustrated by {card.artist}</p>
            )}

            <div className="border-t dark:border-gray-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-black text-gray-900 dark:text-gray-100">€{card.price.toFixed(2)}</p>
                  <p className={`text-sm mt-1 ${card.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                    {card.stock > 0 ? `${card.stock} in stock` : "Sold out"}
                  </p>
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    disabled={card.stock === 0}
                  >
                    <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="px-4 py-2.5 font-bold text-sm text-gray-900 dark:text-gray-100 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(card.stock, q + 1))}
                    className="px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    disabled={card.stock === 0}
                  >
                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={card.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {inCart ? "Add More" : "Add to Cart"}
                </button>
              </div>

              {/* Secondary actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toggleWishlist({ id: card.id, name: card.name, imageUrl: card.imageUrl, price: card.price });
                    addToast(wishlisted ? "Removed from wishlist" : "Added to wishlist!", wishlisted ? "info" : "success");
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                    wishlisted
                      ? "border-red-200 dark:border-red-800 text-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-800 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500" : ""}`} />
                  {wishlisted ? "Saved" : "Save"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedCards cardId={id} />
      <RecentlyViewedBar excludeId={id} />
    </div>
  );
}
