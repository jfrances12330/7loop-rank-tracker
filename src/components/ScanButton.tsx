"use client";
import { useState } from "react";
import { triggerScan } from "@/lib/api";
import { RefreshCw } from "lucide-react";

export default function ScanButton({ site: _site }: { site?: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await triggerScan();
      if (res.status === "ok") {
        setResult(`Escaneo completado. ${res.changes ?? 0} cambios detectados.`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult(`Error: ${res.status}`);
      }
    } catch {
      setResult("Error de conexión");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleScan}
        disabled={loading}
        className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-violet hover:bg-indigo text-white rounded-lg font-medium text-xs md:text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-wait"
      >
        <RefreshCw
          className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
        />
        {loading ? "Escaneando..." : "Escanear ahora"}
      </button>
      {result && (
        <span className="text-sm text-neutral font-medium">{result}</span>
      )}
    </div>
  );
}
