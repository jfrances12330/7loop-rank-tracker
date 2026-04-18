"use client";
import { useEffect, useState } from "react";
import {
  getGbpPosts,
  createGbpPost,
  deleteGbpPost,
  suggestGbpPost,
  type GbpPost,
} from "@/lib/api";
import {
  Megaphone,
  Plus,
  Copy,
  Sparkles,
  X,
  Check,
  Trash2,
  FileText,
  ExternalLink,
} from "lucide-react";

interface Props {
  site: string;
}

const MAX_CHARS = 1500;

export default function GbpPostsPanel({ site }: Props) {
  const [posts, setPosts] = useState<GbpPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getGbpPosts(site)
      .then((r) => setPosts(r.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const s = await suggestGbpPost(site);
      if (s?.text) setText(s.text);
    } finally {
      setSuggesting(false);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await createGbpPost(site, text.trim());
      if (res?.ok) {
        setToast("Publicación guardada");
        setOpen(false);
        setText("");
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      setToast("Texto copiado al portapapeles");
    } catch {
      setToast("No se pudo copiar");
    }
  };

  const handleDelete = async (id: number) => {
    await deleteGbpPost(id);
    load();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-[fadeIn_0.3s_ease]">
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-lavender/60 flex items-center justify-center">
            <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-violet" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 font-[Outfit]">
              📢 Publicaciones Google
            </h3>
            <p className="text-xs text-neutral truncate">
              Posts para el Perfil de Google Business
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setOpen(true);
            setText("");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Crear publicación
        </button>
      </div>

      <div className="p-4 md:p-6">
        {loading ? (
          <div className="text-center text-neutral text-sm animate-pulse">Cargando...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-neutral text-sm py-6">
            Aún no hay publicaciones. Crea la primera con el botón de arriba.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div
                key={p.id}
                className="border border-gray-100 rounded-lg p-3.5 hover:border-violet/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-violet" />
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                        p.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                    <span className="text-[11px] text-neutral">{p.created_at}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(p.text)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-violet hover:bg-lavender/40 transition-colors"
                      title="Copiar al portapapeles"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href="https://business.google.com/posts"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-violet hover:bg-lavender/40 transition-colors"
                      title="Abrir Google Business Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-5 md:p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 font-[Outfit]">
                📢 Nueva publicación
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Texto de la publicación
                  </label>
                  <button
                    onClick={handleSuggest}
                    disabled={suggesting}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-gradient-to-r from-indigo/10 to-violet/10 text-violet hover:from-indigo/20 hover:to-violet/20 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {suggesting ? "Generando..." : "Sugerir con IA"}
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Escribe aquí tu publicación para Google Business Profile..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet resize-none"
                />
                <p className="text-[11px] text-neutral mt-1 text-right">
                  {text.length} / {MAX_CHARS}
                </p>
              </div>

              {text && (
                <div className="border border-dashed border-violet/40 rounded-lg p-3 bg-lavender/20">
                  <p className="text-[10px] font-semibold text-violet uppercase tracking-wider mb-1.5">
                    Previsualización
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {text}
                  </p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <p className="text-[11px] text-amber-800">
                  <strong>Próximamente:</strong> conexión directa a Google Business Profile. Por ahora
                  copia el texto y pégalo en{" "}
                  <a
                    href="https://business.google.com/posts"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-medium"
                  >
                    business.google.com/posts
                  </a>
                  .
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(text)}
                  disabled={!text.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-violet bg-lavender/60 hover:bg-lavender disabled:opacity-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !text.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo to-violet hover:from-indigo/90 hover:to-violet/90 disabled:opacity-50 transition-all"
                >
                  {saving ? "Guardando..." : "Guardar borrador"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
