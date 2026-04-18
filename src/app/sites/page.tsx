"use client";
import { useState, useEffect, useCallback } from "react";
import { getSites, addSite, getAuditStatus, type Site, type AuditResult } from "@/lib/api";
import Link from "next/link";
import {
  Plus, X, Loader2, Check, AlertCircle, Globe, MapPin, User,
  FileText, Bot, Gauge, Search,
} from "lucide-react";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [city, setCity] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audit
  const [auditSite, setAuditSite] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    getSites().then(setSites).catch(() => {});
  }, []);

  // Polling audit status
  useEffect(() => {
    if (!auditSite) return;
    const interval = setInterval(async () => {
      try {
        const status = await getAuditStatus(auditSite);
        setAuditResult(status);
        if (status.status === "completed" || status.status === "error") {
          clearInterval(interval);
          // Refresh sites list
          getSites().then(setSites).catch(() => {});
        }
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [auditSite]);

  const handleAdd = async () => {
    if (!url.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const result = await addSite(url.trim(), clientName.trim(), city.trim());
      if (result.error) {
        setError(result.error);
        setAdding(false);
        return;
      }
      // Start polling audit
      setAuditSite(result.site_url);
      setAuditResult({ status: "running", progress: "Iniciando auditoria..." });
    } catch {
      setError("Error de conexion");
    } finally {
      setAdding(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setUrl("");
    setClientName("");
    setCity("");
    setError(null);
    setAuditSite(null);
    setAuditResult(null);
  };

  return (
    <div className="p-4 md:p-8 pb-28 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 font-[Outfit]">
            Sitios web
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona un sitio para ver sus palabras clave
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Anadir sitio</span>
        </button>
      </div>

      <div className="space-y-3">
        {sites.map((site) => (
          <Link
            key={site.slug}
            href={`/site/${site.slug}`}
            className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo to-violet flex items-center justify-center text-white font-bold text-sm">
                {site.site_url[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{site.site_url}</p>
                <p className="text-xs text-gray-500">
                  {site.keyword_count} palabras clave
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Posicion media</p>
                <p className="text-lg font-bold text-gray-900 font-[Outfit]">
                  {site.avg_position?.toFixed(1) ?? "\u2014"}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {sites.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No hay sitios todavia</p>
            <p className="text-sm mt-1">
              Pulsa &quot;Anadir sitio&quot; para empezar
            </p>
          </div>
        )}
      </div>

      {/* Modal Anadir Sitio */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => !adding && !auditSite && closeModal()}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 font-[Outfit]">
                {auditResult ? "Auditoria inicial" : "Anadir nuevo sitio"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {!auditSite ? (
              /* Formulario */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Globe className="w-4 h-4 inline mr-1" />
                    URL del sitio web
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="ejemplo.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre del cliente
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="ej: Clinica Dental Lopez"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="ej: Toledo, Spain"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </p>
                )}

                <button
                  onClick={handleAdd}
                  disabled={adding || !url.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {adding ? "Analizando..." : "Anadir y auditar"}
                </button>
              </div>
            ) : auditResult?.status === "running" ? (
              /* Auditoria en progreso */
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-violet animate-spin" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Auditoria en curso...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {auditResult.progress || "Analizando sitio web..."}
                  </p>
                </div>
              </div>
            ) : auditResult?.status === "completed" && auditResult.audit ? (
              /* Resultados de auditoria */
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    Auditoria completada
                  </p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 gap-3">
                  <AuditItem
                    icon={FileText}
                    label="Title"
                    value={auditResult.audit.meta_title ? "OK" : "Falta"}
                    ok={!!auditResult.audit.meta_title}
                  />
                  <AuditItem
                    icon={Bot}
                    label="robots.txt"
                    value={auditResult.audit.robots_txt ? "OK" : "Falta"}
                    ok={auditResult.audit.robots_txt}
                  />
                  <AuditItem
                    icon={Globe}
                    label="sitemap.xml"
                    value={auditResult.audit.sitemap_xml ? "OK" : "Falta"}
                    ok={auditResult.audit.sitemap_xml}
                  />
                  <AuditItem
                    icon={Gauge}
                    label="PageSpeed"
                    value={
                      auditResult.audit.pagespeed !== null
                        ? `${auditResult.audit.pagespeed}/100`
                        : "N/A"
                    }
                    ok={
                      auditResult.audit.pagespeed !== null &&
                      auditResult.audit.pagespeed >= 50
                    }
                  />
                </div>

                {/* Meta */}
                {auditResult.audit.meta_title && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Title
                    </p>
                    <p className="text-sm text-gray-900 truncate">
                      {auditResult.audit.meta_title}
                    </p>
                  </div>
                )}
                {auditResult.audit.meta_description && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Meta Description
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {auditResult.audit.meta_description}
                    </p>
                  </div>
                )}

                {/* Keywords detectadas */}
                {auditResult.audit.keywords_detected.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Keywords detectadas ({auditResult.audit.keywords_added} anadidas)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {auditResult.audit.keywords_detected.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 bg-violet/10 text-violet text-xs rounded-lg font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 transition-all"
                >
                  Ir al dashboard
                </button>
              </div>
            ) : auditResult?.status === "error" ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Error</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {auditResult.message || "Error durante la auditoria"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cerrar
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function AuditItem({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 border ${
        ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={`w-4 h-4 ${ok ? "text-emerald-600" : "text-red-500"}`}
        />
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <p
        className={`text-sm font-bold mt-1 ${
          ok ? "text-emerald-700" : "text-red-600"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
