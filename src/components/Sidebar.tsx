"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSites, type Site } from "@/lib/api";
import {
  LayoutDashboard,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesOpen, setSitesOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getSites().then(setSites).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
  ];

  const isActive = (href: string) => pathname === href;
  const isSiteActive = (slug: string) => pathname === `/site/${slug}`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <img
          src="/icon-192.png"
          alt="7Loop"
          className="w-9 h-9 rounded-lg"
        />
        <div>
          <h1 className="text-white font-bold text-lg font-[Outfit] leading-tight">
            7Loop
          </h1>
          <p className="text-white/50 text-xs leading-tight">SEO Tracker</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-indigo text-white shadow-lg shadow-indigo/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}

        {/* Sites section */}
        <button
          onClick={() => setSitesOpen(!sitesOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Globe className="w-[18px] h-[18px]" />
          <span className="flex-1 text-left">Sites</span>
          {sitesOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {sitesOpen && (
          <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5">
            {sites.map((site) => {
              const active = isSiteActive(site.slug);
              const displayName = site.site_url
                .replace(/^https?:\/\//, "")
                .replace(/\/$/, "");
              return (
                <Link
                  key={site.slug}
                  href={`/site/${site.slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 truncate ${
                    active
                      ? "bg-indigo/80 text-white font-medium"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                  title={site.site_url}
                >
                  {displayName}
                </Link>
              );
            })}
            {sites.length === 0 && (
              <p className="px-3 py-2 text-xs text-white/30">Loading...</p>
            )}
          </div>
        )}

        {/* Settings */}
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">
          Powered by <span className="text-white/50 font-medium">7Loop</span>
        </p>
        <p className="text-white/20 text-[10px] mt-0.5">v1.0.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-midnight text-white p-2 rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-gradient-to-b from-sidebar-from to-sidebar-to transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-[260px] bg-gradient-to-b from-sidebar-from to-sidebar-to z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
