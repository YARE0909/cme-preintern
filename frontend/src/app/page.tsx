"use client";

import { decodeJwt, getAuthToken, isTokenValid } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const valid = isTokenValid();
    if (!valid) {
      return router.push("/auth/login");
    }
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
    } else {
      const decoded = decodeJwt(token);
      if (decoded.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, []);
  return <div className="p-8"></div>;
}
