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

  if (pathname.startsWith("/client/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden z-50"
         style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] ${active ? "text-violet-600" : "text-gray-400"}`}>
              <tab.icon className={`w-5 h-5 ${active ? "text-violet-600" : "text-gray-400"}`} />
              <span>{tab.label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-violet-600 mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
