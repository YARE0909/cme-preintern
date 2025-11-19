import React from "react";

export default function AuthCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-semibold mb-6 text-center">{title}</h1>
        {children}
      </div>
    </div>
  );
}
