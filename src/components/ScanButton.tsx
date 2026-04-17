"use client";
import { useState } from "react";
import { triggerScan } from "@/lib/api";

export default function ScanButton({ site }: { site?: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await triggerScan(site);
      if (res.status === "ok") {
        setResult(`Escaneado. ${res.changes} cambios detectados.`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult(`Error: ${res.status}`);
      }
    } catch {
      setResult("Error de conexion con la API");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleScan}
        disabled={loading}
        className="px-5 py-2.5 bg-gradient-to-r from-indigo to-violet text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Escaneando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Escanear ahora
          </>
        )}
      </button>
      {result && <span className="text-sm text-lavender/60">{result}</span>}
    </div>
  );
}
