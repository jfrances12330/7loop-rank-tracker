"use client";
import { useState, useEffect, use } from "react";
import ScanButton from "@/components/ScanButton";
import { getSites, getKeywords, type Site, type Keyword } from "@/lib/api";
import Link from "next/link";
import KeywordChart from "./KeywordChart";
import {
  ArrowLeft,
  Key,
  TrendingUp,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-violet/10 text-violet border-violet/20",
    medium: "bg-indigo/10 text-indigo border-indigo/20",
    low: "bg-gray-100 text-neutral border-gray-200",
  };
  const style = styles[priority] || styles.low;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}
    >
      {priority === "high" ? "alta" : priority === "medium" ? "media" : priority === "low" ? "baja" : priority}
    </span>
  );
}

export default function SitePage({ params }: Props) {
  const { slug } = use(params);
  const [site, setSite] = useState<Site | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getSites()
      .then((sites) => {
        const found = sites.find((s) => s.slug === slug);
        if (!found) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setSite(found);
        return getKeywords(found.site_url);
      })
      .then((kws) => {
        if (kws) setKeywords(kws);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-20">
          <p className="text-red-600 text-lg font-semibold font-[Outfit]">
            Sitio no encontrado
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-violet font-medium mt-4 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const displayName = site.site_url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  const totalClicks = keywords.reduce((sum, k) => sum + (k.clicks || 0), 0);
  const totalImpressions = keywords.reduce(
    (sum, k) => sum + (k.impressions || 0),
    0
  );
  const bestPosition = keywords.reduce(
    (best, k) =>
      k.position !== null && (best === null || k.position < best)
        ? k.position
        : best,
    null as number | null
  );

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral hover:text-violet transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 font-[Outfit]">
            {displayName}
          </h1>
          <p className="text-neutral mt-1">
            {site.keyword_count} keywords trackeadas &middot; Posición media:{" "}
            {site.avg_position?.toFixed(1) ?? "\u2014"}
          </p>
        </div>
        <ScanButton site={site.site_url} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lavender/60 flex items-center justify-center">
              <Key className="w-5 h-5 text-violet" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral">Palabras clave</p>
              <p className="text-2xl font-bold text-gray-900 font-[Outfit]">
                {site.keyword_count}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lavender/60 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral">Posición media</p>
              <p className="text-2xl font-bold text-gray-900 font-[Outfit]">
                {site.avg_position?.toFixed(1) ?? "\u2014"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lavender/60 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-violet" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral">Mejor posición</p>
              <p className="text-2xl font-bold text-gray-900 font-[Outfit]">
                {bestPosition !== null ? bestPosition.toFixed(1) : "\u2014"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 font-[Outfit]">
            Palabras clave
          </h2>
          <p className="text-sm text-neutral mt-0.5">
            {totalClicks.toLocaleString()} clics &middot;{" "}
            {totalImpressions.toLocaleString()} impresiones
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Palabra clave
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Posición
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Cambio
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider hidden sm:table-cell">
                  Clics
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider hidden sm:table-cell">
                  Impresiones
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider hidden md:table-cell">
                  CTR
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider hidden md:table-cell">
                  Prioridad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keywords.map((kw, index) => {
                const changePositive =
                  kw.change !== null && kw.change > 0;
                const changeNegative =
                  kw.change !== null && kw.change < 0;
                const posColor =
                  kw.position === null
                    ? ""
                    : kw.position <= 3
                      ? "text-emerald-600"
                      : kw.position <= 10
                        ? "text-gray-900"
                        : kw.position <= 20
                          ? "text-amber-600"
                          : "text-red-500";

                return (
                  <tr
                    key={kw.keyword}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <span className="text-gray-900 font-medium">
                        {kw.keyword}
                      </span>
                    </td>
                    <td
                      className={`text-right px-4 py-3.5 font-bold font-[Outfit] text-lg ${posColor}`}
                    >
                      {kw.position !== null
                        ? kw.position.toFixed(1)
                        : "\u2014"}
                    </td>
                    <td className="text-right px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold ${
                          changePositive
                            ? "text-emerald-600"
                            : changeNegative
                              ? "text-red-500"
                              : "text-neutral"
                        }`}
                      >
                        {changePositive && (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {changeNegative && (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {!changePositive && !changeNegative && (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        {kw.change !== null
                          ? Math.abs(kw.change).toFixed(1)
                          : "\u2014"}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3.5 text-gray-700 hidden sm:table-cell">
                      {kw.clicks ?? "\u2014"}
                    </td>
                    <td className="text-right px-4 py-3.5 text-gray-700 hidden sm:table-cell">
                      {kw.impressions?.toLocaleString() ?? "\u2014"}
                    </td>
                    <td className="text-right px-4 py-3.5 text-gray-700 hidden md:table-cell">
                      {kw.ctr !== null ? `${kw.ctr.toFixed(1)}%` : "\u2014"}
                    </td>
                    <td className="text-center px-4 py-3.5 hidden md:table-cell">
                      <PriorityBadge priority={kw.priority} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {keywords.length === 0 && (
          <div className="text-center py-12 text-neutral">
            No hay palabras clave trackeadas para este sitio.
          </div>
        )}
      </div>

      {/* Chart */}
      <KeywordChart
        siteUrl={site.site_url}
        keywords={keywords.map((k) => ({
          keyword: k.keyword,
          position: k.position,
        }))}
      />
    </div>
  );
}
