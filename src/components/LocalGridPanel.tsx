"use client";
import { useEffect, useState } from "react";
import { getLocalGrid, getLocalKeywords, type GridCity, type LocalKeyword } from "@/lib/api";
import { MapPin } from "lucide-react";

interface Props {
  site: string;
}

function posColor(pos: number | null): string {
  if (pos === null) return "bg-gray-100 text-gray-400 border border-gray-200";
  if (pos <= 3) return "bg-emerald-500 text-white";
  if (pos <= 10) return "bg-emerald-200 text-emerald-900";
  if (pos <= 20) return "bg-amber-200 text-amber-900";
  return "bg-red-300 text-red-900";
}

const ZONE_ORDER = ["centro", "norte", "sur", "este", "oeste"] as const;

export default function LocalGridPanel({ site }: Props) {
  const [localKws, setLocalKws] = useState<LocalKeyword[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [cities, setCities] = useState<GridCity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocalKeywords(site)
      .then((kws) => {
        setLocalKws(kws);
        if (kws.length && !selected) setSelected(kws[0].keyword);
      })
      .catch(() => setLocalKws([]))
      .finally(() => setLoading(false));
  }, [site]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    getLocalGrid(site, selected)
      .then((r) => setCities(r.cities))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [site, selected]);

  const uniqueKeywords = Array.from(new Set(localKws.map((k) => k.keyword)));

  if (!loading && localKws.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-lavender/60 flex items-center justify-center">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-violet" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit]">
              Grid local (Maps)
            </h3>
            <p className="text-xs text-neutral truncate">
              Posición por zona en cada ciudad
            </p>
          </div>
        </div>
        {uniqueKeywords.length > 0 && (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet"
          >
            {uniqueKeywords.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="p-4 md:p-6">
        {loading ? (
          <div className="text-center text-neutral text-sm animate-pulse">
            Cargando grid...
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center text-neutral text-sm">
            Sin datos. Ejecuta{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
              python3 grid_scanner.py {site}
            </code>{" "}
            para generar el grid.
          </div>
        ) : (
          <div className="space-y-5">
            {cities.map((c) => {
              const byZone = Object.fromEntries(
                c.points.map((p) => [p.zone_name, p])
              );
              return (
                <div key={c.city}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm md:text-base font-semibold text-gray-900 font-[Outfit]">
                      {c.city}
                    </h4>
                    {c.scan_date && (
                      <span className="text-[10px] text-neutral">
                        {c.scan_date}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2 max-w-md">
                    {ZONE_ORDER.map((zone) => {
                      const p = byZone[zone];
                      const pos = p?.position ?? null;
                      return (
                        <div key={zone} className="flex flex-col items-center">
                          <div
                            className={`w-full aspect-square rounded-lg flex items-center justify-center text-base md:text-lg font-bold font-[Outfit] ${posColor(pos)}`}
                          >
                            {pos ?? "—"}
                          </div>
                          <span className="text-[10px] text-neutral mt-1 capitalize">
                            {zone}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
