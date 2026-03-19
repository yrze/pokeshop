"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DollarSign, ShoppingBag, Package, TrendingUp,
  AlertTriangle, Loader2,
} from "lucide-react";

interface Stats {
  totalRevenue: number;
  orderCount: number;
  cardCount: number;
  avgOrderValue: number;
  lowStockCards: { id: string; name: string; imageUrl: string; stock: number; price: number }[];
  recentOrders: { id: string; name: string; total: number; status: string; createdAt: string; items: { id: string }[] }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => data && setStats(data))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total Revenue", value: `€${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30" },
    { label: "Total Orders", value: stats.orderCount, icon: ShoppingBag, color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" },
    { label: "Cards in Stock", value: stats.cardCount, icon: Package, color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30" },
    { label: "Avg Order Value", value: `€${stats.avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Recent Orders</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">€{order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Low Stock
          </h2>
          {stats.lowStockCards.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">All cards are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockCards.map((card) => (
                <div key={card.id} className="flex items-center gap-3">
                  <div className="relative w-8 h-11 flex-shrink-0">
                    <Image src={card.imageUrl} alt={card.name} fill className="object-contain" sizes="32px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{card.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">€{card.price.toFixed(2)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    card.stock === 0
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {card.stock === 0 ? "Out of stock" : `${card.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
