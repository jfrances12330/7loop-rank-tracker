"use client";
import { useEffect, useState } from "react";
import { getReviews, type ReviewsResult } from "@/lib/api";
import { Star, AlertTriangle } from "lucide-react";

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-neutral">—</span>;
  const r = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= r ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </span>
  );
}

export default function ReviewsPanel({ site }: { site: string }) {
  const [data, setData] = useState<ReviewsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getReviews(site)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [site]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!data) return null;

  const distTotal = Math.max(
    1,
    Object.values(data.distribution).reduce((a, b) => a + b, 0)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit] flex items-center gap-2">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-amber-400" />
            Reseñas
          </h2>
          <p className="text-xs md:text-sm text-neutral mt-0.5">
            Google Maps — últimas reseñas recogidas
          </p>
        </div>
        {data.has_recent_negative && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Reseña negativa
          </span>
        )}
      </div>

      {data.total === 0 ? (
        <div className="px-4 md:px-6 py-10 text-center text-neutral text-sm">
          No hay reseñas recogidas todavía.
          <br />
          Se rellenará con el próximo escaneo de Maps.
        </div>
      ) : (
        <>
          <div className="px-4 md:px-6 py-4 md:py-5 grid grid-cols-2 gap-4 bg-gradient-to-br from-amber-50/40 to-white">
            <div>
              <p className="text-[10px] md:text-xs text-neutral font-medium uppercase tracking-wider">
                Nota media
              </p>
              <p className="text-3xl md:text-5xl font-bold text-amber-500 font-[Outfit] mt-1">
                {data.avg_rating?.toFixed(1) ?? "\u2014"}
                <span className="text-base md:text-2xl text-amber-400 ml-1">/5</span>
              </p>
              <p className="text-xs text-neutral mt-1">
                {data.total} reseña{data.total !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = data.distribution[String(star)] || 0;
                const pct = (count / distTotal) * 100;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-5 text-right font-semibold text-gray-700">
                      {star}★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-neutral">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {data.reviews.slice(0, 10).map((r) => {
              const isNegative = (r.rating || 5) <= 2;
              return (
                <div
                  key={r.id}
                  className={`px-4 md:px-6 py-3 ${isNegative ? "bg-red-50/40" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {r.author || "Anónimo"}
                    </p>
                    <Stars rating={r.rating} />
                  </div>
                  {r.text && (
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-3">
                      {r.text}
                    </p>
                  )}
                  {r.date && (
                    <p className="text-[10px] text-neutral mt-1">{r.date}</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
