"use client";

import { useEffect, useState } from "react";
import { loadCart, clearCart } from "@/lib/cart";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { decodeJwt, getAuthToken } from "@/lib/auth";
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [placing, setPlacing] = useState(false);
  const [user, setUser] = useState<{ username: string; userId: number | undefined } | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    setCart(loadCart());
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const decoded = decodeJwt(token);
      setUser({ username: decoded.username, userId: decoded.userId });
    }
  }, []);

  if (!cart || cart.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-gray-400 p-6 text-center">
        <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl shadow-xl flex flex-col items-center gap-4">
          <ShoppingCart className="text-gray-500" size={60} />

          <h2 className="text-2xl font-semibold text-white">
            Your Cart is Empty
          </h2>

          <p className="text-gray-400 max-w-xs">
            Looks like you haven't added anything yet.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-3 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const delivery = subtotal > 0 ? 30 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + delivery + tax;

  async function placeOrder() {
    setPlacing(true);

    const items = cart.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
    }));

    try {
      const res = await apiClient.post("/order/api/orders", {
        userId: user?.userId,
        items,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to place order");
        setPlacing(false);
        return;
      }

      const created = res.data;

      // Clear cart + redirect
      clearCart();
      sessionStorage.setItem("nourish_last_order_id", created.id);

      router.push(`/dashboard/orders/payment?orderId=${created.id}`);
    } catch (err) {
      toast.error("Order placement failed");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      {/* HEADER */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl shadow-xl p-8 backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Checkout
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Review your items and complete your order.
        </p>
      </div>

      {/* ITEMS CARD */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl shadow-xl p-8 backdrop-blur-lg space-y-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your Items</h2>

        <div className="space-y-5">
          {cart.map((it) => (
            <div
              key={it.productId}
              className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={it.imageUrl || "/placeholder.jpg"}
                  className="w-16 h-16 rounded-xl object-cover border border-zinc-700"
                />

                <div>
                  <p className="text-white font-medium text-lg">{it.name}</p>
                  <p className="text-gray-400 text-sm">Qty: {it.quantity}</p>
                </div>
              </div>

              <p className="text-white font-semibold text-lg">
                ₹{it.price * it.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BILLING SUMMARY */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl shadow-xl p-8 backdrop-blur-lg">
        <h2 className="text-xl font-semibold text-white mb-6">
          Billing Summary
        </h2>

        <div className="space-y-3 text-gray-400 text-sm font-bold">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>₹{delivery}</span>
          </div>

          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>₹{tax}</span>
          </div>

          <div className="border-t border-zinc-800 pt-4 flex justify-between text-lg text-white font-bold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={placeOrder}
            disabled={placing}
            className={`flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2 shadow-lg transition font-bold cursor-pointer
              ${
                placing
                  ? "bg-zinc-700 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {placing ? "Placing…" : "Place Order"} <ArrowRight size={18} />
          </button>

          <button
            onClick={() => router.back()}
            className="py-3 px-6 border border-zinc-700 rounded-xl text-gray-400 hover:bg-zinc-800 flex items-center gap-2 font-bold cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
