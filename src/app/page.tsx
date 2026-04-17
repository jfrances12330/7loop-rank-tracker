"use client";
import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import SiteCard from "@/components/SiteCard";
import ScanButton from "@/components/ScanButton";
import { getSites, getStats, type Site, type Stats } from "@/lib/api";
import { Key, TrendingUp, MousePointer, Eye } from "lucide-react";

export default function Home() {
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSites(), getStats()])
      .then(([s, st]) => {
        setSites(s);
        setStats(st);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-20">
          <p className="text-red-600 text-lg font-semibold font-[Outfit]">
            No se pudo conectar con la API
          </p>
          <p className="text-neutral text-sm mt-2">
            Asegúrate de que el backend está corriendo en el VPS.
          </p>
        </div>
      </div>
    );
  }

  // Compute totals from sites for clicks/impressions (stats only has basic info)
  const totalKeywords = stats.total_keywords;
  const avgPosition = stats.avg_position;
  const improved = stats.improved;
  const declined = stats.declined;

  return (
    <div className="p-4 md:p-6 lg:p-10 space-y-5 md:space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 font-[Outfit]">
            Panel de seguimiento SEO
          </h1>
          <p className="text-sm md:text-base text-neutral mt-0.5 md:mt-1">
            Monitoriza las posiciones de todos tus sitios
          </p>
        </div>
        <ScanButton />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard
          icon={Key}
          label="Palabras clave"
          value={totalKeywords}
        />
        <StatCard
          icon={TrendingUp}
          label="Posición media"
          value={avgPosition !== null ? avgPosition.toFixed(1) : "\u2014"}
        />
        <StatCard
          icon={MousePointer}
          label="Mejoras"
          value={improved}
          subtitle="Keywords que han mejorado"
        />
        <StatCard
          icon={Eye}
          label="Caídas"
          value={declined}
          subtitle="Keywords que han caído"
        />
      </div>

      {/* Sites Overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 font-[Outfit] mb-5">
          Resumen de sitios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {sites.map((site) => (
            <SiteCard key={site.site_url} site={site} />
          ))}
        </div>
        {sites.length === 0 && (
          <div className="text-center py-12 text-neutral">
            No hay sitios configurados todavía.
          </div>
        )}
      </div>
    </div>
  );
}
