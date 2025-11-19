"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import { loadCart, saveCart, CartItem, clearCart } from "@/lib/cart";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Package,
  UtensilsCrossed,
} from "lucide-react";
import Loader from "@/components/Loader";
import { useCart } from "@/context/CartContext";

export default function NewOrderPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { cartOpen, setCartOpen } = useCart();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const router = useRouter();

  // ---------------------------------------------
  // LOAD PRODUCTS + CART
  // ---------------------------------------------
  useEffect(() => {
    setCart(loadCart());

    async function load() {
      setLoading(true);

      const res = await apiClient.get("/product/api/products");

      if (!res.success) {
        toast.error("Failed to load products");
        setLoading(false);
        return;
      }

      setProducts(res.data || []);
      setLoading(false);
    }

    load();
  }, []);

  // ---------------------------------------------
  // FILTERING
  // ---------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        activeCategory === "all" || p.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, activeCategory]);

  // ---------------------------------------------
  // CART FUNCTIONS
  // ---------------------------------------------
  function addToCart(p: any, qty = 1) {
    const existing = cart.find((c) => c.productId === p.id);
    let next: CartItem[];

    if (existing) {
      next = cart.map((c) =>
        c.productId === p.id ? { ...c, quantity: c.quantity + qty } : c
      );
    } else {
      next = [
        ...cart,
        {
          productId: p.id,
          name: p.name,
          price: Number(p.price),
          imageUrl: p.imageUrl,
          quantity: qty,
        },
      ];
    }

    setCart(next);
    saveCart(next);
    toast.success("Added to cart");
  }

  function updateQty(id: string, q: number) {
    const next = cart
      .map((c) => (c.productId === id ? { ...c, quantity: Math.max(1, q) } : c))
      .filter(Boolean);

    setCart(next);
    saveCart(next);
  }

  function removeFromCart(id: string) {
    const next = cart.filter((c) => c.productId !== id);
    setCart(next);
    saveCart(next);
  }

  function goToCheckout() {
    if (cart.length === 0) return toast.error("Your cart is empty");
    router.push("/dashboard/orders/checkout");
  }

  // ---------------------------------------------
  // BILLING
  // ---------------------------------------------
  const subtotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const delivery = subtotal > 0 ? 30 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + delivery + tax;

  if (loading) return <Loader />;

  // ---------------------------------------------
  // UI STARTS HERE
  // ---------------------------------------------
  return (
    <div className="max-w-7xl mx-auto py-10 space-y-10 mb-20">
      {/* ------------------------------------------------ */}
      {/* TOP: HEADER + CART BUTTON */}
      {/* ------------------------------------------------ */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Explore Menu
        </h1>
      </div>

      {/* ------------------------------------------------ */}
      {/* SEARCH BAR */}
      {/* ------------------------------------------------ */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-10 py-3 text-gray-200 placeholder-gray-500 focus:border-indigo-500"
          placeholder="Search dishes…"
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ------------------------------------------------ */}
      {/* PRODUCT GRID */}
      {/* ------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition overflow-hidden shadow"
          >
            <img
              src={p.imageUrl}
              className="w-full h-48 object-cover group-hover:scale-[1.02] transition"
            />

            <div className="p-4">
              <p className="text-white font-bold truncate">{p.name}</p>
              <p
                className="text-gray-400 text-sm truncate"
                title={p.description}
              >
                {p.description}
              </p>
              <p className="text-gray-400 mt-1 font-bold">₹{p.price}</p>

              <button
                onClick={() => addToCart(p)}
                className="mt-3 w-full text-sm py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-bold cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------ */}
      {/* RIGHT SIDE CART DRAWER */}
      {/* ------------------------------------------------ */}
      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-200">
          {/* SLIDE PANEL */}
          <div
            className="w-96 h-full bg-zinc-900/95 border-l border-zinc-800 shadow-2xl
                 flex flex-col transform animate-slideIn"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Your Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* ITEMS LIST */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center text-center mt-10">
                  <UtensilsCrossed size={40} className="text-gray-500 mb-3" />
                  <p className="text-gray-300 text-sm">Your cart is empty</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Hungry? Add something tasty!
                  </p>
                </div>
              ) : (
                cart.map((it) => (
                  <div
                    key={it.productId}
                    className="flex items-center gap-4 bg-zinc-800/40 rounded-xl p-3 border border-zinc-800 hover:border-zinc-700 transition"
                  >
                    {/* IMAGE */}
                    <img
                      src={it.imageUrl}
                      className="w-16 h-16 rounded-lg object-cover border border-zinc-700"
                    />

                    {/* DETAILS */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{it.name}</p>
                      <p className="text-gray-400 text-xs font-bold">
                        ₹{it.price}
                      </p>

                      {/* QUANTITY CONTROLS */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQty(it.productId, it.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-700 hover:bg-zinc-600 text-white cursor-pointer"
                        >
                          <Minus size={18} />
                        </button>

                        <span className="text-gray-200 text-sm w-5 text-center">
                          {it.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQty(it.productId, it.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-700 hover:bg-zinc-600 text-white cursor-pointer"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    {/* REMOVE BUTTON */}
                    <button
                      onClick={() => removeFromCart(it.productId)}
                      className="text-red-400 hover:text-red-300 transition p-1 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* BILLING SUMMARY - STICKY FOOTER */}
            <div className="border-t border-zinc-800 px-6 py-5 bg-zinc-900/95">
              <div className="space-y-2 text-sm text-gray-400 font-bold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{delivery}</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{tax}</span>
                </div>

                <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-zinc-800">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                onClick={goToCheckout}
                className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
