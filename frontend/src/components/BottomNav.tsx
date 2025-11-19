"use client";

import {
  Home,
  ShoppingBag,
  CreditCard,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";
import { useCart } from "@/context/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCart } = useCart();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  ];

  const handleLogout = () => {
    clearAuthToken();
    router.push("/auth/login");
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-150">
      <div className="flex gap-2 items-center">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 px-6 py-3 rounded-3xl shadow-lg flex items-center gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition ${
                  active
                    ? "text-indigo-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-400 transition cursor-pointer"
          >
            <LogOut size={22} />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
        {(pathname === "/dashboard/orders/new" || pathname === "/dashboard") && (
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 px-6 py-3 rounded-3xl shadow-lg flex items-center gap-8">
            <div
              className={`flex flex-col items-center gap-1 transition cursor-pointer text-gray-400 hover:text-gray-200`}
              onClick={toggleCart}
            >
              <ShoppingCart size={22} />
              <span className="text-[10px] font-medium">Cart</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
