"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import { CreditCard, Smartphone, Wallet, Lock, ArrowRight } from "lucide-react";
import Loader from "@/components/Loader";

export default function PaymentPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get("orderId"));
  }, []);

  const router = useRouter();

  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [order, setOrder] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (!orderId) return;
    const res = await apiClient.get(`/order/api/orders/${orderId}`);
    if (res.success) {
      setOrder(res.data);
      setLoaded(true);
    } else {
      toast.error("Failed to load order details");
    }
  }

  useEffect(() => {
    load();
  }, [orderId]);

  // Compute totals
  const subtotal = order ? Number(order.totalAmount) : 0;
  const deliveryFee = 30;
  const gst = Number(((subtotal + deliveryFee) * 0.05).toFixed(2));
  const finalTotal = subtotal + deliveryFee + gst;

  async function simulatePayment() {
    if (!orderId) {
      toast.error("Order ID missing");
      return;
    }

    setProcessing(true);

    const res = await apiClient.post(
      `/payment/api/payments/pay?orderId=${orderId}`
    );

    if (!res.success) {
      toast.error(res.error || "Payment failed");
      setProcessing(false);
      return;
    }

    toast.success("Payment successful");
    router.push(`/dashboard/orders/${orderId}`);
  }

  const methods = [
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "card", label: "Card", icon: CreditCard },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

  if (!loaded) {
    return <Loader />;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-b from-black via-zinc-950 to-zinc-900">
      <div className="w-full max-w-xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl py-8 px-4 shadow-[0_0_40px_rgba(0,0,0,0.45)] space-y-5">
        {/* HEADER */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Complete Your Payment
          </h1>
          <p className="text-gray-400 text-sm">
            Order ID: <span className="text-gray-400">{orderId}</span>
          </p>
        </div>

        {/* PAYMENT METHODS */}
        <div className="flex justify-between bg-zinc-800/40 rounded-2xl p-3 gap-2">
          {methods.map((m) => {
            const Icon = m.icon;
            const active = m.id === selectedMethod;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`flex items-center gap-2 justify-center w-full py-2 rounded-xl border transition cursor-pointer
                  ${
                    active
                      ? "bg-indigo-600 border-indigo-500 shadow-lg text-white"
                      : "border-zinc-700 hover:border-zinc-500 text-gray-400"
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-sm font-bold">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* PAYMENT INPUTS */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6">
          {selectedMethod === "upi" && (
            <div className="space-y-3">
              <p className="text-gray-400 font-medium">UPI Payment</p>

              <input
                type="text"
                placeholder="Enter UPI ID (example@upi)"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lock size={12} /> UPI details are simulated only.
              </p>
            </div>
          )}

          {selectedMethod === "card" && (
            <div className="space-y-4">
              <p className="text-gray-400 font-medium">Card Details</p>

              <input
                type="text"
                placeholder="Card Number"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-1/2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="w-1/2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lock size={12} /> Card processing is simulated.
              </p>
            </div>
          )}

          {selectedMethod === "wallet" && (
            <div className="space-y-3">
              <p className="text-gray-400 font-medium">Choose Wallet</p>

              <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Paytm Wallet</option>
                <option>PhonePe Wallet</option>
                <option>Amazon Pay</option>
              </select>

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lock size={12} /> Wallet balance is not checked (simulation).
              </p>
            </div>
          )}

          {/* ORDER SUMMARY */}
          {order && (
            <div className="pt-5 border-t border-zinc-800 space-y-3">
              <h2 className="text-lg font-semibold text-white">
                Order Summary
              </h2>

              <div className="space-y-1 text-gray-400 text-sm font-bold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{gst}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-zinc-800">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          )}
        </div>

        {/* PAY BUTTON */}
        <button
          onClick={simulatePayment}
          disabled={processing}
          className={`w-full py-4 rounded-xl text-lg font-bold cursor-pointer flex items-center justify-center gap-2
            ${
              processing
                ? "bg-zinc-700 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
            }
          `}
        >
          {processing ? "Processing…" : "Pay Securely"}
          {!processing && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
