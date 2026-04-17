"use client";
import { useEffect, useState } from "react";
import { getCompetitors, type CompetitorsResult } from "@/lib/api";
import { Users, ExternalLink, Crown } from "lucide-react";

interface Props {
  site: string;
  keyword: string | null;
}

export default function CompetitorsPanel({ site, keyword }: Props) {
  const [data, setData] = useState<CompetitorsResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword) return;
    setLoading(true);
    getCompetitors(site, keyword)
      .then(setData)
      .catch(() => setData({ scan_date: null, competitors: [], site_position: null }))
      .finally(() => setLoading(false));
  }, [site, keyword]);

  if (!keyword) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-lavender/60 flex items-center justify-center">
          <Users className="w-4 h-4 md:w-5 md:h-5 text-violet" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit] truncate">
            Competidores
          </h3>
          <p className="text-xs text-neutral truncate">
            Top 10 para &ldquo;{keyword}&rdquo;
            {data?.scan_date ? ` · ${data.scan_date}` : ""}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-neutral text-sm">
          <div className="animate-pulse">Cargando competidores...</div>
        </div>
      ) : !data || data.competitors.length === 0 ? (
        <div className="p-6 text-center text-neutral text-sm">
          Aún no hay datos de competidores para esta keyword.
          <br />
          Ejecuta un scan completo desde la terminal (
          <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
            python3 competitors_scanner.py
          </code>
          ).
        </div>
      ) : (
        <ol className="divide-y divide-gray-100">
          {data.competitors.map((c) => (
            <li
              key={`${c.position}-${c.domain}`}
              className={`flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3 ${
                c.is_site ? "bg-violet/5" : ""
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-[Outfit] flex-shrink-0 ${
                  c.position <= 3
                    ? "bg-gradient-to-br from-indigo to-violet text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {c.position}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {c.domain}
                  </p>
                  {c.is_site && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-violet text-white px-1.5 py-0.5 rounded-md">
                      <Crown className="w-2.5 h-2.5" /> TÚ
                    </span>
                  )}
                </div>
                {c.title && (
                  <p className="text-xs text-neutral truncate mt-0.5">
                    {c.title}
                  </p>
                )}
              </div>
              {c.url && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral hover:text-violet transition-colors flex-shrink-0"
                  aria-label="Abrir"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
