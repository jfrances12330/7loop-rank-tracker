import Link from "next/link";
import type { Site } from "@/lib/api";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function SiteCard({ site }: { site: Site }) {
  const trend = site.trend;
  const trendPositive = trend !== null && Number(trend) > 0;
  const trendNegative = trend !== null && Number(trend) < 0;

  const displayName = site.site_url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return (
    <Link href={`/site/${site.slug}`} className="block group">
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet to-indigo flex items-center justify-center text-white text-sm font-bold font-[Outfit]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 font-[Outfit] group-hover:text-violet transition-colors truncate max-w-[180px]">
                {displayName}
              </h3>
              <p className="text-xs text-neutral">
                {site.keyword_count} palabras clave
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div>
            <p className="text-xs text-neutral font-medium uppercase tracking-wider mb-1">
              Posición media
            </p>
            <p className="text-2xl font-bold text-gray-900 font-[Outfit]">
              {site.avg_position !== null
                ? site.avg_position.toFixed(1)
                : "\u2014"}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral font-medium uppercase tracking-wider mb-1">
              Tendencia
            </p>
            <div className="flex items-center gap-1.5">
              {trendPositive && (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              )}
              {trendNegative && (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              {!trendPositive && !trendNegative && (
                <Minus className="w-4 h-4 text-neutral" />
              )}
              <span
                className={`text-lg font-bold font-[Outfit] ${
                  trendPositive
                    ? "text-emerald-600"
                    : trendNegative
                      ? "text-red-500"
                      : "text-neutral"
                }`}
              >
                {trend !== null ? `${Math.abs(Number(trend)).toFixed(1)}` : "\u2014"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end">
          <span className="text-sm font-medium text-violet group-hover:text-indigo transition-colors flex items-center gap-1">
            Ver detalle
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
