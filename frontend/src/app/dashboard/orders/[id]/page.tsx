"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Truck,
  FileText,
  Calendar,
  Clock11,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import Loader from "@/components/Loader";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
  price: number;
}

interface Order {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  paymentReferenceId?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

const STATUS_COLOR_MAP: Record<OrderStatus, string> = {
  PENDING: "text-yellow-300 bg-yellow-500/8 border-yellow-500/20",
  CONFIRMED: "text-blue-300 bg-blue-500/8 border-blue-500/20",
  DELIVERED: "text-green-300 bg-green-500/8 border-green-500/20",
  CANCELLED: "text-red-300 bg-red-500/8 border-red-500/20",
};

const STATUS_ICON_MAP: Record<OrderStatus, any> = {
  PENDING: Clock,
  CONFIRMED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

const ORDER_STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "DELIVERED"];

function prettyDate(iso?: string) {
  if (!iso) return "N/A";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function estimateEta(createdAt?: string) {
  if (!createdAt) return "—";
  const base = new Date(createdAt).getTime();
  const seed = (base % 1000) % 21; // 0..20
  const offset = 15 + seed; // 15..35
  const eta = new Date(base + offset * 60_000);
  const now = new Date();
  const minutesLeft = Math.max(
    0,
    Math.round((eta.getTime() - now.getTime()) / 60000)
  );
  return {
    etaText: `${eta.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    minutesLeft,
  };
}

function createInvoiceText(order: Order) {
  const lines: string[] = [];
  lines.push(`Invoice — Order ${order.id}`);
  lines.push(`Date: ${prettyDate(order.createdAt)}`);
  lines.push("");
  lines.push("Items:");
  order.items.forEach((it) =>
    lines.push(
      ` - ${it.productName} x ${it.quantity}  @ ₹${it.price}  = ₹${it.subtotal}`
    )
  );
  const subtotal = Number(order.totalAmount);
  const delivery = 30;
  const gst = Number(((subtotal + delivery) * 0.05).toFixed(2));
  lines.push("");
  lines.push(`Subtotal: ₹${subtotal.toFixed(2)}`);
  lines.push(`Delivery: ₹${delivery.toFixed(2)}`);
  lines.push(`GST (5%): ₹${gst.toFixed(2)}`);
  lines.push(`Total: ₹${(subtotal + delivery + gst).toFixed(2)}`);
  lines.push("");
  lines.push("Thank you for ordering with NourishNow!");
  return lines.join("\n");
}

function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressPulse, setProgressPulse] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [orderRes, productsRes] = await Promise.all([
          apiClient.get(`/order/api/orders/${id}`),
          apiClient.get(`/product/api/products`),
        ]);

        if (!orderRes.success) {
          toast.error("Failed to load order data");
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
      } catch (err) {
        console.error(err);
        toast.error("Unexpected error while loading order");
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setProgressPulse((p) => !p), 1200);
    return () => clearInterval(t);
  }, []);

  if (loading) return <Loader />;
  if (!order)
    return <div className="text-gray-400 p-6 text-lg">Order not found</div>;

  const subtotal = Number(order.totalAmount);
  const deliveryFee = 30;
  const gst = Number(((subtotal + deliveryFee) * 0.05).toFixed(2));
  const total = subtotal + deliveryFee + gst;

  const StatusIcon = STATUS_ICON_MAP[order.status];

  const { etaText, minutesLeft } = estimateEta(order.createdAt) as any;

  const currentStepIndex =
    ORDER_STEPS.indexOf(order.status) >= 0
      ? ORDER_STEPS.indexOf(order.status)
      : 0;

  const handleDownloadInvoice = () => {
    const text = createInvoiceText(order);
    downloadTextFile(`invoice-${order.id}.txt`, text);
    toast.success("Invoice downloaded (mock)");
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8 mb-20">
      <div className="flex flex-col md:flex md:flex-row items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Order
          </h1>
          <p className="text-gray-400 mt-1">
            Track your order and payment details
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="px-4 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-gray-200 hover:bg-zinc-800 transition font-bold cursor-pointer flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Back to Orders
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition font-bold flex items-center gap-2 cursor-pointer"
            title="Download invoice"
          >
            <Download size={16} /> Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/75 border border-zinc-800 rounded-2xl p-6 shadow-lg backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Order #{order.id.slice(0, 8)}
              </h2>
              <p className="text-gray-400 mt-1">
                Placed on {prettyDate(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                  STATUS_COLOR_MAP[order.status]
                }`}
              >
                <StatusIcon size={16} /> {order.status}
              </span>

              <span className="text-sm text-gray-400">
                Payment:{" "}
                <span
                  className={
                    order.paymentStatus === "SUCCESS"
                      ? "text-green-300 font-semibold"
                      : order.paymentStatus === "FAILED"
                      ? "text-red-300 font-semibold"
                      : "text-yellow-300 font-semibold"
                  }
                >
                  {order.paymentStatus}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex flex-col gap-2 justify-between">
            <div>
              <p className="text-sm text-gray-400">Estimated delivery</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-white">{etaText}</h3>
                <span className="text-2xl font-bold text-gray-400">
                  ({minutesLeft} min)
                </span>
              </div>
            </div>

            <div className="flex flex-col text-gray-400 text-xs">
              <div className="flex items-center gap-1">
                <Calendar size={14} />{" "}
                <span>{prettyDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Clock11 size={14} />{" "}
                <span>Updated {prettyDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800">
            <p className="text-xs text-gray-400">Delivery address</p>
            <p className="mt-1 text-sm text-white font-semibold flex items-center gap-2">
              <MapPin size={14} /> Home (mock)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/75 border border-zinc-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6">
          Order Progress
        </h3>
        {order.status !== "CANCELLED" ? (
          <div className="relative flex items-center justify-between w-full">
            {ORDER_STEPS.map((step, idx) => {
              const StepIcon = STATUS_ICON_MAP[step];
              const active = idx <= currentStepIndex;

              return (
                <div
                  key={step}
                  className="flex flex-col items-center relative flex-1 text-center"
                >
                  {idx > 0 && (
                    <div
                      className={`absolute left-0 top-[22px] h-1 w-full -translate-x-1/2 transition-all
                ${idx <= currentStepIndex ? "bg-indigo-600" : "bg-zinc-700"}
              `}
                    ></div>
                  )}
                  <div
                    className={`
              w-12 h-12 rounded-full flex items-center justify-center
              border transition-all duration-300 backdrop-blur z-50
              ${
                active
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-zinc-800 border-zinc-700 text-gray-400"
              }
            `}
                  >
                    <StepIcon size={20} />
                  </div>
                  <p
                    className={`mt-3 text-sm font-medium transition-all ${
                      active ? "text-indigo-300" : "text-gray-500"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center relative flex-1 text-center">
            <div
              className={`
              w-12 h-12 rounded-full flex items-center justify-center
              border transition-all duration-300 backdrop-blur z-50 bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30`}
            >
              <XCircle size={20} />
            </div>
            {/* Label */}
            <p
              className={`mt-3 text-sm font-medium transition-all text-red-300`}
            >
              Cancelled
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Items</h3>

          <div className="divide-y divide-zinc-800">
            {order.items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={it.imageUrl}
                    alt={it.productName}
                    className="w-20 h-20 rounded-xl object-cover border border-zinc-700"
                  />
                  <div>
                    <div className="text-white font-semibold">
                      {it.productName}
                    </div>
                    <div className="text-sm text-gray-400">
                      ₹{it.price.toFixed(2)} × {it.quantity}
                    </div>
                  </div>
                </div>

                <div className="text-white font-semibold">
                  ₹{it.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Billing</h3>

            <div className="mt-4 space-y-2 text-gray-300 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>

              <div className="mt-3 border-t border-zinc-700 pt-3 flex justify-between text-white text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {order.paymentStatus === "PENDING" ? (
              <button
                onClick={() =>
                  router.push(`/dashboard/orders/payment?orderId=${order.id}`)
                }
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                Complete Payment <ArrowRight size={16} />
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push(`/dashboard/orders/new`)}
                  className="w-full px-4 py-3 border border-zinc-700 hover:bg-zinc-800 text-white rounded-xl font-bold shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  Reorder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
