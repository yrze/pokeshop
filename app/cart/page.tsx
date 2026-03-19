"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { Minus, Plus, Trash2, ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 dark:text-gray-500 mb-6">Add some cards to get started!</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          Browse Cards
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
          Clear all
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <Link href={`/cards/${item.id}`} className="relative w-16 h-20 flex-shrink-0">
              <Image src={item.imageUrl} alt={item.name} fill className="object-contain rounded-lg" sizes="64px" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/cards/${item.id}`}>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 hover:text-red-600 transition-colors truncate">{item.name}</h3>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">€{item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.id, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Minus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="w-6 text-center font-bold text-sm text-gray-900 dark:text-gray-100">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, item.quantity + 1)}
                className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="text-right w-20">
              <p className="font-bold text-gray-900 dark:text-gray-100">€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">€{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Calculated at checkout</span>
        </div>
        <div className="border-t dark:border-gray-800 pt-4 flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
          <span className="text-2xl font-black text-gray-900 dark:text-gray-100">€{total.toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </Link>
        {total >= 50 && (
          <p className="text-center text-sm text-green-600 dark:text-green-400 font-medium mt-3">
            🎉 You qualify for free shipping!
          </p>
        )}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            Secure
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Truck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            Fast Shipping
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <RotateCcw className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            Easy Returns
          </div>
        </div>
      </div>
    </div>
  );
}
