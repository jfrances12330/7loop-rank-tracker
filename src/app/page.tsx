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
            Could not connect to the API
          </p>
          <p className="text-neutral text-sm mt-2">
            Make sure the backend is running on the VPS.
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
    <div className="p-6 lg:p-10 space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-[Outfit]">
            SEO Dashboard
          </h1>
          <p className="text-neutral mt-1">
            Monitor your search rankings across all sites
          </p>
        </div>
        <ScanButton />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Key}
          label="Total Keywords"
          value={totalKeywords}
        />
        <StatCard
          icon={TrendingUp}
          label="Average Position"
          value={avgPosition !== null ? avgPosition.toFixed(1) : "\u2014"}
        />
        <StatCard
          icon={MousePointer}
          label="Improved"
          value={improved}
          subtitle="Keywords improved"
        />
        <StatCard
          icon={Eye}
          label="Declined"
          value={declined}
          subtitle="Keywords declined"
        />
      </div>

      {/* Sites Overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 font-[Outfit] mb-5">
          Sites Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sites.map((site) => (
            <SiteCard key={site.site_url} site={site} />
          ))}
        </div>
        {sites.length === 0 && (
          <div className="text-center py-12 text-neutral">
            No sites configured yet.
          </div>
        )}
      </div>
    </div>
  );
}
