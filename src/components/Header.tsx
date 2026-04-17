"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-violet/20 bg-midnight/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo to-violet flex items-center justify-center text-white font-bold text-lg font-[Outfit] shadow-lg shadow-violet/30">
            7L
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-[Outfit] tracking-tight">
              SEO Tracker
            </h1>
            <p className="text-xs text-gray -mt-0.5">by 7Loop</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-sm text-lavender/60">
          <span className="hidden sm:inline">Rank Tracking Dashboard</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </header>
  );
}
