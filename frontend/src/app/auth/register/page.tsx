"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import AuthCard from "@/components/AuthCard";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import { User, Mail, Lock, Phone, IdCard, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveAuthToken } from "@/lib/auth";
import { apiClient } from "@/lib/apiClient";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: any) {
    e.preventDefault();

    if (!username || !fullName || !email || !phone || !password) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      const payload = {
        username,
        email,
        passwordHash: password,
        fullName,
        phone,
        role: "USER",
      };

      const res = await apiClient.post("/api/users/register", payload);
      const { status, data, success } = res;

      if (status === 200 && success) {
        saveAuthToken(data.token);
        toast.success("Welcome to NourishNow!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-zinc-900 px-6">

      <div className="flex w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-xl">
        <div className="hidden md:flex relative w-1/2">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=749&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
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

        {/* ---------------- RIGHT SIDE (FORM) ---------------- */}
        <div className="w-full md:w-1/2 p-10 flex items-center justify-center">
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20 animate-pulse-slow">
                <Utensils size={42} className="text-indigo-400" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Create Your NourishNow Account
            </h2>

            <form onSubmit={onSubmit} className="space-y-5">

              <InputField
                label="Username"
                value={username}
                onChange={setUsername}
                icon={User}
              />

              <InputField
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                icon={IdCard}
              />

              <InputField
                label="Email"
                value={email}
                onChange={setEmail}
                icon={Mail}
              />

              <InputField
                label="Phone"
                value={phone}
                onChange={setPhone}
                icon={Phone}
              />

              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                icon={Lock}
              />

              <SubmitButton
                label="Create Account"
                loading={loading}
                type="submit"
              />
            </form>

            {/* Already have account */}
            <p className="text-center text-sm text-gray-400 mt-6">
              Already a member?{" "}
              <a
                href="/auth/login"
                className="text-indigo-400 hover:underline font-medium"
              >
                Login
              </a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
