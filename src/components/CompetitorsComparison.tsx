"use client";
import { useEffect, useState } from "react";
import { getCompetitorsSummary, type CompetitorsSummary } from "@/lib/api";
import { Trophy } from "lucide-react";

export default function CompetitorsComparison({ site }: { site: string }) {
  const [data, setData] = useState<CompetitorsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCompetitorsSummary(site)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [site]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
        <div className="h-40 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!data) return null;

  const hasAnyData = data.keywords.some(
    (k) => k.your_position !== null || k.ahead.length > 0 || k.behind.length > 0
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
        <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit] flex items-center gap-2">
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-violet" />
          Competidores
        </h2>
        <p className="text-xs md:text-sm text-neutral mt-0.5">
          Quién está por delante y por detrás en cada keyword
        </p>
      </div>

      {!hasAnyData ? (
        <div className="px-4 md:px-6 py-10 text-center text-neutral text-sm">
          Datos de competidores disponibles tras el próximo escaneo.
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {data.keywords.map((row) => (
              <div key={row.keyword} className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {row.keyword}
                </p>
                <p className="text-xs text-neutral mb-2">
                  Tu posición:{" "}
                  <span className="font-bold text-violet">
                    {row.your_position ?? "\u2014"}
                  </span>
                </p>
                {row.ahead.length > 0 && (
                  <div className="mb-1.5">
                    <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">
                      Por delante
                    </p>
                    {row.ahead.slice(0, 3).map((c) => (
                      <p key={c.domain} className="text-xs text-gray-700">
                        <span className="font-bold text-red-500">{c.position}.</span>{" "}
                        {c.domain}
                      </p>
                    ))}
                  </div>
                )}
                {row.behind.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                      Por detrás
                    </p>
                    {row.behind.slice(0, 2).map((c) => (
                      <p key={c.domain} className="text-xs text-gray-700">
                        <span className="font-bold text-emerald-600">
                          {c.position}.
                        </span>{" "}
                        {c.domain}
                      </p>
                    ))}
                  </div>
                )}
                {row.ahead.length === 0 && row.behind.length === 0 && (
                  <p className="text-xs text-neutral italic">Sin datos aún</p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                    Tu pos.
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                    Por delante (top 3)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wider">
                    Por detrás
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.keywords.map((row) => (
                  <tr key={row.keyword} className="hover:bg-lavender/20">
                    <td className="px-6 py-3 text-gray-900 font-medium">
                      {row.keyword}
                    </td>
                    <td className="text-right px-4 py-3 font-bold font-[Outfit] text-lg text-violet">
                      {row.your_position ?? "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {row.ahead.slice(0, 3).map((c) => (
                          <span
                            key={c.domain}
                            className="inline-flex items-center gap-1.5 text-xs"
                          >
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                              {c.position}
                            </span>
                            <span className="text-gray-700 truncate max-w-[180px]">
                              {c.domain}
                            </span>
                          </span>
                        ))}
                        {row.ahead.length === 0 && (
                          <span className="text-xs text-neutral italic">
                            Ninguno
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {row.behind.slice(0, 3).map((c) => (
                          <span
                            key={c.domain}
                            className="inline-flex items-center gap-1.5 text-xs"
                          >
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                              {c.position}
                            </span>
                            <span className="text-gray-700 truncate max-w-[180px]">
                              {c.domain}
                            </span>
                          </span>
                        ))}
                        {row.behind.length === 0 && (
                          <span className="text-xs text-neutral italic">
                            Ninguno
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
