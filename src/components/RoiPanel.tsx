"use client";
import { useEffect, useState } from "react";
import { getRoi, setRoiConfig, type RoiResult } from "@/lib/api";
import { Wallet, Settings, X } from "lucide-react";

export default function RoiPanel({ site }: { site: string }) {
  const [data, setData] = useState<RoiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [rate, setRate] = useState(0.05);
  const [clientValue, setClientValue] = useState(300);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getRoi(site)
      .then((d) => {
        setData(d);
        setRate(d.conversion_rate);
        setClientValue(d.client_value);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [site]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setRoiConfig(site, rate, clientValue);
      setShowConfig(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
        <div className="h-24 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!data || data.keywords.length === 0) return null;

  const top = data.keywords.slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      {/* Config modal */}
      {showConfig && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfig(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 font-[Outfit]">
                Configuración ROI
              </h3>
              <button
                onClick={() => setShowConfig(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tasa de conversión (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30"
                />
                <p className="text-xs text-neutral mt-1">
                  Por defecto 0.05 (5% de las visitas se convierten)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Valor medio por cliente (€)
                </label>
                <input
                  type="number"
                  min="0"
                  value={clientValue}
                  onChange={(e) => setClientValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit] flex items-center gap-2">
            <Wallet className="w-4 h-4 md:w-5 md:h-5 text-violet" />
            Valor SEO estimado
          </h2>
          <p className="text-xs md:text-sm text-neutral mt-0.5">
            Potencial de ingresos si escalas al top 3
          </p>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet hover:bg-lavender/40 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ajustar</span>
        </button>
      </div>

      <div className="px-4 md:px-6 py-4 md:py-5 grid grid-cols-2 gap-3 md:gap-4 bg-gradient-to-br from-lavender/40 to-white">
        <div>
          <p className="text-[10px] md:text-xs text-neutral font-medium uppercase tracking-wider">
            Valor mensual estimado
          </p>
          <p className="text-2xl md:text-4xl font-bold text-midnight font-[Outfit] mt-1">
            {data.total_monthly_value.toLocaleString("es-ES", {
              maximumFractionDigits: 0,
            })}
            <span className="text-lg md:text-2xl text-violet ml-1">€</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] md:text-xs text-neutral font-medium uppercase tracking-wider">
            Valor anual proyectado
          </p>
          <p className="text-2xl md:text-4xl font-bold text-violet font-[Outfit] mt-1">
            {data.total_yearly_value.toLocaleString("es-ES", {
              maximumFractionDigits: 0,
            })}
            <span className="text-lg md:text-2xl text-violet ml-1">€</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left px-4 md:px-6 py-2.5 text-[10px] md:text-xs font-semibold text-neutral uppercase tracking-wider">
                Keyword
              </th>
              <th className="text-right px-3 py-2.5 text-[10px] md:text-xs font-semibold text-neutral uppercase tracking-wider">
                Pos.
              </th>
              <th className="text-right px-3 py-2.5 text-[10px] md:text-xs font-semibold text-neutral uppercase tracking-wider hidden sm:table-cell">
                Clics top 3
              </th>
              <th className="text-right px-3 md:px-6 py-2.5 text-[10px] md:text-xs font-semibold text-neutral uppercase tracking-wider">
                Valor/mes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {top.map((k) => (
              <tr key={k.keyword} className="hover:bg-lavender/20">
                <td className="px-4 md:px-6 py-2.5 text-gray-900 font-medium max-w-[180px] truncate">
                  {k.keyword}
                </td>
                <td className="text-right px-3 py-2.5 text-gray-700 font-[Outfit]">
                  {k.position ? k.position.toFixed(0) : "\u2014"}
                </td>
                <td className="text-right px-3 py-2.5 text-gray-700 hidden sm:table-cell">
                  {k.top3_clicks.toFixed(0)}
                </td>
                <td className="text-right px-3 md:px-6 py-2.5 font-bold text-violet font-[Outfit]">
                  {k.monthly_value.toFixed(0)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
