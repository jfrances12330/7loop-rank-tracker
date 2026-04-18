"use client";
import { useState, useEffect } from "react";
import { getLocalPack, type LocalPackEntry } from "@/lib/api";
import { Package, Star, MapPin, ChevronDown, ChevronUp } from "lucide-react";

export default function LocalPackPanel({ site }: { site: string }) {
  const [data, setData] = useState<LocalPackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    getLocalPack(site)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [site]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-violet" />
          <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit]">
            Local Pack
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {data.length} keywords
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="p-4 md:p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Los 3 resultados de Google Maps que aparecen en la busqueda organica normal.
          </p>

          {data.map((entry) => (
            <div
              key={`${entry.keyword}-${entry.city}`}
              className="border border-gray-100 rounded-xl p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {entry.keyword}
                  </h3>
                  {entry.city && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {entry.city}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {entry.pack_position !== null ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">
                      Posicion {entry.pack_position} de {entry.pack_total}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-600">
                      No apareces en el pack
                    </span>
                  )}
                </div>
              </div>

              {/* Businesses */}
              <div className="space-y-2">
                {entry.businesses.map((biz, i) => {
                  const isClient = entry.pack_position === biz.position;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        isClient
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          biz.position === 1
                            ? "bg-amber-100 text-amber-700"
                            : biz.position === 2
                              ? "bg-gray-200 text-gray-600"
                              : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {biz.position}
                      </span>
                      <span
                        className={`flex-1 font-medium ${
                          isClient ? "text-emerald-700" : "text-gray-900"
                        }`}
                      >
                        {biz.name}
                        {isClient && (
                          <span className="ml-2 text-xs text-emerald-500 font-normal">
                            (tu negocio)
                          </span>
                        )}
                      </span>
                      {biz.rating !== null && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {biz.rating}
                        </span>
                      )}
                      {biz.reviews !== null && (
                        <span className="text-xs text-gray-400">
                          ({biz.reviews})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {entry.scan_date && (
                <p className="text-xs text-gray-400 text-right">
                  Escaneado: {entry.scan_date}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
