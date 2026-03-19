"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CardGrid from "@/components/CardGrid";
import { CardGridSkeleton } from "@/components/CardSkeleton";
import FilterPanel from "@/components/FilterPanel";
import SortSelect from "@/components/SortSelect";
import Pagination from "@/components/Pagination";
import { Search } from "lucide-react";
import { Card } from "@/lib/types";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";

export default function HomePage() {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const rarity = searchParams.get("rarity") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const [cards, setCards] = useState<Card[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParam("search", searchInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParam]);

  // Fetch cards when params change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (rarity) params.set("rarity", rarity);
    if (sort) params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    fetch(`/api/cards?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [search, type, rarity, sort, page, minPrice, maxPrice]);

  return (
    <div>
      <RecentlyViewedBar />

      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-2">
          Pokemon Card Shop
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Collect them all — authentic cards shipped fast
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>
        <SortSelect value={sort} onChange={(v) => updateParam("sort", v)} />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterPanel
          type={type}
          rarity={rarity}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onTypeChange={(v) => updateParam("type", v)}
          onRarityChange={(v) => updateParam("rarity", v)}
          onMinPriceChange={(v) => updateParam("minPrice", v)}
          onMaxPriceChange={(v) => updateParam("maxPrice", v)}
        />
      </div>

      {/* Results count */}
      {!loading && total > 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
          {total} card{total !== 1 ? "s" : ""} found
        </p>
      )}

      {loading ? <CardGridSkeleton /> : <CardGrid cards={cards} />}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => updateParam("page", String(p))}
      />
    </div>
  );
}
