"use client";
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

export default function ReportButton({ site }: { site: string }) {
  const [loading, setLoading] = useState(false);

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
    } catch (e) {
      alert("Error al generar el informe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
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
  );
}
