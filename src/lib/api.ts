const API = process.env.NEXT_PUBLIC_API_URL || "http://185.158.107.45:3055";

export interface Site {
  site_url: string;
  slug: string;
  keyword_count: number;
  avg_position: number | null;
  prev_avg_position: number | null;
  trend: number | null;
}

export interface Keyword {
  id: number;
  keyword: string;
  target_url: string | null;
  priority: string;
  position: number | null;
  prev_position: number | null;
  change: number | null;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  scan_date: string | null;
  sparkline: number[];
}

export interface HistoryPoint {
  date: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
}

export interface Stats {
  total_keywords: number;
  total_sites: number;
  avg_position: number | null;
  improvements: number;
  drops: number;
  stable: number;
  last_scan: string | null;
}

export interface ScanResult {
  status: string;
  changes: number;
  details: { site: string; keyword: string; old: number; new: number; delta: number }[];
}

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const getSites = () => fetchAPI<Site[]>("/api/sites");
export const getKeywords = (site: string) => fetchAPI<Keyword[]>(`/api/keywords?site=${encodeURIComponent(site)}`);
export const getHistory = (site: string, keyword: string, days = 30) =>
  fetchAPI<HistoryPoint[]>(`/api/history?site=${encodeURIComponent(site)}&keyword=${encodeURIComponent(keyword)}&days=${days}`);
export const getStats = () => fetchAPI<Stats>("/api/stats");

export async function triggerScan(site?: string): Promise<ScanResult> {
  const res = await fetch(`${API}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(site ? { site } : {}),
  });
  return res.json();
}
