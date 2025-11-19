"use client";

import DashboardShell from "@/components/DashboardShell";
import { CartProvider, useCart } from "@/context/CartContext";
import { apiClient } from "@/lib/apiClient";
import {
  decodeJwt,
  getAuthToken,
  getJwtRole,
  getJwtUserId,
  getJwtUsername,
  isTokenValid,
} from "@/lib/auth";
import { CartItem, loadCart, saveCart } from "@/lib/cart";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <CartProvider>
      <DashboardShell>{children}</DashboardShell>
    </CartProvider>
  );
}
