"use client";
import type { Device } from "@/lib/api";
import { Smartphone, Monitor, Globe2 } from "lucide-react";

interface Props {
  value: Device;
  onChange: (d: Device) => void;
  className?: string;
}

const OPTIONS: { value: Device; label: string; icon: typeof Smartphone }[] = [
  { value: "all", label: "Todos", icon: Globe2 },
  { value: "mobile", label: "Móvil", icon: Smartphone },
  { value: "desktop", label: "Desktop", icon: Monitor },
];

export default function DeviceToggle({ value, onChange, className = "" }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-xl bg-lavender/40 p-1 border border-violet/10 ${className}`}
      role="tablist"
      aria-label="Dispositivo"
    >
      {OPTIONS.map(({ value: v, label, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-white shadow-sm text-violet"
                : "text-neutral hover:text-gray-900"
            }`}
          >
            <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
