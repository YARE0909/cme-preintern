"use client";

import { CartProvider, useCart } from "@/context/CartContext";
import BottomNav from "./BottomNav";
import { useEffect } from "react";
import {
  getAuthToken,
  getJwtRole,
  getJwtUserId,
  getJwtUsername,
  isTokenValid,
} from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser } = useCart();

  useEffect(() => {
    const token = isTokenValid();
    if (!token) return router.push("/auth/login");

    if (!user) {
      const jwtToken = getAuthToken();

      const userId = getJwtUserId(jwtToken);
      const userName = getJwtUsername(jwtToken);
      const role = getJwtRole(jwtToken);

      setUser({ id: userId, username: userName, role });
    }
  }, [user]);

  useEffect(() => {
    console.log({ user });
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-b from-black via-zinc-950 to-zinc-900">
      <BottomNav />
      <div className="flex flex-col w-full h-screen overflow-y-auto">
        <div className="px-6">{children}</div>
      </div>
    </div>
  );
}
