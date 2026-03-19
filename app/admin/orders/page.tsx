"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Package } from "lucide-react";

interface Order {
  id: string;
  name: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: { id: string; quantity: number; price: number; card: { name: string; imageUrl: string } }[];
}

const STATUSES = ["", "pending", "processing", "shipped", "delivered"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = (statusFilter = filter) => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/orders${params}`)
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((data) => data && setOrders(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    loadOrders();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package className="w-7 h-7 text-red-600" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">Orders</h1>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); loadOrders(e.target.value); }}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y dark:divide-gray-800">
            {orders.map((order) => (
              <div key={order.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{order.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">€{order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="relative w-8 h-11 flex-shrink-0">
                        <Image src={item.card.imageUrl} alt={item.card.name} fill className="object-contain" sizes="32px" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">+{order.items.length - 3} more</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
