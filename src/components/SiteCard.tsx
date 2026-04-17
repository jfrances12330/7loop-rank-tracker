import Link from "next/link";
import type { Site } from "@/lib/api";

export default function SiteCard({ site }: { site: Site }) {
  const trendColor = site.trend === null ? "text-gray" : site.trend > 0 ? "text-emerald-400" : site.trend < 0 ? "text-red-400" : "text-gray";
  const trendIcon = site.trend === null ? "—" : site.trend > 0 ? `▲ ${site.trend.toFixed(1)}` : site.trend < 0 ? `▼ ${Math.abs(site.trend).toFixed(1)}` : "= 0";

  return (
    <Link href={`/site/${site.slug}`} className="block group">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-violet/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-[Outfit] group-hover:text-violet transition-colors">
              {site.site_url}
            </h3>
            <p className="text-sm text-lavender/50">{site.keyword_count} keywords</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo/20 to-violet/20 flex items-center justify-center text-violet">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-lavender/40 uppercase tracking-wider">Pos. Media</p>
            <p className="text-2xl font-bold text-white font-[Outfit]">
              {site.avg_position !== null ? site.avg_position.toFixed(1) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-lavender/40 uppercase tracking-wider">Tendencia</p>
            <p className={`text-2xl font-bold font-[Outfit] ${trendColor}`}>
              {trendIcon}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
