"use client";

import { Loader2 } from "lucide-react";

export default function SubmitButton({
  label,
  loading,
  onClick,
  type = "button",
}: {
  label: string;
  loading: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed py-2 rounded-xl text-center flex justify-center items-center gap-2 font-bold cursor-pointer"
      onClick={onClick}
      type={type}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : null}
      {label}
    </button>
  );
}
