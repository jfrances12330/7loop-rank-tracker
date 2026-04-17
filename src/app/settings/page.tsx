"use client";
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Link as LinkIcon,
  Copy,
  Plus,
  Trash2,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  getSites,
  listClientTokens,
  createClientToken,
  deleteClientToken,
  type Site,
  type ClientToken,
} from "@/lib/api";

export default function SettingsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [tokens, setTokens] = useState<ClientToken[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [clientName, setClientName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([getSites(), listClientTokens()])
      .then(([s, t]) => {
        setSites(s);
        setTokens(t);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!selectedSite) return;
    setSaving(true);
    try {
      await createClientToken(selectedSite, clientName.trim());
      setClientName("");
      setSelectedSite("");
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (token: string) => {
    if (!confirm("¿Eliminar este enlace de cliente?")) return;
    await deleteClientToken(token);
    load();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/client/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 pb-28 md:pb-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[Outfit] flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 md:w-7 md:h-7 text-violet" />
          Ajustes
        </h1>
        <p className="text-sm text-neutral mt-1">
          Configuración general y enlaces públicos para clientes
        </p>
      </div>

      {/* Client tokens */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-4 md:px-6 py-4 border-b border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit] flex items-center gap-2">
            <LinkIcon className="w-4 h-4 md:w-5 md:h-5 text-violet" />
            Enlaces para clientes
          </h2>
          <p className="text-xs md:text-sm text-neutral mt-0.5">
            Genera un enlace público para que tu cliente vea solo su sitio.
          </p>
        </div>

        <div className="px-4 md:px-6 py-4 bg-lavender/30 border-b border-gray-100 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 bg-white"
            >
              <option value="">— Selecciona sitio —</option>
              {sites.map((s) => (
                <option key={s.slug} value={s.site_url}>
                  {s.site_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nombre del cliente (opcional)"
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 bg-white"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!selectedSite || saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {saving ? "Generando..." : "Generar enlace"}
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-neutral text-sm">Cargando...</div>
        ) : tokens.length === 0 ? (
          <div className="p-8 text-center text-neutral text-sm">
            Aún no has generado ningún enlace de cliente.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tokens.map((t) => {
              const display = t.site_url
                .replace(/^https?:\/\//, "")
                .replace(/\/$/, "");
              return (
                <div key={t.token} className="px-4 md:px-6 py-3">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {display}
                      </p>
                      {t.client_name && (
                        <p className="text-xs text-neutral">{t.client_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => copyLink(t.token)}
                        className="p-1.5 rounded-lg text-violet hover:bg-lavender/40"
                        title="Copiar enlace"
                      >
                        {copied === t.token ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={`/client/${t.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-violet hover:bg-lavender/40"
                        title="Abrir enlace"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(t.token)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <code className="block text-[11px] text-neutral bg-gray-50 rounded-lg px-2 py-1 font-mono truncate">
                    /client/{t.token}
                  </code>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-xs text-neutral text-center">
        v1.0 — 7Loop SEO Tracker
      </div>
    </div>
  );
}
