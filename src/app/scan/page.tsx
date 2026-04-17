"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  triggerScan,
  getScanStatus,
  type ScanStatus,
} from "@/lib/api";

type ScanState = "idle" | "scanning" | "completed" | "error";

interface ScanHistoryEntry {
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  message: string;
  gsc_scanned: number;
  maps_scanned: number;
}

const HISTORY_KEY = "rank-tracker-scan-history";

function loadHistory(): ScanHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: ScanHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 5)));
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seg`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min} min ${sec} seg` : `${min} min`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ScanPage() {
  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState("");
  const [summary, setSummary] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(
    (data: ScanStatus) => {
      stopPolling();
      setState("completed");
      setDuration(
        data.duration_seconds
          ? `en ${formatDuration(data.duration_seconds)}`
          : ""
      );
      const gsc = data.results?.gsc?.scanned ?? 0;
      const maps = data.results?.maps?.scanned ?? 0;
      setSummary(`${gsc} keywords GSC + ${maps} Maps`);

      // Save to history
      if (data.started_at && data.completed_at) {
        const entry: ScanHistoryEntry = {
          started_at: data.started_at,
          completed_at: data.completed_at,
          duration_seconds: data.duration_seconds || 0,
          message: data.message || "Escaneo completado",
          gsc_scanned: gsc,
          maps_scanned: maps,
        };
        const updated = [entry, ...loadHistory()].slice(0, 5);
        saveHistory(updated);
        setHistory(updated);
      }
    },
    [stopPolling]
  );

  const startPolling = useCallback(() => {
    pollRef.current = setInterval(async () => {
      try {
        const status = await getScanStatus();
        if (status.status === "scanning") {
          setProgress(status.progress || "Escaneando...");
        } else if (status.status === "completed") {
          handleComplete(status);
        } else if (status.status === "error") {
          stopPolling();
          setState("error");
          setError(status.message || "Error desconocido");
        }
      } catch {
        // ignore
      }
    }, 3000);
  }, [handleComplete, stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Check for in-progress scan on mount
  useEffect(() => {
    (async () => {
      try {
        const status = await getScanStatus();
        if (status.status === "scanning") {
          setState("scanning");
          setProgress(status.progress || "Escaneando...");
          startPolling();
        }
      } catch {
        // ignore
      }
    })();
  }, [startPolling]);

  const handleScan = async () => {
    setState("scanning");
    setProgress("Iniciando escaneo...");
    setSummary("");
    setDuration("");
    setError("");
    try {
      const res = await triggerScan();
      if (res.status === "scanning") {
        startPolling();
      } else if (res.status === "completed") {
        handleComplete(res);
      } else {
        setState("error");
        setError(res.message || "Error");
      }
    } catch {
      setState("error");
      setError("Error de conexion con la API");
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 font-heading">
        Escanear posiciones
      </h1>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
        Lanza un escaneo completo: Google Search Console + Google Maps local. Puede tardar varios minutos.
      </p>

      {/* Main scan button */}
      <button
        onClick={handleScan}
        disabled={state === "scanning"}
        className={`
          flex items-center gap-3 px-10 py-5 rounded-2xl
          text-white font-semibold text-lg
          transition-all duration-300 shadow-lg
          disabled:cursor-wait
          ${
            state === "scanning"
              ? "animate-pulse-glow bg-gradient-to-r from-indigo to-violet"
              : state === "completed"
              ? "bg-emerald-500 shadow-emerald-200"
              : state === "error"
              ? "bg-red-500"
              : "btn-scan-gradient hover:shadow-xl hover:scale-105"
          }
        `}
      >
        {state === "scanning" ? (
          <img
            src="/icon-192.png"
            alt=""
            className="w-8 h-8 animate-spin-slow rounded-full"
          />
        ) : state === "completed" ? (
          <span className="inline-block animate-scale-in text-2xl leading-none">
            &#x2705;
          </span>
        ) : state === "error" ? (
          <span className="text-2xl leading-none">&#x274C;</span>
        ) : (
          <img src="/icon-192.png" alt="" className="w-8 h-8 rounded-full" />
        )}

        {state === "scanning" ? (
          <span>
            Escaneando
            <span className="animate-dots" />
          </span>
        ) : state === "completed" ? (
          <span>Actualizado {duration}</span>
        ) : state === "error" ? (
          "Error"
        ) : (
          "Escanear ahora"
        )}
      </button>

      {/* Progress */}
      {state === "scanning" && progress && (
        <p className="mt-4 text-sm text-violet font-medium animate-fade-in">
          {progress}
        </p>
      )}

      {/* Result summary */}
      {state === "completed" && summary && (
        <div className="mt-4 px-5 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium animate-fade-in">
          {summary}
        </div>
      )}

      {/* Error */}
      {state === "error" && error && (
        <div className="mt-4 px-5 py-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Scan history */}
      {history.length > 0 && (
        <div className="mt-12 w-full max-w-md">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Ultimos escaneos
          </h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm text-sm"
              >
                <div>
                  <span className="text-gray-700 font-medium">
                    {formatDate(h.completed_at)}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {formatDuration(h.duration_seconds)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {h.gsc_scanned} GSC + {h.maps_scanned} Maps
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
