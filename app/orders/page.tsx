"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, ChevronRight } from "lucide-react";

interface OrderPreview {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { card: { imageUrl: string; name: string } }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/lookup?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        throw new Error("Lookup failed");
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-7 h-7 text-red-600" />
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">Track Orders</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter the email you used at checkout to find your orders.</p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ash@pokemon.com"
              required
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300 transition-colors text-sm"
          >
            {loading ? "Searching..." : "Find Orders"}
          </button>
        </form>
      </div>

      {searched && orders.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No orders found for this email.</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{order.id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {order.items[0]?.card && (
                    <div className="relative w-10 h-14 flex-shrink-0">
                      <Image src={order.items[0].card.imageUrl} alt="" fill className="object-contain" sizes="40px" />
                    </div>
                  )}
                  <span className="font-bold text-gray-900 dark:text-gray-100">€{order.total.toFixed(2)}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
