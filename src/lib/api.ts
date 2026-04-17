const API = '/api/proxy';

export interface Site {
  site_url: string;
  slug: string;
  keyword_count: number;
  avg_position: number | null;
  prev_avg_position: number | null;
  trend: number | null;
}

export interface Stats {
  total_keywords: number;
  total_sites: number;
  avg_position: number;
  improved: number;
  declined: number;
  improvements?: number;
  drops?: number;
  stable?: number;
  last_scan?: string;
}

export type Device = 'all' | 'mobile' | 'desktop';

export interface Keyword {
  id: number;
  keyword: string;
  target_url: string | null;
  position: number | null;
  prev_position: number | null;
  change: number | null;
  clicks: number;
  impressions: number;
  ctr: number;
  priority: string;
  scan_date: string;
  device: Device;
  estimated_volume: number;
  sparkline: number[];
}

export interface HistoryPoint {
  date: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr?: number;
  device?: Device;
}

export interface Competitor {
  position: number;
  domain: string;
  title: string | null;
  url: string | null;
  is_site: boolean;
}

export interface CompetitorsResult {
  scan_date: string | null;
  competitors: Competitor[];
  site_position: number | null;
}

export interface GridPoint {
  zone_name: string;
  lat: number;
  lon: number;
  position: number | null;
  business_name: string | null;
}

export interface GridCity {
  city: string;
  scan_date: string | null;
  points: GridPoint[];
}

export interface LocalKeyword {
  id: number;
  site_url: string;
  keyword: string;
  city: string;
  priority: string;
  maps_position: number | null;
  business_name: string | null;
  rating: number | null;
  reviews: number | null;
  scan_date: string | null;
}

async function get(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`${API}?${searchParams.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getSites(): Promise<Site[]> { return get('sites'); }

export async function getKeywords(site: string, device: Device = 'all'): Promise<Keyword[]> {
  return get('keywords', { site, device });
}

export async function getHistory(site: string, keyword: string, days = '30', device: Device = 'all'): Promise<HistoryPoint[]> {
  return get('history', { site, keyword, days, device });
}

export async function getStats(): Promise<Stats> { return get('stats'); }

export async function getCompetitors(site: string, keyword: string): Promise<CompetitorsResult> {
  return get('competitors', { site, keyword });
}

export async function getLocalGrid(site: string, keyword: string, city?: string): Promise<{ cities: GridCity[] }> {
  const params: Record<string, string> = { site, keyword };
  if (city) params.city = city;
  return get('local-grid', params);
}

export async function getLocalKeywords(site?: string): Promise<LocalKeyword[]> {
  const params: Record<string, string> = {};
  if (site) params.site = site;
  return get('local-keywords', params);
}

export interface ScanResults {
  gsc: { scanned: number; changes: number; note?: string };
  maps: { scanned: number; changes: number; note?: string };
  organic: { scanned: number; note?: string };
}

export interface ScanStatus {
  status: 'idle' | 'scanning' | 'completed' | 'error';
  progress?: string;
  phase?: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  results?: ScanResults;
  message?: string;
}

export async function triggerScan(): Promise<ScanStatus> {
  const res = await fetch(`${API}?endpoint=scan`, { method: 'POST', cache: 'no-store' });
  return res.json();
}

export async function getScanStatus(): Promise<ScanStatus> {
  return get('scan-status');
}

export async function addKeyword(site: string, keyword: string, priority: string = 'medium') {
  const res = await fetch(`${API}?endpoint=keywords/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site, keyword, priority })
  });
  return res.json();
}

export async function removeKeyword(site: string, keyword: string) {
  const res = await fetch(`${API}?endpoint=keywords/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site, keyword })
  });
  return res.json();
}
