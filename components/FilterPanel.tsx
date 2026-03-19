"use client";

import { TYPES, RARITIES } from "@/lib/types";
import { SlidersHorizontal } from "lucide-react";

export default function FilterPanel({
  type,
  rarity,
  minPrice,
  maxPrice,
  onTypeChange,
  onRarityChange,
  onMinPriceChange,
  onMaxPriceChange,
}: {
  type: string;
  rarity: string;
  minPrice: string;
  maxPrice: string;
  onTypeChange: (v: string) => void;
  onRarityChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
}) {
  const hasFilters = type || rarity || minPrice || maxPrice;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300"
      >
        <option value="">All Types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={rarity}
        onChange={(e) => onRarityChange(e.target.value)}
        className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300"
      >
        <option value="">All Rarities</option>
        {RARITIES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <input
          type="number"
          placeholder="Min €"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          className="w-24 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-sm"
          min="0"
          step="0.01"
        />
        <span className="text-gray-400 text-sm">–</span>
        <input
          type="number"
          placeholder="Max €"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className="w-24 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-sm"
          min="0"
          step="0.01"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            onTypeChange("");
            onRarityChange("");
            onMinPriceChange("");
            onMaxPriceChange("");
          }}
          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
