"use client";
import { use, useEffect, useState } from "react";
import { getClientView, type ClientView } from "@/lib/api";
import {
  TrendingUp,
  Key,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface Props {
  params: Promise<{ token: string }>;
}

export default function ClientPage({ params }: Props) {
  const { token } = use(params);
  const [data, setData] = useState<ClientView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getClientView(token)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender via-white to-white p-6 md:p-10">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-56 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-40 mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-white rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <p className="text-red-500 font-semibold text-lg mb-2">
            Enlace no válido
          </p>
          <p className="text-neutral text-sm">
            Este enlace ha caducado o no existe. Contacta con 7Loop para obtener uno nuevo.
          </p>
        </div>
      </div>
    );
  }

  const topKeywords = data.keywords.filter((k) => k.position !== null);
  const bestPos = topKeywords.length
    ? Math.min(...topKeywords.map((k) => k.position!))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender via-white to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-sidebar-from to-indigo text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl md:text-2xl font-bold font-[Outfit]">
            7L
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] md:text-xs uppercase tracking-widest text-white/60 font-semibold">
              7Loop SEO
            </p>
            <h1 className="text-xl md:text-3xl font-bold font-[Outfit] truncate">
              {data.site_display}
            </h1>
            {data.client_name && (
              <p className="text-sm text-white/70 truncate">
                Panel para {data.client_name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 pb-12">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Kpi
            icon={Key}
            label="Keywords"
            value={data.keywords_count.toString()}
          />
          <Kpi
            icon={TrendingUp}
            label="Pos. media"
            value={data.avg_position?.toFixed(1) ?? "\u2014"}
          />
          <Kpi
            icon={TrendingUp}
            label="Mejor pos."
            value={bestPos ? bestPos.toFixed(1) : "\u2014"}
          />
          <Kpi
            icon={Wallet}
            label="Valor/mes"
            value={`${data.roi_monthly.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`}
          />
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
            <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit]">
              Posiciones en Google
            </h2>
            <p className="text-xs md:text-sm text-neutral mt-0.5">
              Última actualización en tiempo real
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-4 md:px-6 py-3 text-[10px] md:text-xs font-semibold text-neutral uppercase tracking-wider">
                    Palabra clave
                  </th>
                  <th className="text-right px-3 py-3 text-[10px] md:text-xs font-semibold text-neutral uppercase tracking-wider">
                    Pos.
                  </th>
                  <th className="text-right px-3 py-3 text-[10px] md:text-xs font-semibold text-neutral uppercase tracking-wider">
                    Cambio
                  </th>
                  <th className="text-right px-3 md:px-6 py-3 text-[10px] md:text-xs font-semibold text-neutral uppercase tracking-wider">
                    Clics
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.keywords.map((k) => {
                  const up = k.change !== null && k.change > 0;
                  const down = k.change !== null && k.change < 0;
                  const posColor =
                    k.position === null
                      ? ""
                      : k.position <= 3
                        ? "text-emerald-600"
                        : k.position <= 10
                          ? "text-gray-900"
                          : k.position <= 20
                            ? "text-amber-600"
                            : "text-red-500";
                  return (
                    <tr key={k.keyword} className="hover:bg-lavender/20">
                      <td className="px-4 md:px-6 py-3 text-gray-900 font-medium">
                        {k.keyword}
                      </td>
                      <td
                        className={`text-right px-3 py-3 font-bold font-[Outfit] text-base md:text-lg ${posColor}`}
                      >
                        {k.position !== null ? k.position.toFixed(1) : "\u2014"}
                      </td>
                      <td className="text-right px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-0.5 font-semibold text-xs ${
                            up
                              ? "text-emerald-600"
                              : down
                                ? "text-red-500"
                                : "text-neutral"
                          }`}
                        >
                          {up && <ArrowUpRight className="w-3 h-3" />}
                          {down && <ArrowDownRight className="w-3 h-3" />}
                          {!up && !down && <Minus className="w-3 h-3" />}
                          {k.change !== null
                            ? Math.abs(k.change).toFixed(1)
                            : "\u2014"}
                        </span>
                      </td>
                      <td className="text-right px-3 md:px-6 py-3 text-gray-700">
                        {k.clicks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.keywords.length === 0 && (
            <div className="p-10 text-center text-neutral text-sm">
              Aún no hay datos. Vuelve pronto.
            </div>
          )}
        </div>

        {/* Evolución (simple sparkline por keyword) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit] mb-1">
            Evolución
          </h2>
          <p className="text-xs md:text-sm text-neutral mb-4">
            Posición media del sitio
          </p>
          <div className="flex items-end justify-center gap-2 h-32">
            <div className="flex-1 max-w-xs bg-gradient-to-t from-violet/20 to-indigo/5 rounded-lg flex items-end justify-center pb-2">
              <span className="text-3xl md:text-4xl font-bold text-violet font-[Outfit]">
                {data.avg_position?.toFixed(1) ?? "\u2014"}
              </span>
            </div>
          </div>
        </div>

        {/* ROI */}
        {data.roi_monthly > 0 && (
          <div className="bg-gradient-to-br from-indigo to-violet rounded-xl shadow-sm p-5 md:p-8 text-white">
            <p className="text-xs md:text-sm font-medium uppercase tracking-wider text-white/70">
              Valor SEO mensual estimado
            </p>
            <p className="text-3xl md:text-5xl font-bold font-[Outfit] mt-1">
              {data.roi_monthly.toLocaleString("es-ES", {
                maximumFractionDigits: 0,
              })}
              <span className="text-xl md:text-2xl ml-1 text-white/70">
                € / mes
              </span>
            </p>
            <p className="text-xs md:text-sm text-white/70 mt-2">
              Potencial adicional si escalas al top 3 en Google
            </p>
          </div>
        )}

        {/* Footer branded */}
        <div className="text-center pt-6">
          <p className="text-xs text-neutral">
            Powered by{" "}
            <a
              href="https://7loop.es"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-violet hover:underline"
            >
              7Loop SEO
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-gray-100 border-l-[3px] border-l-violet">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-lavender/60 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-violet" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs font-medium text-neutral truncate">
            {label}
          </p>
          <p className="text-base md:text-2xl font-bold text-gray-900 font-[Outfit] truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
