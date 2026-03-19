"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Package, CheckCircle, Truck, Clock, MapPin } from "lucide-react";

interface OrderDetail {
  id: string;
  name: string;
  email: string;
  address: string;
  total: number;
  status: string;
  statusHistory?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    card: { id: string; name: string; imageUrl: string; setName?: string | null };
  }[];
}

const STEPS = ["pending", "processing", "shipped", "delivered"];
const STEP_LABELS: Record<string, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};
const STEP_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  processing: <Package className="w-5 h-5" />,
  shipped: <Truck className="w-5 h-5" />,
  delivered: <CheckCircle className="w-5 h-5" />,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);

  const fetchOrder = (emailParam?: string) => {
    const lookupEmail = emailParam || email;
    if (!lookupEmail) {
      // Check if we have it from sessionStorage (set after checkout or lookup)
      const stored = sessionStorage.getItem(`order-email-${id}`);
      if (stored) {
        setEmail(stored);
        fetchOrder(stored);
        return;
      }
      setNeedsEmail(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/orders/${id}?email=${encodeURIComponent(lookupEmail)}`)
      .then((r) => {
        if (!r.ok) { setNeedsEmail(true); setOrder(null); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setOrder(data);
          setNeedsEmail(false);
          sessionStorage.setItem(`order-email-${id}`, lookupEmail);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-8" />
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-6">
          <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (needsEmail && !order) {
    return (
      <div className="max-w-sm mx-auto py-20">
        <div className="text-center mb-6">
          <Package className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Verify Your Email</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter the email you used to place this order.</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
          <form
            onSubmit={(e) => { e.preventDefault(); fetchOrder(email); }}
            className="space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ash@pokemon.com"
              required
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm"
            >
              View Order
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-32 text-gray-500 dark:text-gray-400">Order not found.</div>;
  }

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-7 h-7 text-red-600" />
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Order Details</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{order.id}</p>
        </div>
      </div>

      {/* Status Stepper */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, i) => {
            const isActive = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isCurrent
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600"
                  }`}
                >
                  {STEP_ICONS[step]}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center mt-2 px-5">
          {STEPS.slice(0, -1).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full mx-1 ${
                i < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
        {order.trackingNumber && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Tracking: <span className="font-mono font-bold">{order.trackingNumber}</span>
          </p>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Link href={`/cards/${item.card.id}`} className="relative w-10 h-14 flex-shrink-0">
                <Image src={item.card.imageUrl} alt={item.card.name} fill className="object-contain" sizes="40px" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/cards/${item.card.id}`} className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate hover:text-red-600 transition-colors block">
                  {item.card.name}
                </Link>
                {item.card.setName && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">{item.card.setName}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">×{item.quantity}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t dark:border-gray-800 mt-4 pt-4 flex justify-between font-black text-lg text-gray-900 dark:text-gray-100">
          <span>Total</span>
          <span>€{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Shipping Details
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">{order.name}</p>
          <p>{order.email}</p>
          <p className="whitespace-pre-line">{order.address}</p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          Ordered {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
