"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Shield, Truck, RotateCcw } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (items.length === 0 && !success) {
      router.push("/cart");
    }
  }, [items.length, router, success]);

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center text-sm text-gray-500 dark:text-gray-400">
        Redirecting to your cart...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ cardId: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setOrderId(data.id);
      setSuccess(true);
      // Store email for order tracking access
      sessionStorage.setItem(`order-email-${data.id}`, form.email);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">Order Placed!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">Thank you for your order, {form.name}.</p>
        <Link
          href={`/orders/${orderId}`}
          className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium mb-8 block"
        >
          Track your order →
        </Link>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                placeholder="Ash Ketchum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                placeholder="ash@pokemon.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Address</label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 resize-none"
                rows={3}
                placeholder="1 Pallet Town, Kanto"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Placing Order..." : `Place Order — €${total.toFixed(2)}`}
            </button>
          </form>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              Secure Checkout
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
              Fast Shipping
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <RotateCcw className="w-4 h-4 text-green-600 dark:text-green-400" />
              Easy Returns
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-10 h-14 flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-contain" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">×{item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">€{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t dark:border-gray-800 pt-4 flex justify-between font-black text-lg text-gray-900 dark:text-gray-100">
            <span>Total</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
