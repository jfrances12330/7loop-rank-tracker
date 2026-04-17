"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import SiteCard from "@/components/SiteCard";
import ScanButton from "@/components/ScanButton";
import { getSites, getStats, type Site, type Stats } from "@/lib/api";

export default function Home() {
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSites(), getStats()])
      .then(([s, st]) => { setSites(s); setStats(st); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="animate-pulse text-lavender/40 text-lg">Cargando datos...</div>
        </main>
      </>
    );
  }

  if (error || !stats) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 text-lg font-semibold">No se pudo conectar con la API</p>
            <p className="text-lavender/50 text-sm mt-2">Verifica que el backend esta corriendo en el VPS.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon="🌐" label="Sitios web" value={stats.total_sites} color="from-indigo to-violet" />
          <StatCard icon="🔑" label="Keywords" value={stats.total_keywords} color="from-violet to-pink-500" />
          <StatCard
            icon="📊"
            label="Posicion media"
            value={stats.avg_position !== null ? stats.avg_position.toFixed(1) : "—"}
            color="from-emerald-400 to-cyan-400"
          />
          <StatCard
            icon="📅"
            label="Ultimo scan"
            value={stats.last_scan || "—"}
            color="from-amber-400 to-orange-500"
            sub={`${stats.improvements} mejoras / ${stats.drops} caidas`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-[Outfit]">Sitios web</h2>
          <ScanButton />
        </div>

        {/* Sites grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.site_url} site={site} />
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-sm text-lavender/30">
        7Loop SEO Tracker — {new Date().getFullYear()}
      </footer>
    </>
  );
}
