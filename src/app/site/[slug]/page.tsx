"use client";
import { useState, useEffect, use, useMemo, useCallback } from "react";
import ScanButton from "@/components/ScanButton";
import DeviceToggle from "@/components/DeviceToggle";
import CompetitorsPanel from "@/components/CompetitorsPanel";
import LocalGridPanel from "@/components/LocalGridPanel";
import LocalPackPanel from "@/components/LocalPackPanel";
import RoiPanel from "@/components/RoiPanel";
import ReportButton from "@/components/ReportButton";
import CompetitorsComparison from "@/components/CompetitorsComparison";
import ReviewsPanel from "@/components/ReviewsPanel";
import TasksPanel from "@/components/TasksPanel";
import {
  getSites,
  getKeywords,
  addKeyword,
  removeKeyword,
  type Site,
  type Keyword,
  type Device,
} from "@/lib/api";
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
  Plus,
  Trash2,
  X,
  ChevronDown,
  Check,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-gradient-to-r from-indigo to-violet text-white border-transparent",
    medium: "bg-indigo/10 text-indigo border-indigo/20",
    low: "bg-gray-100 text-neutral border-gray-200",
  };
  const style = styles[priority] || styles.low;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}
    >
      {priority === "high"
        ? "alta"
        : priority === "medium"
          ? "media"
          : priority === "low"
            ? "baja"
            : priority}
    </span>
  );
}

type SortOption = "pos_asc" | "pos_desc" | "clicks" | "impressions" | "priority" | "name";
type PriorityFilter = "all" | "high" | "medium" | "low";
type PositionFilter = "all" | "top10" | "11-20" | "21-50" | "50+";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-400" />
        {message}
      </div>
    </div>
  );
}

export default function SitePage({ params }: Props) {
  const { slug } = use(params);
  const [site, setSite] = useState<Site | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [device, setDevice] = useState<Device>("all");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  // Add keyword modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [addLoading, setAddLoading] = useState(false);

  // Delete confirmation
  const [deletingKeyword, setDeletingKeyword] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [sortBy, setSortBy] = useState<SortOption>("pos_asc");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const refetchKeywords = useCallback(() => {
    if (!site) return;
    getKeywords(site.site_url, device)
      .then((kws) => {
        setKeywords(kws);
        if (kws.length && !selectedKeyword) {
          setSelectedKeyword(kws[0].keyword);
        }
      })
      .catch(() => setKeywords([]));
  }, [site, device, selectedKeyword]);

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
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (!site) return;
    setLoading(true);
    getKeywords(site.site_url, device)
      .then((kws) => {
        setKeywords(kws);
        if (kws.length && !selectedKeyword) {
          setSelectedKeyword(kws[0].keyword);
        }
      })
      .catch(() => setKeywords([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, device]);

  // Filtered & sorted keywords
  const filteredKeywords = useMemo(() => {
    let result = [...keywords];

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((k) => k.priority === priorityFilter);
    }

    // Position filter
    if (positionFilter !== "all") {
      result = result.filter((k) => {
        if (k.position === null) return positionFilter === "50+";
        switch (positionFilter) {
          case "top10": return k.position <= 10;
          case "11-20": return k.position > 10 && k.position <= 20;
          case "21-50": return k.position > 20 && k.position <= 50;
          case "50+": return k.position > 50;
          default: return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "pos_asc":
          return (a.position ?? 999) - (b.position ?? 999);
        case "pos_desc":
          return (b.position ?? 0) - (a.position ?? 0);
        case "clicks":
          return (b.clicks ?? 0) - (a.clicks ?? 0);
        case "impressions":
          return (b.impressions ?? 0) - (a.impressions ?? 0);
        case "priority": {
          const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
        }
        case "name":
          return a.keyword.localeCompare(b.keyword);
        default:
          return 0;
      }
    });

    return result;
  }, [keywords, sortBy, priorityFilter, positionFilter]);

  const handleAddKeyword = async () => {
    if (!site || !newKeyword.trim()) return;
    setAddLoading(true);
    try {
      await addKeyword(site.site_url, newKeyword.trim(), newPriority);
      setShowAddModal(false);
      setNewKeyword("");
      setNewPriority("medium");
      refetchKeywords();
      setToast("Keyword añadida");
    } catch {
      setToast("Error al añadir keyword");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteKeyword = async (keyword: string) => {
    if (!site) return;
    setDeleteLoading(true);
    try {
      await removeKeyword(site.site_url, keyword);
      setKeywords((prev) => prev.filter((k) => k.keyword !== keyword));
      setDeletingKeyword(null);
      if (selectedKeyword === keyword) {
        setSelectedKeyword(keywords.find((k) => k.keyword !== keyword)?.keyword ?? null);
      }
      setToast("Keyword eliminada");
    } catch {
      setToast("Error al eliminar keyword");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && !site) {
    return (
      <div className="p-4 md:p-6 lg:p-10">
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
      <div className="p-4 md:p-6 lg:p-10">
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

  const sortLabels: Record<SortOption, string> = {
    pos_asc: "Posicion \u2191",
    pos_desc: "Posicion \u2193",
    clicks: "Clics \u2193",
    impressions: "Impresiones \u2193",
    priority: "Prioridad",
    name: "Nombre A-Z",
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 space-y-5 md:space-y-8 pb-28 md:pb-10">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Add keyword modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 font-[Outfit]">Añadir keyword</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Palabra clave</label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="ej: dentista alicante"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-all"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prioridad</label>
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                        newPriority === p
                          ? p === "high"
                            ? "bg-gradient-to-r from-indigo to-violet text-white border-transparent"
                            : p === "medium"
                              ? "bg-violet/10 text-violet border-violet/30"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {p === "high" ? "Alta" : p === "medium" ? "Media" : "Baja"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddKeyword}
                disabled={addLoading || !newKeyword.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {addLoading ? "Añadiendo..." : "Añadir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs md:text-sm text-neutral hover:text-violet transition-colors mb-1 md:mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Volver al panel
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 font-[Outfit]">
            {displayName}
          </h1>
          <p className="text-sm md:text-base text-neutral mt-0.5 md:mt-1">
            {site.keyword_count} keywords &middot; Pos. media:{" "}
            {site.avg_position?.toFixed(1) ?? "\u2014"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir keyword</span>
          </button>
          <DeviceToggle value={device} onChange={setDevice} />
          <ReportButton site={site.site_url} />
          <ScanButton site={site.site_url} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        <KpiCard icon={Key} label="Keywords" value={site.keyword_count} />
        <KpiCard
          icon={TrendingUp}
          label="Pos. media"
          value={site.avg_position?.toFixed(1) ?? "\u2014"}
        />
        <KpiCard
          icon={Trophy}
          label="Mejor pos."
          value={bestPosition !== null ? bestPosition.toFixed(1) : "\u2014"}
        />
      </div>

      {/* Keywords */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit]">
            Palabras clave
          </h2>
          <p className="text-xs md:text-sm text-neutral mt-0.5">
            {totalClicks.toLocaleString()} clics &middot;{" "}
            {totalImpressions.toLocaleString()} impresiones
            {filteredKeywords.length !== keywords.length && (
              <span className="text-violet font-medium ml-2">
                ({filteredKeywords.length} de {keywords.length})
              </span>
            )}
          </p>
        </div>

        {/* Filter bar */}
        <div className="px-4 md:px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2 overflow-x-auto">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:border-gray-300 transition-colors"
            >
              {sortLabels[sortBy]}
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showSortDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[160px] animate-fade-in">
                  {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); setShowSortDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-lavender/40 transition-colors ${sortBy === key ? "text-violet font-semibold bg-lavender/30" : "text-gray-700"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-5 bg-gray-200 hidden sm:block" />

          {/* Priority filter */}
          <div className="flex items-center gap-1">
            {(["all", "high", "medium", "low"] as PriorityFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  priorityFilter === p
                    ? "bg-lavender text-violet"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {p === "all" ? "Todas" : p === "high" ? "Alta" : p === "medium" ? "Media" : "Baja"}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="w-px h-5 bg-gray-200 hidden sm:block" />

          {/* Position filter */}
          <div className="flex items-center gap-1">
            {(["all", "top10", "11-20", "21-50", "50+"] as PositionFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPositionFilter(p)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  positionFilter === p
                    ? "bg-lavender text-violet"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {p === "all" ? "Todas" : p === "top10" ? "Top 10" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: keyword cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredKeywords.map((kw) => {
            const changePositive = kw.change !== null && kw.change > 0;
            const changeNegative = kw.change !== null && kw.change < 0;
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

            const selected = kw.keyword === selectedKeyword;
            const isDeleting = deletingKeyword === kw.keyword;
            return (
              <div key={kw.keyword} className={`relative ${selected ? "bg-lavender/40 border-l-4 border-violet" : ""}`}>
                <button
                  onClick={() => setSelectedKeyword(kw.keyword)}
                  className="w-full px-4 py-3 text-left transition-colors pr-10"
                >
                  <p className="text-sm font-medium text-gray-900 mb-1.5">
                    {kw.keyword}
                  </p>
                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className={`font-bold font-[Outfit] text-base ${posColor}`}>
                      {kw.position !== null ? kw.position.toFixed(1) : "\u2014"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        changePositive
                          ? "text-emerald-600"
                          : changeNegative
                            ? "text-red-500"
                            : "text-neutral"
                      }`}
                    >
                      {changePositive && <ArrowUpRight className="w-3 h-3" />}
                      {changeNegative && <ArrowDownRight className="w-3 h-3" />}
                      {!changePositive && !changeNegative && (
                        <Minus className="w-3 h-3" />
                      )}
                      {kw.change !== null
                        ? Math.abs(kw.change).toFixed(1)
                        : "\u2014"}
                    </span>
                    <span className="text-neutral">{kw.clicks ?? 0} clics</span>
                    <span className="text-neutral">
                      vol. {kw.estimated_volume}
                    </span>
                    <PriorityBadge priority={kw.priority} />
                  </div>
                </button>
                {/* Delete button */}
                {isDeleting ? (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 animate-fade-in">
                    <button
                      onClick={() => handleDeleteKeyword(kw.keyword)}
                      disabled={deleteLoading}
                      className="px-2 py-1 rounded text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      Si
                    </button>
                    <button
                      onClick={() => setDeletingKeyword(null)}
                      className="px-2 py-1 rounded text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingKeyword(kw.keyword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Palabra clave
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Posicion
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Cambio
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Volumen est.
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Clics
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Impresiones
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  CTR
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="w-10 px-2 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredKeywords.map((kw) => {
                const changePositive = kw.change !== null && kw.change > 0;
                const changeNegative = kw.change !== null && kw.change < 0;
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
                const selected = kw.keyword === selectedKeyword;
                const isDeleting = deletingKeyword === kw.keyword;
                return (
                  <tr
                    key={kw.keyword}
                    onClick={() => setSelectedKeyword(kw.keyword)}
                    className={`transition-colors cursor-pointer ${
                      selected ? "bg-lavender/60" : "hover:bg-lavender/40"
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
                    <td className="text-right px-4 py-3.5 text-gray-700 font-medium">
                      {kw.estimated_volume.toLocaleString()}
                    </td>
                    <td className="text-right px-4 py-3.5 text-gray-700">
                      {kw.clicks ?? "\u2014"}
                    </td>
                    <td className="text-right px-4 py-3.5 text-gray-700">
                      {kw.impressions?.toLocaleString() ?? "\u2014"}
                    </td>
                    <td className="text-right px-4 py-3.5 text-gray-700">
                      {kw.ctr !== null ? `${kw.ctr.toFixed(1)}%` : "\u2014"}
                    </td>
                    <td className="text-center px-4 py-3.5">
                      <PriorityBadge priority={kw.priority} />
                    </td>
                    <td className="px-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {isDeleting ? (
                        <div className="flex items-center gap-1 animate-fade-in">
                          <button
                            onClick={() => handleDeleteKeyword(kw.keyword)}
                            disabled={deleteLoading}
                            className="px-2 py-1 rounded text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            Si
                          </button>
                          <button
                            onClick={() => setDeletingKeyword(null)}
                            className="px-2 py-1 rounded text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingKeyword(kw.keyword)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredKeywords.length === 0 && keywords.length > 0 && (
          <div className="text-center py-12 text-neutral">
            No hay keywords que coincidan con los filtros seleccionados.
          </div>
        )}

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

      {/* ROI */}
      <RoiPanel site={site.site_url} />

      {/* Competitors comparison */}
      <CompetitorsComparison site={site.site_url} />

      {/* Competitors detail (top 10 per kw) */}
      <CompetitorsPanel site={site.site_url} keyword={selectedKeyword} />

      {/* Local Pack */}
      <LocalPackPanel site={site.site_url} />

      {/* Local grid */}
      <LocalGridPanel site={site.site_url} />

      {/* Reviews */}
      <ReviewsPanel site={site.site_url} />

      {/* Tasks */}
      <TasksPanel site={site.site_url} />

      {/* Bottom spacing for mobile tab bar */}
      <div className="pb-20 md:pb-4" />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-gray-100 border-l-[3px] border-l-violet animate-[fadeIn_0.3s_ease]">
      <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-lavender/60 flex items-center justify-center">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-violet" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-[10px] md:text-sm font-medium text-neutral">
            {label}
          </p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 font-[Outfit]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
