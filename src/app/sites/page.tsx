"use client";
import { useState, useEffect } from "react";
import { getSites, type Site } from "@/lib/api";
import Link from "next/link";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  useEffect(() => { getSites().then(setSites).catch(() => {}); }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Sitios web</h1>
      <p className="text-sm text-gray-500 mb-6">Selecciona un sitio para ver sus palabras clave</p>
      <div className="space-y-3">
        {sites.map((site) => (
          <Link key={site.slug} href={`/site/${site.slug}`}
            className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
                {site.site_url[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{site.site_url}</p>
                <p className="text-xs text-gray-500">{site.keyword_count} palabras clave</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Posición media</p>
                <p className="text-lg font-bold text-gray-900">{site.avg_position?.toFixed(1) ?? "—"}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
