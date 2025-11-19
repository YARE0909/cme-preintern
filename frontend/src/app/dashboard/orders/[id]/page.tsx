"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import { ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";
import Loader from "@/components/Loader";

// ------------------------------
// TYPES
// ------------------------------
type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  items: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

// ------------------------------
// LOOKUP MAPS (TYPED)
// ------------------------------
const STATUS_COLOR_MAP: Record<OrderStatus, string> = {
  PENDING: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
  CONFIRMED: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  DELIVERED: "text-green-300 bg-green-500/10 border-green-500/20",
  CANCELLED: "text-red-300 bg-red-500/10 border-red-500/20",
};

const STATUS_ICON_MAP: Record<OrderStatus, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // FETCH ORDER + PRODUCT IMAGES
  // ------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const [orderRes, productsRes] = await Promise.all([
        apiClient.get(`/order/api/orders/${id}`),
        apiClient.get(`/product/api/products`),
      ]);

      if (!orderRes.success) {
        toast.error("Failed to load order");
        setLoading(false);
        return;
      }

      const orderData = orderRes.data as Order;
      const products =
        (productsRes.success ? (productsRes.data as Product[]) : []) ?? [];

      const productMap = new Map<string, string>();
      products.forEach((p) =>
        productMap.set(p.id, p.imageUrl || "/placeholder.jpg")
      );

      const enrichedOrder: Order = {
        ...orderData,
        items: orderData.items.map((item) => ({
          ...item,
          imageUrl: productMap.get(item.productId) || "/placeholder.jpg",
        })),
      };

      setOrder(enrichedOrder);
      setLoading(false);
    }

    if (id) load();
  }, [id]);

  if (loading) return <Loader />;
  if (!order)
    return <div className="text-gray-400 p-6 text-lg">Order not found</div>;

  // ------------------------------
  // COMPUTE BILL
  // ------------------------------
  const subtotal = Number(order.totalAmount);
  const deliveryFee = 30;
  const gst = Number(((subtotal + deliveryFee) * 0.05).toFixed(2));
  const total = subtotal + deliveryFee + gst;

  const StatusIcon = STATUS_ICON_MAP[order.status];

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      {/* HEADER CARD */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Order Details</h1>
            <p className="text-gray-400 text-sm mt-1">
              Order ID: <span className="text-gray-400">{order.id}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <h1 className="text-xs font-bold text-gray-400">Order Status</h1>
            <span
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border ${
                STATUS_COLOR_MAP[order.status]
              }`}
            >
              <StatusIcon size={16} /> {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-lg backdrop-blur-xl space-y-5">
        <h2 className="text-lg font-semibold text-white">Items</h2>

        <div className="space-y-4">
          {order.items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between border-b border-zinc-800 pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={it.imageUrl}
                  className="w-16 h-16 rounded-xl object-cover border border-zinc-700"
                  alt={it.productName}
                />

                <div>
                  <p className="text-white font-medium">{it.productName}</p>
                  <p className="text-gray-400 text-sm">Qty: {it.quantity}</p>
                </div>
              </div>

              <p className="text-white font-semibold">₹{it.subtotal}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BILL + PAYMENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* BILL SUMMARY */}
        <div className="md:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-4">
            Bill Summary
          </h2>

          <div className="space-y-2 text-gray-400 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>₹{gst}</span>
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-between text-white text-lg font-semibold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT STATUS */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-lg backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white">Payment</h2>

            <span
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border w-fit ${
                order.paymentStatus === "SUCCESS"
                  ? "text-green-300 bg-green-500/10 border-green-500/30"
                  : order.paymentStatus === "FAILED"
                  ? "text-red-300 bg-red-500/10 border-red-500/30"
                  : "text-yellow-300 bg-yellow-500/10 border-yellow-500/30"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
          {order.paymentStatus === "PENDING" ? (
            <button
              onClick={() =>
                router.push(`/dashboard/orders/payment?orderId=${order.id}`)
              }
              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 shadow transition text-sm font-bold cursor-pointer"
            >
              Complete Payment <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => router.push(`/dashboard/orders/new`)}
              className="w-full px-4 py-2.5 text-white border border-zinc-700 rounded-lg hover:bg-zinc-800 flex items-center justify-center gap-2 text-sm transition font-bold cursor-pointer"
            >
              Reorder <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
