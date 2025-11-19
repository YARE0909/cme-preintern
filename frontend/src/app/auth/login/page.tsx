"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import AuthCard from "@/components/AuthCard";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import { Mail, Lock, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { getJwtRole, saveAuthToken } from "@/lib/auth";
import { apiClient } from "@/lib/apiClient";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!username || !password) return toast.error("All fields required");

    try {
      setLoading(true);

      const res = await apiClient.post("/user/api/users/login", {
        username,
        password,
      });

      const { status, data, success } = res;

      if (!success) {
        toast.error("Invalid credentials");
        return;
      }

      if (status === 200) {
        const token = data.token;

        // Save JWT
        saveAuthToken(token);

        // Decode role
        const role = getJwtRole(token); // "USER" or "ADMIN"

        toast.success("Welcome back!");

        // Redirect based on role
        if (role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-zinc-900 px-6">
      {/* --- CONTAINER --- */}
      <div className="flex w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div className="hidden md:flex relative w-1/2">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://plus.unsplash.com/premium_photo-1663858367001-89e5c92d1e0e?q=80&w=1000&auto=format&fit=crop')",
            }}
          />

          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 backdrop-blur-[2px]" />

          {/* TEXT CONTENT */}
          <div className="relative z-10 p-10 flex flex-col justify-between h-full">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                Welcome to <span className="text-indigo-400">NourishNow</span>
              </h1>

              <p className="mt-4 text-gray-300 text-sm leading-relaxed max-w-xs drop-shadow-lg">
                Delicious meals delivered at lightning speed. Sign in to
                continue your food journey!
              </p>
            </div>
          </div>
        </div>

        {/* ----------------------------- */}
        {/* RIGHT SIDE — LOGIN FORM */}
        {/* ----------------------------- */}
        <div className="w-full md:w-1/2 p-10 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20 animate-pulse-slow">
                <Utensils size={42} className="text-indigo-400" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Login to NourishNow
            </h2>

            {/* --- FORM --- */}
            <form onSubmit={onSubmit} className="space-y-5">
              <InputField
                label="Username"
                value={username}
                onChange={setUsername}
                icon={Mail}
              />

              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                icon={Lock}
              />

              <SubmitButton label="Login" loading={loading} type="submit" />
            </form>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{" "}
              <a
                href="/auth/register"
                className="text-indigo-400 hover:underline font-medium"
              >
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
