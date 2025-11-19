"use client";

import DashboardShell from "@/components/DashboardShell";
import { getAuthToken, isTokenValid } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = isTokenValid();
    if (!token) router.push("/auth/login");
  }, []);

  return <DashboardShell>{children}</DashboardShell>;
}
