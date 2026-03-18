"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { ShoppingCart, Zap } from "lucide-react";

export default function Navbar() {
  const { count } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-red-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <Zap className="w-6 h-6 fill-yellow-300 text-yellow-300" />
          PokéShop
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
            Cards
          </Link>
          <Link href="/admin" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
            Admin
          </Link>
          <Link href="/cart" className="relative text-white hover:text-yellow-300 transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
