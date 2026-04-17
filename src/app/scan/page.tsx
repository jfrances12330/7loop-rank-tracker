"use client";
import { useState } from "react";
import { triggerScan } from "@/lib/api";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleScan = async () => {
    setScanning(true); setResult(null); setError(false);
    try {
      const res = await triggerScan();
      setResult(res.message || "Escaneo completado");
    } catch {
      setError(true); setResult("Error de conexión con la API");
    } finally { setScanning(false); }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Escanear posiciones</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">Lanza un escaneo manual de todas las palabras clave en Google Search Console</p>
      <button onClick={handleScan} disabled={scanning}
        className="flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-700 disabled:opacity-50 transition shadow-lg">
        <RefreshCw className={`w-6 h-6 ${scanning ? "animate-spin" : ""}`} />
        {scanning ? "Escaneando..." : "Escanear ahora"}
      </button>
      {result && (
        <div className={`mt-6 flex items-center gap-2 px-4 py-3 rounded-lg ${error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{result}</span>
        </div>
      )}
    </div>
  );
}
