import { LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  label: string;
  type?: string;
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
};

export default function InputField({ label, type = "text", icon: Icon, value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-zinc-400">{label}</label>

      <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800">
        <Icon size={18} className="text-zinc-500" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none w-full text-zinc-200"
        />
      </div>
    </div>
  );
}
