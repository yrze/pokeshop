"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface ViewedCard {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

interface RecentlyViewedContextType {
  viewedCards: ViewedCard[];
  addViewed: (card: ViewedCard) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [viewedCards, setViewedCards] = useState<ViewedCard[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("poke-recently-viewed");
      if (saved) setViewedCards(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("poke-recently-viewed", JSON.stringify(viewedCards));
  }, [viewedCards]);

  const addViewed = useCallback((card: ViewedCard) => {
    setViewedCards((prev) => {
      const filtered = prev.filter((c) => c.id !== card.id);
      return [card, ...filtered].slice(0, 20);
    });
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ viewedCards, addViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used inside RecentlyViewedProvider");
  return ctx;
}
