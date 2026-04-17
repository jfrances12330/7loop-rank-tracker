"use client";
import { useEffect, useState } from "react";
import { Bell, X, ArrowUpRight, ArrowDownRight, AlertTriangle, Info, Check } from "lucide-react";
import { getAlerts, markAlertRead, type Alert } from "@/lib/api";

function AlertIcon({ type, severity }: { type: string; severity: string }) {
  if (type === "ranking_up") return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
  if (type === "ranking_down") return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  if (severity === "danger" || severity === "warning")
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <Info className="w-4 h-4 text-violet" />;
}

function timeAgo(iso: string) {
  const d = new Date(iso.replace(" ", "T"));
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

export default function AlertsBell() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    getAlerts(50)
      .then((r) => {
        setAlerts(r.alerts);
        setUnread(r.unread_count);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const handleMarkRead = async (id: number) => {
    await markAlertRead(id);
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, read: 1 } : x)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const handleMarkAll = async () => {
    await markAlertRead(undefined, true);
    setAlerts((a) => a.map((x) => ({ ...x, read: 1 })));
    setUnread(0);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg hover:bg-lavender/40 transition-colors"
        aria-label="Alertas"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-indigo to-violet text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="flex-1 bg-black/40" />
          <div
            className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-[Outfit]">
                  Alertas
                </h3>
                <p className="text-xs text-neutral">
                  {unread} sin leer de {alerts.length}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {alerts.some((a) => !a.read) && (
                  <button
                    onClick={handleMarkAll}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-violet hover:bg-lavender/40"
                  >
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-neutral text-sm">
                  No hay alertas todavía.
                  <br />
                  Las verás aquí cuando cambie algo importante.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {alerts.map((a) => {
                    const site = a.site_url.replace(/^https?:\/\//, "").replace(/\/$/, "");
                    return (
                      <div
                        key={a.id}
                        className={`px-4 py-3 ${!a.read ? "bg-lavender/20" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <AlertIcon type={a.type} severity={a.severity} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-gray-900 truncate">
                                {site}
                              </span>
                              {!a.read && (
                                <span className="w-2 h-2 rounded-full bg-violet flex-shrink-0" />
                              )}
                            </div>
                            {a.keyword && (
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {a.keyword}
                              </p>
                            )}
                            <p className="text-xs text-gray-700 mt-0.5 break-words">
                              {a.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-neutral">
                                {timeAgo(a.created_at)}
                              </span>
                              {!a.read && (
                                <button
                                  onClick={() => handleMarkRead(a.id)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-violet hover:underline"
                                >
                                  <Check className="w-3 h-3" />
                                  Marcar leída
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
