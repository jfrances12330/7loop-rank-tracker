const API = '/api/proxy';

export interface Site {
  site_url: string;
  slug: string;
  keyword_count: number;
  avg_position: number | null;
  prev_avg_position: number | null;
  trend: string | null;
}

export interface Stats {
  total_keywords: number;
  total_sites: number;
  avg_position: number;
  improved: number;
  declined: number;
}

export interface Keyword {
  keyword: string;
  position: number | null;
  prev_position: number | null;
  change: number | null;
  clicks: number;
  impressions: number;
  ctr: number;
  priority: string;
  scan_date: string;
}

export interface HistoryPoint {
  date: string;
  position: number;
  clicks: number;
  impressions: number;
}

async function get(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`${API}?${searchParams.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getSites(): Promise<Site[]> { return get('sites'); }
export async function getKeywords(site: string): Promise<Keyword[]> { return get('keywords', { site }); }
export async function getHistory(site: string, keyword: string, days = '30'): Promise<HistoryPoint[]> { return get('history', { site, keyword, days }); }
export async function getStats(): Promise<Stats> { return get('stats'); }

export async function triggerScan() {
  const res = await fetch(`${API}?endpoint=scan`, { method: 'POST', cache: 'no-store' });
  return res.json();
}
