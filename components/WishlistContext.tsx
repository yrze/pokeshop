"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface WishlistCard {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

interface WishlistContextType {
  wishlist: WishlistCard[];
  toggleWishlist: (card: WishlistCard) => void;
  isWishlisted: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistCard[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("poke-wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("poke-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((card: WishlistCard) => {
    setWishlist((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      if (exists) return prev.filter((c) => c.id !== card.id);
      return [...prev, card];
    });
  }, []);

  const isWishlisted = useCallback(
    (id: string) => wishlist.some((c) => c.id === id),
    [wishlist]
  );

  const count = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, count }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
