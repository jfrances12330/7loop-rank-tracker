"use client";
import { useEffect, useState } from "react";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  type Task,
} from "@/lib/api";
import { ClipboardList, Plus, X, Trash2, CircleCheck, Loader2 } from "lucide-react";

function StatusBadge({ status }: { status: Task["status"] }) {
  const map: Record<Task["status"], { label: string; cls: string }> = {
    pending: {
      label: "Pendiente",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    in_progress: {
      label: "En progreso",
      cls: "bg-sky-50 text-sky-700 border-sky-200",
    },
    completed: {
      label: "Completada",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${cls}`}
    >
      {label}
    </span>
  );
}

export default function TasksPanel({ site }: { site: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getTasks(site)
      .then((r) => {
        setTasks(r.tasks);
        setCompleted(r.completed);
        setTotal(r.total);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [site]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addTask(site, title.trim(), description.trim(), priority);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setShowAdd(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (t: Task) => {
    const next =
      t.status === "completed"
        ? "pending"
        : t.status === "pending"
          ? "in_progress"
          : "completed";
    await updateTask(t.id, next);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    load();
  };

  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      {/* Add modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 font-[Outfit]">
                Nueva tarea
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la tarea"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                rows={3}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 resize-none"
              />
              <div className="flex gap-2">
                {(["high", "medium", "low"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                      priority === p
                        ? p === "high"
                          ? "bg-gradient-to-r from-indigo to-violet text-white border-transparent"
                          : p === "medium"
                            ? "bg-violet/10 text-violet border-violet/30"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    {p === "high" ? "Alta" : p === "medium" ? "Media" : "Baja"}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAdd}
                disabled={saving || !title.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Añadir tarea"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit] flex items-center gap-2">
            <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-violet" />
            Tareas
          </h2>
          <p className="text-xs md:text-sm text-neutral mt-0.5">
            {completed} de {total} completadas
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir</span>
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-4 md:px-6 pt-3">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo to-violet transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center text-neutral text-sm">
          <Loader2 className="w-5 h-5 animate-spin inline-block" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="px-4 md:px-6 py-10 text-center text-neutral text-sm">
          No hay tareas todavía. Pulsa <strong>Añadir</strong> para crear la primera.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {tasks.map((t) => {
            const done = t.status === "completed";
            return (
              <div
                key={t.id}
                className={`px-4 md:px-6 py-3 flex items-start gap-3 group ${
                  done ? "bg-gray-50/50" : ""
                }`}
              >
                <button
                  onClick={() => toggleStatus(t)}
                  className="mt-0.5 flex-shrink-0"
                  title="Cambiar estado"
                >
                  {done ? (
                    <CircleCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-violet transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${done ? "line-through text-neutral" : "text-gray-900"}`}
                  >
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="text-xs text-neutral mt-0.5">{t.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <StatusBadge status={t.status} />
                    {t.priority === "high" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-indigo to-violet text-white">
                        Alta
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
