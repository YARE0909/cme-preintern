"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Users,
  BarChart2,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuthToken,
  decodeJwt,
  getAuthToken,
  isTokenValid,
} from "@/lib/auth";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: CreditCard },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const valid = isTokenValid();
    if (!valid) {
      return router.push("/auth/login");
    }
    const token = getAuthToken();
    if (!token) router.push("/auth/login");

    const decoded = decodeJwt(token);
    if (decoded.role !== "ADMIN") {
      router.push("/dashboard");
    } else {
      setAdminName(decoded.sub || "Admin");
    }
  }, []);

  const logout = () => {
    clearAuthToken();
    router.push("/auth/login");
  };

  return (
    <div className="w-full h-screen overflow-hidden flex bg-black text-gray-100">
      {/* --------------------- */}
      {/* SIDEBAR */}
      {/* --------------------- */}
      <aside className="w-64 h-screen hidden md:flex flex-col bg-zinc-900/60 border-r border-zinc-800 backdrop-blur-xl p-6">
        {/* Title */}
        <div className="text-2xl font-bold text-white tracking-wide mb-8">
          Admin<span className="text-indigo-500">Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                  ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:bg-zinc-800/60 hover:text-gray-200"
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-6">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition cursor-pointer"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* --------------------- */}
      <main className="w-full h-full overflow-y-auto flex-1 p-6 space-y-6">
        {/* PAGE CONTENT */}
        <div className="animate-fadeIn">{children}</div>
      </main>
    </div>
  );
}
