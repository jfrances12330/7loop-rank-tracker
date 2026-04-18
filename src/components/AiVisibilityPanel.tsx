"use client";
import { useEffect, useState } from "react";
import { getAiVisibility, triggerAiScan, type AiVisibilityRow, type AiPlatformEntry } from "@/lib/api";
import { Bot, Play, Check, X, Circle } from "lucide-react";

interface Props {
  site: string;
}

const PLATFORMS: { key: keyof AiVisibilityRow["platforms"]; label: string }[] = [
  { key: "perplexity", label: "Perplexity" },
  { key: "duckduckgo", label: "DuckDuckGo AI" },
  { key: "google_ai_overview", label: "Google AI Overview" },
];

function PlatformCell({ entry }: { entry: AiPlatformEntry | null }) {
  if (!entry) {
    return (
      <div className="flex items-center justify-center" title="Sin escanear">
        <Circle className="w-4 h-4 text-gray-300" />
      </div>
    );
  }
  if (entry.mentioned) {
    return (
      <div
        className="flex items-center justify-center"
        title={entry.context || "Mencionado"}
      >
        <Check className="w-5 h-5 text-emerald-500" strokeWidth={3} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center" title="No mencionado">
      <X className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
    </div>
  );
}

export default function AiVisibilityPanel({ site }: Props) {
  const [rows, setRows] = useState<AiVisibilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedContext, setSelectedContext] = useState<{
    keyword: string;
    platform: string;
    context: string;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    getAiVisibility(site)
      .then((r) => setRows(r.keywords))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [site]);

  const handleScan = async () => {
    setScanning(true);
    try {
      await triggerAiScan(site);
    } finally {
      // Re-check after a bit
      setTimeout(() => {
        getAiVisibility(site)
          .then((r) => setRows(r.keywords))
          .finally(() => setScanning(false));
      }, 4000);
    }
  };

  const hasAny = rows.some((r) =>
    PLATFORMS.some(({ key }) => r.platforms[key] !== null)
  );
  const mentionsCount = rows.reduce((acc, r) => {
    let c = 0;
    for (const { key } of PLATFORMS) {
      if (r.platforms[key]?.mentioned) c++;
    }
    return acc + c;
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-lavender/60 flex items-center justify-center">
            <Bot className="w-4 h-4 md:w-5 md:h-5 text-violet" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit]">
              🤖 Visibilidad en IA
            </h3>
            <p className="text-xs text-neutral truncate">
              {hasAny
                ? `${mentionsCount} mención${mentionsCount === 1 ? "" : "es"} en plataformas IA`
                : "ChatGPT / Perplexity / Google AI Overview"}
            </p>
          </div>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 disabled:opacity-50 transition-all shadow-sm"
        >
          <Play className="w-3.5 h-3.5" />
          {scanning ? "Escaneando..." : "Escanear"}
        </button>
      </div>

      <div className="p-4 md:p-6">
        {loading ? (
          <div className="text-center text-neutral text-sm animate-pulse">
            Cargando...
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-neutral text-sm">
            Sin keywords para este sitio.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-3 py-2 text-[11px] font-semibold text-neutral uppercase tracking-wider">
                      Keyword
                    </th>
                    {PLATFORMS.map((p) => (
                      <th
                        key={p.key}
                        className="text-center px-2 py-2 text-[11px] font-semibold text-neutral uppercase tracking-wider"
                      >
                        {p.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r.keyword} className="hover:bg-lavender/20 transition-colors">
                      <td className="px-3 py-2.5 text-gray-900 font-medium">
                        {r.keyword}
                      </td>
                      {PLATFORMS.map((p) => {
                        const entry = r.platforms[p.key];
                        return (
                          <td
                            key={p.key}
                            className="px-2 py-2.5 cursor-pointer"
                            onClick={() => {
                              if (entry?.mentioned && entry.context) {
                                setSelectedContext({
                                  keyword: r.keyword,
                                  platform: p.label,
                                  context: entry.context,
                                });
                              }
                            }}
                          >
                            <PlatformCell entry={entry} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral mt-4 border-t border-gray-100 pt-3">
              <span className="inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
                Mencionado
              </span>
              <span className="inline-flex items-center gap-1">
                <X className="w-3.5 h-3.5 text-gray-400" strokeWidth={2.5} />
                No mencionado
              </span>
              <span className="inline-flex items-center gap-1">
                <Circle className="w-3 h-3 text-gray-300" />
                Sin escanear
              </span>
              {!hasAny && (
                <span className="ml-auto text-violet font-medium">
                  Pulsa «Escanear» para analizar visibilidad en IA
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {selectedContext && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedContext(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-gray-900 font-[Outfit]">
                {selectedContext.platform}
              </h4>
              <button
                onClick={() => setSelectedContext(null)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-[11px] text-neutral uppercase tracking-wider mb-3">
              {selectedContext.keyword}
            </p>
            <div className="bg-lavender/30 border border-violet/20 rounded-lg p-3 text-sm text-gray-800 leading-relaxed">
              {selectedContext.context}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
