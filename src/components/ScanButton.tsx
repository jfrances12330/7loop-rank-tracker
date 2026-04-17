"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { triggerScan, getScanStatus, type ScanStatus } from "@/lib/api";

type ScanState = "idle" | "scanning" | "completed" | "error";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seg`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min} min ${sec} seg` : `${min} min`;
}

export default function ScanButton({
  site: _site,
  onScanComplete,
}: {
  site?: string;
  onScanComplete?: () => void;
}) {
  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState("");
  const [summary, setSummary] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        data.duration_seconds ? `en ${formatDuration(data.duration_seconds)}` : ""
      );
      if (data.results) {
        const gsc = data.results.gsc?.scanned ?? 0;
        const maps = data.results.maps?.scanned ?? 0;
        setSummary(`${gsc} keywords GSC + ${maps} Maps`);
      } else {
        setSummary(data.message || "Escaneo completado");
      }
      // Reset after 5 seconds
      setTimeout(() => {
        setState("idle");
        setProgress("");
        setSummary("");
        setDuration("");
      }, 5000);
      // Trigger data refetch
      onScanComplete?.();
    },
    [stopPolling, onScanComplete]
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
          setTimeout(() => {
            setState("idle");
            setError("");
          }, 5000);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
  }, [handleComplete, stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Check if a scan is already running on mount
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
        setTimeout(() => {
          setState("idle");
          setError("");
        }, 5000);
      }
    } catch {
      setState("error");
      setError("Error de conexion");
      setTimeout(() => {
        setState("idle");
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <button
          onClick={handleScan}
          disabled={state === "scanning"}
          className={`
            inline-flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5
            text-white rounded-lg font-medium text-xs md:text-sm
            transition-all duration-300 shadow-sm
            disabled:cursor-wait
            ${
              state === "scanning"
                ? "animate-pulse-glow bg-gradient-to-r from-indigo to-violet"
                : state === "completed"
                ? "bg-emerald-500"
                : state === "error"
                ? "bg-red-500"
                : "btn-scan-gradient hover:shadow-md"
            }
          `}
        >
          {state === "scanning" ? (
            <img
              src="/icon-192.png"
              alt=""
              className="w-5 h-5 animate-spin-slow rounded-full"
            />
          ) : state === "completed" ? (
            <span className="inline-block animate-scale-in text-base leading-none">
              &#x2705;
            </span>
          ) : state === "error" ? (
            <span className="text-base leading-none">&#x274C;</span>
          ) : (
            <img
              src="/icon-192.png"
              alt=""
              className="w-5 h-5 rounded-full"
            />
          )}

          {state === "scanning" ? (
            <span>
              Escaneando
              <span className="animate-dots" />
            </span>
          ) : state === "completed" ? (
            <span>Actualizado {duration}</span>
          ) : state === "error" ? (
            <span>Error</span>
          ) : (
            "Escanear ahora"
          )}
        </button>

        {state === "completed" && summary && (
          <span className="text-xs text-emerald-600 font-medium animate-fade-in">
            {summary}
          </span>
        )}
        {state === "error" && error && (
          <span className="text-xs text-red-600 font-medium">{error}</span>
        )}
      </div>

      {state === "scanning" && progress && (
        <p className="text-[11px] text-violet font-medium pl-1 animate-fade-in">
          {progress}
        </p>
      )}
    </div>
  );
}
