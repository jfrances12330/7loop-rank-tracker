"use client";
import { useEffect, useMemo, useState } from "react";
import { getReviews, replyToReview, type ReviewsResult } from "@/lib/api";
import { Star, AlertTriangle, MessageSquare, Check, X } from "lucide-react";

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

function hoursSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return (Date.now() - d.getTime()) / (1000 * 60 * 60);
}

export default function ReviewsPanel({ site }: { site: string }) {
  const [data, setData] = useState<ReviewsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    getReviews(site)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const negativeReview = useMemo(() => {
    if (!data) return null;
    return data.reviews.find((r) => (r.rating || 5) <= 2) || null;
  }, [data]);

  if (loading && !data) {
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

  const handleSendReply = async (reviewId: number) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await replyToReview(reviewId, replyText.trim());
      if (res?.ok) {
        setToast("Respuesta guardada");
        setReplyingId(null);
        setReplyText("");
        refetch();
      } else {
        setToast("Error al guardar");
      }
    } catch {
      setToast("Error al guardar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit] flex items-center gap-2">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-amber-400" />
            ⭐ Reseñas
          </h2>
          <p className="text-xs md:text-sm text-neutral mt-0.5">
            Google Maps — monitorización y respuesta
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
          {negativeReview && (
            <div className="bg-red-50 border-l-4 border-red-400 px-4 md:px-6 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs md:text-sm text-red-800">
                <strong>Atención:</strong> hay una reseña de {negativeReview.rating}★ de{" "}
                {negativeReview.author || "Anónimo"}. Responde cuanto antes.
              </div>
            </div>
          )}

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

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {data.reviews.slice(0, 15).map((r) => {
              const isNegative = (r.rating || 5) <= 2;
              const hours = hoursSince(r.date);
              const isNew = hours !== null && hours <= 48;
              const hasReply = (r as { reply?: string | null }).reply;
              const replyDate = (r as { reply_date?: string | null }).reply_date;
              const isReplying = replyingId === r.id;
              return (
                <div
                  key={r.id}
                  className={`px-4 md:px-6 py-3 ${isNegative ? "bg-red-50/40" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {r.author || "Anónimo"}
                      </p>
                      {isNew && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500 text-white">
                          ⚠️ NUEVA
                        </span>
                      )}
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  {r.text && (
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-4">
                      {r.text}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    {r.date && (
                      <p className="text-[10px] text-neutral">{r.date}</p>
                    )}
                    {!hasReply && !isReplying && (
                      <button
                        onClick={() => {
                          setReplyingId(r.id);
                          setReplyText("");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-violet/10 text-violet hover:bg-violet/15 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Responder
                      </button>
                    )}
                  </div>

                  {hasReply && (
                    <div className="mt-2 p-3 bg-lavender/40 border-l-2 border-violet rounded-r-md">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-violet uppercase tracking-wide">
                          Respuesta del propietario
                        </span>
                        {replyDate && (
                          <span className="text-[10px] text-neutral">{replyDate}</span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-800 whitespace-pre-wrap">
                        {hasReply}
                      </p>
                    </div>
                  )}

                  {isReplying && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        rows={3}
                        autoFocus
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendReply(r.id)}
                          disabled={sending || !replyText.trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo to-violet disabled:opacity-50 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {sending ? "Enviando..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText("");
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancelar
                        </button>
                        <span className="text-[10px] text-neutral ml-auto">
                          La publicación directa en Google Business Profile estará disponible próximamente
                        </span>
                      </div>
                    </div>
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
