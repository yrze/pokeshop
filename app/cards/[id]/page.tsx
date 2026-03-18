"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { ArrowLeft, ShoppingCart, Star, Zap } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  Fire: "bg-red-500 text-white",
  Water: "bg-blue-500 text-white",
  Grass: "bg-green-500 text-white",
  Electric: "bg-yellow-400 text-black",
  Psychic: "bg-purple-500 text-white",
  Fighting: "bg-orange-600 text-white",
  Darkness: "bg-gray-800 text-white",
  Metal: "bg-gray-400 text-white",
  Dragon: "bg-indigo-600 text-white",
  Colorless: "bg-gray-300 text-black",
  Fairy: "bg-pink-400 text-white",
};

interface Card {
  id: string;
  name: string;
  setName?: string | null;
  setCode?: string | null;
  number?: string | null;
  rarity?: string | null;
  types?: string | null;
  hp?: string | null;
  imageUrl: string;
  imageLarge?: string | null;
  description?: string | null;
  artist?: string | null;
  price: number;
  stock: number;
}

export default function CardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items } = useCart();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/cards/${id}`)
      .then((r) => r.json())
      .then(setCard)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return <div className="text-center py-32 text-gray-500">Card not found.</div>;
  }

  const types: string[] = card.types ? JSON.parse(card.types) : [];
  const inCart = items.some((i) => i.id === card.id);

  const handleAdd = () => {
    addItem({ id: card.id, name: card.name, imageUrl: card.imageUrl, price: card.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const descriptionLines = card.description?.split("\n") || [];

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-10 min-h-96">
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
                <span key={t} className={`text-xs font-bold px-3 py-1 rounded-full ${TYPE_COLORS[t] || "bg-gray-200"}`}>
                  {t}
                </span>
              ))}
              {card.rarity && (
                <span className="flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {card.rarity}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-1">{card.name}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              {card.setName && <span>{card.setName}</span>}
              {card.number && <span>#{card.number}</span>}
              {card.hp && (
                <span className="flex items-center gap-1 text-red-600 font-bold">
                  <Zap className="w-3 h-3" /> {card.hp} HP
                </span>
              )}
            </div>

            {descriptionLines.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 flex-1">
                {descriptionLines.map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
                ))}
              </div>
            )}

            {card.artist && (
              <p className="text-xs text-gray-400 mb-4">Illustrated by {card.artist}</p>
            )}

            <div className="border-t pt-6 flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-gray-900">€{card.price.toFixed(2)}</p>
                <p className={`text-sm mt-1 ${card.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  {card.stock > 0 ? `${card.stock} in stock` : "Sold out"}
                </p>
              </div>
              <button
                onClick={handleAdd}
                disabled={card.stock === 0}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {added ? "Added!" : inCart ? "Add Again" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
