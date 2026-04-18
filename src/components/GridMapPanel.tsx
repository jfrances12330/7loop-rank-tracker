"use client";
import { useEffect, useMemo, useState } from "react";
import { getGridMap, getLocalKeywords, type GridMapCity, type LocalKeyword } from "@/lib/api";
import { Map } from "lucide-react";

interface Props {
  site: string;
}

function posColor(pos: number | null): string {
  if (pos === null || pos === undefined) return "bg-gray-100 text-gray-400 border border-gray-200";
  if (pos >= 1 && pos <= 3) return "bg-emerald-500 text-white shadow-sm";
  if (pos >= 4 && pos <= 7) return "bg-amber-400 text-amber-950 shadow-sm";
  return "bg-red-400 text-white shadow-sm";
}

const ZONE_LABELS: Record<string, string> = {
  NW: "NO",
  norte: "N",
  NE: "NE",
  oeste: "O",
  centro: "C",
  este: "E",
  SW: "SO",
  sur: "S",
  SE: "SE",
};

const GRID_ORDER: string[] = [
  "NW", "norte", "NE",
  "oeste", "centro", "este",
  "SW", "sur", "SE",
];

export default function GridMapPanel({ site }: Props) {
  const [localKws, setLocalKws] = useState<LocalKeyword[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [cities, setCities] = useState<GridMapCity[]>([]);
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
    getGridMap(site, selected)
      .then((r) => setCities(r.cities))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [site, selected]);

  const uniqueKeywords = useMemo(
    () => Array.from(new Set(localKws.map((k) => k.keyword))),
    [localKws]
  );

  if (!loading && localKws.length === 0) {
    return null;
  }

  const hasScannedData = cities.some((c) => c.points.some((p) => p.position !== null));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-lavender/60 flex items-center justify-center">
            <Map className="w-4 h-4 md:w-5 md:h-5 text-violet" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit]">
              🗺️ Mapa de visibilidad
            </h3>
            <p className="text-xs text-neutral truncate">
              Posición en Maps desde 9 puntos de la ciudad
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
            Cargando mapa...
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center text-neutral text-sm">
            Sin datos. Ejecuta{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">
              python3 grid_scanner.py {site}
            </code>{" "}
            para generar el mapa.
          </div>
        ) : (
          <div className="space-y-6">
            {cities.map((c) => {
              const byZone: Record<string, { position: number | null } | undefined> =
                Object.fromEntries(c.points.map((p) => [p.zone, p]));
              return (
                <div key={c.city}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm md:text-base font-semibold text-gray-900 font-[Outfit]">
                      {c.city}
                    </h4>
                    {c.scan_date && (
                      <span className="text-[10px] text-neutral">
                        {c.scan_date}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto md:mx-0">
                    {GRID_ORDER.map((zone) => {
                      const p = byZone[zone];
                      const pos = p?.position ?? null;
                      return (
                        <div key={zone} className="flex flex-col items-center">
                          <div
                            className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${posColor(
                              pos
                            )}`}
                            title={`${zone}: ${pos === null ? "sin datos" : `posición ${pos}`}`}
                          >
                            <span className="text-base md:text-xl font-bold font-[Outfit] leading-none">
                              {pos ?? "—"}
                            </span>
                            <span className="text-[9px] md:text-[10px] font-medium opacity-80 uppercase tracking-wide">
                              {ZONE_LABELS[zone] ?? zone}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {hasScannedData && (
              <div className="flex items-center gap-4 text-[11px] text-neutral border-t border-gray-100 pt-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> Top 1–3
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400" /> 4–7
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-400" /> 8+
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gray-200 border border-gray-300" /> Sin datos
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
