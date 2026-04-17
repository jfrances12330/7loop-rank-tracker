"use client";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import ScanButton from "@/components/ScanButton";
import SparkLine from "@/components/SparkLine";
import { getSites, getKeywords, type Site, type Keyword } from "@/lib/api";
import Link from "next/link";
import KeywordChart from "./KeywordChart";

interface Props {
  params: Promise<{ slug: string }>;
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
        if (!found) { setNotFound(true); setLoading(false); return; }
        setSite(found);
        return getKeywords(found.site_url);
      })
      .then((kws) => { if (kws) setKeywords(kws); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-pulse text-lavender/40 text-lg">Cargando...</div>
        </main>
      </>
    );
  }

  if (notFound || !site) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-10">
          <p className="text-red-400">Sitio no encontrado</p>
          <Link href="/" className="text-violet underline mt-4 inline-block">Volver</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Breadcrumb + Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-lavender/50 hover:text-violet transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
            <h2 className="text-3xl font-bold text-white font-[Outfit] mt-1">{site.site_url}</h2>
            <p className="text-sm text-lavender/50 mt-1">
              {site.keyword_count} keywords | Pos. media: {site.avg_position?.toFixed(1) ?? "—"}
            </p>
          </div>
          <ScanButton site={site.site_url} />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-lavender/40 uppercase">Keywords</p>
            <p className="text-2xl font-bold text-white font-[Outfit]">{site.keyword_count}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-lavender/40 uppercase">Pos. Media</p>
            <p className="text-2xl font-bold text-white font-[Outfit]">{site.avg_position?.toFixed(1) ?? "—"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-lavender/40 uppercase">Clics totales</p>
            <p className="text-2xl font-bold text-white font-[Outfit]">
              {keywords.reduce((sum, k) => sum + (k.clicks || 0), 0)}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-lavender/40 uppercase">Impresiones</p>
            <p className="text-2xl font-bold text-white font-[Outfit]">
              {keywords.reduce((sum, k) => sum + (k.impressions || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Keywords table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-lavender/60 font-medium">Keyword</th>
                  <th className="text-right px-4 py-3 text-lavender/60 font-medium">Posicion</th>
                  <th className="text-right px-4 py-3 text-lavender/60 font-medium">Cambio</th>
                  <th className="text-right px-4 py-3 text-lavender/60 font-medium hidden sm:table-cell">Clics</th>
                  <th className="text-right px-4 py-3 text-lavender/60 font-medium hidden sm:table-cell">Impresiones</th>
                  <th className="text-right px-4 py-3 text-lavender/60 font-medium hidden md:table-cell">CTR</th>
                  <th className="text-center px-4 py-3 text-lavender/60 font-medium hidden md:table-cell">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => {
                  const changeColor = kw.change === null ? "text-gray" : kw.change > 0 ? "text-emerald-400" : kw.change < 0 ? "text-red-400" : "text-gray";
                  const changeText = kw.change === null ? "—" : kw.change > 0 ? `▲ ${kw.change.toFixed(1)}` : kw.change < 0 ? `▼ ${Math.abs(kw.change).toFixed(1)}` : "=";
                  const posColor = kw.position === null ? "" : kw.position <= 3 ? "text-emerald-400" : kw.position <= 10 ? "text-white" : kw.position <= 20 ? "text-amber-400" : "text-red-400";
                  const prioIcon = kw.priority === "high" ? "🔴" : kw.priority === "medium" ? "🟡" : "⚪";

                  return (
                    <tr key={kw.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="mr-1.5 text-xs">{prioIcon}</span>
                        <span className="text-white font-medium">{kw.keyword}</span>
                        {kw.target_url && <span className="text-lavender/30 text-xs ml-2">{kw.target_url}</span>}
                      </td>
                      <td className={`text-right px-4 py-3 font-bold font-[Outfit] text-lg ${posColor}`}>
                        {kw.position !== null ? kw.position.toFixed(1) : "—"}
                      </td>
                      <td className={`text-right px-4 py-3 font-semibold ${changeColor}`}>{changeText}</td>
                      <td className="text-right px-4 py-3 text-lavender/70 hidden sm:table-cell">{kw.clicks ?? "—"}</td>
                      <td className="text-right px-4 py-3 text-lavender/70 hidden sm:table-cell">{kw.impressions ?? "—"}</td>
                      <td className="text-right px-4 py-3 text-lavender/70 hidden md:table-cell">{kw.ctr !== null ? `${kw.ctr.toFixed(1)}%` : "—"}</td>
                      <td className="text-center px-4 py-3 hidden md:table-cell"><SparkLine data={kw.sparkline} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <KeywordChart siteUrl={site.site_url} keywords={keywords.map((k) => ({ keyword: k.keyword, position: k.position }))} />
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-sm text-lavender/30">
        7Loop SEO Tracker — {new Date().getFullYear()}
      </footer>
    </>
  );
}
