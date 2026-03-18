"use client";

import { useEffect, useState } from "react";
import CardGrid from "@/components/CardGrid";
import { Search } from "lucide-react";

const TYPES = ["Fire", "Water", "Grass", "Electric", "Psychic", "Fighting", "Darkness", "Metal", "Dragon", "Colorless", "Fairy"];

interface Card {
  id: string;
  name: string;
  setName?: string | null;
  rarity?: string | null;
  types?: string | null;
  hp?: string | null;
  imageUrl: string;
  price: number;
  stock: number;
}

export default function HomePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    fetch(`/api/cards?${params}`)
      .then((r) => r.json())
      .then(setCards)
      .finally(() => setLoading(false));
  }, [search, type]);

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2">⚡ Pokemon Card Shop</h1>
        <p className="text-gray-500 text-lg">Collect them all — authentic cards shipped fast</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm text-gray-700"
        >
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <CardGrid cards={cards} />
      )}
    </div>
  );
}
