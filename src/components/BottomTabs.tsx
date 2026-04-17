"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Globe, RefreshCw, Settings } from "lucide-react";

const tabs = [
  { href: "/", label: "Panel", icon: Home },
  { href: "/sites", label: "Sitios", icon: Globe },
  { href: "/scan", label: "Escanear", icon: RefreshCw },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export default function BottomTabs() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                active ? "text-[#7C3AED]" : "text-[#6B7280]"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
