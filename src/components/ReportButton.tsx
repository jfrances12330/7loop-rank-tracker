"use client";
import { useState } from "react";
import { FileDown, Loader2, Mail, X, Check, Download } from "lucide-react";
import { sendReportEmail } from "@/lib/api";

export default function ReportButton({ site }: { site: string }) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = `/api/proxy?endpoint=report/pdf&site=${encodeURIComponent(site)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("pdf error");
      const blob = await res.blob();
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `informe-${site.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      alert("Error al generar el informe");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    try {
      const result = await sendReportEmail(site, email.trim());
      if (result.ok) {
        setSent(true);
        setTimeout(() => {
          setShowModal(false);
          setSent(false);
          setEmail("");
        }, 2000);
      } else {
        setError(result.error || "Error al enviar el email");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 transition-all shadow-sm disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {loading ? "Generando..." : "Generar informe"}
        </span>
        <span className="sm:hidden">PDF</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => !sending && setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 font-[Outfit]">
                Informe SEO
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Enviado</p>
                <p className="text-sm text-gray-500 mt-1">
                  El informe ha sido enviado a {email}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Email input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email del cliente
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-all"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSendEmail}
                    disabled={sending || !email.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    {sending ? "Enviando..." : "Enviar por email"}
                  </button>
                  <button
                    onClick={() => {
                      handleDownload();
                      setShowModal(false);
                    }}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
