"use client";
import { useEffect, useState } from "react";
import {
  getNap,
  setNapConfig,
  triggerNapScan,
  type NapResult,
  type NapListing,
} from "@/lib/api";
import { ClipboardList, Check, X, AlertCircle, Play, Edit3 } from "lucide-react";

interface Props {
  site: string;
}

function StatusPill({ matches }: { matches: number }) {
  if (matches === 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Check className="w-3 h-3" />
        Correcto
      </span>
    );
  }
  if (matches >= 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="w-3 h-3" />
        Parcial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
      <X className="w-3 h-3" />
      No encontrado
    </span>
  );
}

function FieldIcon({ match }: { match: number }) {
  return match ? (
    <Check className="w-3.5 h-3.5 text-emerald-500 inline" strokeWidth={3} />
  ) : (
    <X className="w-3.5 h-3.5 text-red-400 inline" strokeWidth={2.5} />
  );
}

export default function NapPanel({ site }: Props) {
  const [data, setData] = useState<NapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getNap(site)
      .then((r) => {
        setData(r);
        setForm({
          name: r.official.name || "",
          address: r.official.address || "",
          phone: r.official.phone || "",
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await setNapConfig(site, form.name, form.address, form.phone);
      setEditing(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleScan = async () => {
    if (!data?.official.name) {
      setEditing(true);
      return;
    }
    setScanning(true);
    try {
      await triggerNapScan(site);
    } finally {
      setTimeout(() => {
        load();
        setScanning(false);
      }, 3000);
    }
  };

  const hasOfficial = !!(data?.official.name && data?.official.phone);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-lavender/60 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-violet" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit]">
              📋 Directorios locales
            </h3>
            <p className="text-xs text-neutral truncate">
              Consistencia NAP (nombre · dirección · teléfono)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet bg-lavender/60 hover:bg-lavender transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {hasOfficial ? "Editar" : "Configurar"}
          </button>
          <button
            onClick={handleScan}
            disabled={scanning || !hasOfficial}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo to-violet disabled:opacity-50 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            {scanning ? "Escaneando..." : "Escanear"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-lavender/20 space-y-3">
          <p className="text-xs text-neutral">
            Introduce los datos oficiales del negocio (lo que debe aparecer en cada directorio).
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre oficial</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Clínica Dental Lobato"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Ej: Calle Mayor 15, Elche 03203"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ej: +34 966 123 456"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveConfig}
              disabled={saving || !form.name.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo to-violet disabled:opacity-50 transition-all"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6">
        {loading ? (
          <div className="text-center text-neutral text-sm animate-pulse">Cargando...</div>
        ) : !hasOfficial ? (
          <div className="text-center text-neutral text-sm py-6">
            Configura los datos oficiales del negocio para empezar a verificar directorios.
          </div>
        ) : data && data.listings.length === 0 ? (
          <div className="text-center text-neutral text-sm py-6">
            Aún no se ha escaneado ningún directorio. Pulsa «Escanear» para empezar.
          </div>
        ) : data ? (
          <>
            <div className="mb-4 p-3 bg-gradient-to-br from-violet/10 to-indigo/10 rounded-lg border border-violet/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-violet font-semibold uppercase tracking-wider">
                    Puntuación NAP
                  </p>
                  <p className="text-3xl font-bold text-violet font-[Outfit] mt-1">
                    {data.consistency_score}%
                  </p>
                </div>
                <div className="text-right text-xs text-neutral">
                  <p>{data.listings.length} directorios</p>
                  <p>comprobados</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-3 py-2 text-[11px] font-semibold text-neutral uppercase tracking-wider">
                      Directorio
                    </th>
                    <th className="text-center px-2 py-2 text-[11px] font-semibold text-neutral uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="text-center px-2 py-2 text-[11px] font-semibold text-neutral uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="text-center px-2 py-2 text-[11px] font-semibold text-neutral uppercase tracking-wider">
                      Tel.
                    </th>
                    <th className="text-right px-3 py-2 text-[11px] font-semibold text-neutral uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.listings.map((l: NapListing) => {
                    const matches = (l.name_match || 0) + (l.address_match || 0) + (l.phone_match || 0);
                    return (
                      <tr key={l.directory} className="hover:bg-lavender/20 transition-colors">
                        <td className="px-3 py-2.5">
                          {l.url ? (
                            <a
                              href={l.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-gray-900 hover:text-violet transition-colors"
                            >
                              {l.directory}
                            </a>
                          ) : (
                            <span className="font-medium text-gray-900">{l.directory}</span>
                          )}
                          {(l.name_found || l.address_found || l.phone_found) && (
                            <p className="text-[11px] text-neutral mt-0.5 line-clamp-1">
                              {[l.name_found, l.address_found, l.phone_found]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <FieldIcon match={l.name_match} />
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <FieldIcon match={l.address_match} />
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <FieldIcon match={l.phone_match} />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <StatusPill matches={matches} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
