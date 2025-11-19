"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Loader from "@/components/Loader";
import { Clock, CheckCircle, XCircle, Banknote, Plus, Box } from "lucide-react";
import { useCart } from "@/context/CartContext";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

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
  createdAt: string;
  items: OrderItem[];
}

const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  PENDING: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
  CONFIRMED: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  DELIVERED: "text-green-300 bg-green-500/10 border-green-500/20",
  CANCELLED: "text-red-300 bg-red-500/10 border-red-500/20",
};

const PAYMENT_STATUS_MAP: Record<PaymentStatus, string> = {
  SUCCESS: "text-green-300 bg-green-500/10 border-green-500/20",
  FAILED: "text-red-300 bg-red-500/10 border-red-500/20",
  PENDING: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
};

const STATUS_ICON_MAP: Record<OrderStatus, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCart();

  async function load() {
    setLoading(true);

    console.log({ user });

    const [ordersRes, productsRes] = await Promise.all([
      apiClient.get(`/order/api/orders/user/${user.id}`),
      apiClient.get("/product/api/products"),
    ]);

    if (!ordersRes.success) {
      toast.error("Failed to load orders");
      setLoading(false);
      return;
    }

    const orderData = ordersRes.data as Order[];
    console.log({ orderData });
    const productData = productsRes.success
      ? (productsRes.data as Product[])
      : [];

    // Map product images to items
    const productMap = new Map<string, string>();
    productData.forEach((p) =>
      productMap.set(p.id, p.imageUrl || "/placeholder.jpg")
    );

    const enrichedOrders = orderData.map((order) => ({
      ...order,
      items: order.items.map((i) => ({
        ...i,
        imageUrl: productMap.get(i.productId) || "/placeholder.jpg",
      })),
    }));

    setOrders(enrichedOrders);
    setLoading(false);
  }

  // Fetch orders + product images
  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-10 py-10 max-w-6xl mx-auto mb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          Your Orders
        </h1>

        <Link
          href="/dashboard/orders/new"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition font-bold cursor-pointer flex items-center gap-2"
        >
          <Plus className="inline-block" size={20} />
          New Order
        </Link>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-gray-500">
          <Box className="w-16 h-16 mb-4 stroke-current text-gray-300" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-lg mb-4">Place your first order to get started.</p>
        </div>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orders
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((order) => {
            const firstItem = order.items[0];
            const StatusIcon = STATUS_ICON_MAP[order.status];

            return (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-lg hover:bg-zinc-900 transition backdrop-blur-xl"
              >
                {/* Image */}
                <img
                  src={firstItem.imageUrl}
                  alt={firstItem.productName}
                  className="w-full h-40 object-cover rounded-xl border border-zinc-800 mb-4 group-hover:scale-[1.02] transition"
                />

                {/* Item Name */}
                <p className="text-white text-lg font-medium truncate">
                  {firstItem.productName}
                </p>

                {/* Order Meta */}
                <p className="text-gray-400 text-sm mt-1">
                  {order.items.length} item(s) • ₹{order.totalAmount}
                </p>

                <p className="text-gray-500 text-xs mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                {/* Status Section */}
                <div className="mt-4 flex items-center justify-between">
                  {/* Order status */}
                  <span
                    className={`px-3 py-1 text-xs rounded-lg border flex items-center gap-1 ${
                      ORDER_STATUS_MAP[order.status]
                    }`}
                  >
                    <StatusIcon size={12} /> {order.status}
                  </span>

                  {/* Payment status */}
                  <span
                    className={`px-3 py-1 text-xs rounded-lg border flex items-center gap-1 ${
                      PAYMENT_STATUS_MAP[order.paymentStatus]
                    }`}
                  >
                    <Banknote size={14} />
                    {order.paymentStatus}
                  </span>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
