"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import { loadCart, saveCart, clearCart, CartItem } from "@/lib/cart";
import { decodeJwt, getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<{
    username: string | undefined;
    userId: number | undefined;
  } | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { cartOpen, setCartOpen } = useCart();

  /* LOAD USER */
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const decoded = decodeJwt(token);
      setUser({ username: decoded.sub, userId: decoded.userId });
    }
  }, []);

  /* LOAD PRODUCTS */
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await apiClient.get("/product/api/products");

      if (!res.success) {
        setLoading(false);
        return;
      }

      const data = res.data;
      setProducts(data);
      setRecommended(data.slice(0, 6));
      setLoading(false);
    }

    setCart(loadCart());
    load();
  }, []);

  /* FILTERED PRODUCTS */
  const filtered = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* CART LOGIC */
  function addToCart(p: any) {
    const exists = cart.find((c) => c.productId === p.id);
    let next: CartItem[];

    if (exists) {
      next = cart.map((c) =>
        c.productId === p.id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      next = [
        ...cart,
        {
          productId: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          quantity: 1,
        },
      ];
    }

    setCart(next);
    saveCart(next);
    toast.success(`${p.name} added`);
  }

  const updateQty = (id: string, qty: number) => {
    const next = cart
      .map((c) =>
        c.productId === id ? { ...c, quantity: Math.max(1, qty) } : c
      )
      .filter(Boolean);

    setCart(next);
    saveCart(next);
  };

  const removeItem = (id: string) => {
    const next = cart.filter((c) => c.productId !== id);
    setCart(next);
    saveCart(next);
  };

  const goToCheckout = () => router.push("/dashboard/orders/checkout");

  const subtotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const delivery = subtotal > 0 ? 30 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + delivery + tax;

  if (loading) return <Loader />;

  /* -------------------------------------------------- */
  /* RESPONSIVE UI START */
  /* -------------------------------------------------- */
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 mb-20">
      {/* HERO SECTION */}
      <div
        className="
    relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800
    h-[260px] sm:h-[300px] flex items-center
  "
      >
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // 👈 Add any nice food-themed background image here
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70" />

        {/* Content */}
        <div className="relative px-8 sm:px-12 z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-xl">
            Hey, {user?.username}
          </h1>

          <p className="text-gray-300 mt-3 text-lg sm:text-xl font-medium max-w-md">
            Craving something delicious? We've curated meals just for you.
          </p>

          {/* Explore Button (optional improvement) */}
          <button
            onClick={() =>
              document
                .getElementById("menu-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="
        mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white
        rounded-xl font-bold text-sm shadow-lg cursor-pointer
      "
          >
            Explore Menu
          </button>
        </div>
      </div>

      {/* RECOMMENDED */}
      <h2 className="text-xl sm:text-2xl text-white font-semibold">
        Recommended
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommended.slice(0, 6).map((p) => (
          <div
            key={p.id}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3
             shadow hover:bg-zinc-800 transition flex items-center justify-between gap-3"
          >
            <div className="flex flex-col justify-center flex-1">
              <p className="text-white font-semibold text-[15px] leading-tight">
                {p.name}
              </p>

              <p className="text-gray-400 text-sm mt-1">₹{p.price}</p>

              <button
                onClick={() => addToCart(p)}
                className="mt-2 w-fit px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 
                 text-white font-bold text-xs cursor-pointer"
              >
                Add To Cart
              </button>
            </div>
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH + CART BUTTON */}
      <div
        id="menu-section"
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
      >
        <div className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow">
          <Search className="text-gray-500" size={20} />
          <input
            className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500"
            placeholder="Search for dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* MENU LIST */}
      <h2 className="text-xl sm:text-2xl text-white font-semibold">
        Explore Menu
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-lg group hover:bg-zinc-800 transition"
          >
            <img src={p.imageUrl} className="w-full h-48 object-cover" />

            <div className="p-5 space-y-2">
              <div className="flex flex-col">
                <p className="text-xl font-semibold text-white">{p.name}</p>
                <p className="text-gray-400 text-sm">{p.description}</p>
              </div>
              <p className="text-gray-400 font-bold">₹{p.price}</p>

              <button
                onClick={() => addToCart(p)}
                className="w-full mt-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end sm:justify-end z-50">
          <div className="w-full sm:w-96 h-full bg-zinc-900 border-l border-zinc-800 shadow-xl flex flex-col animate-slideIn">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Your Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* ITEMS */}
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
                    className="flex items-center gap-4 bg-zinc-800/40 rounded-xl p-3 border border-zinc-700"
                  >
                    <img
                      src={it.imageUrl}
                      className="w-16 h-16 rounded-lg object-cover border border-zinc-700"
                    />

                    <div className="flex-1">
                      <p className="text-white font-bold truncate">{it.name}</p>
                      <p className="text-gray-400 text-xs">₹{it.price}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQty(it.productId, it.quantity - 1)
                          }
                          className="w-6 h-6 bg-zinc-700 hover:bg-zinc-600 rounded-md flex items-center justify-center cursor-pointer"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="text-gray-200 w-5 text-center">
                          {it.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQty(it.productId, it.quantity + 1)
                          }
                          className="w-6 h-6 bg-zinc-700 hover:bg-zinc-600 rounded-md flex items-center justify-center cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(it.productId)}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-zinc-800 px-6 py-5 bg-zinc-900">
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{delivery}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax}</span>
                </div>

                <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-zinc-700">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={goToCheckout}
                className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg cursor-pointer"
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
