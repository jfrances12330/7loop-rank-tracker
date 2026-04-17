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

// ──────────────────────────────────────────────
// ROI Calculator
// ──────────────────────────────────────────────

export interface RoiKeyword {
  keyword: string;
  position: number | null;
  estimated_volume: number;
  current_clicks: number;
  top3_clicks: number;
  extra_clicks_top3: number;
  monthly_value: number;
}

export interface RoiResult {
  site_url: string;
  conversion_rate: number;
  client_value: number;
  total_monthly_value: number;
  total_yearly_value: number;
  keywords: RoiKeyword[];
}

export async function getRoi(site: string): Promise<RoiResult> {
  return get('roi', { site });
}

export async function setRoiConfig(site: string, conversion_rate: number, client_value: number) {
  const res = await fetch(`${API}?endpoint=roi/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site, conversion_rate, client_value })
  });
  return res.json();
}

// ──────────────────────────────────────────────
// Alerts
// ──────────────────────────────────────────────

export interface Alert {
  id: number;
  site_url: string;
  keyword: string | null;
  type: string;
  message: string;
  severity: string;
  created_at: string;
  read: number;
}

export interface AlertsResult {
  unread_count: number;
  alerts: Alert[];
}

export async function getAlerts(limit = 50, site?: string): Promise<AlertsResult> {
  const p: Record<string, string> = { limit: String(limit) };
  if (site) p.site = site;
  return get('alerts', p);
}

export async function markAlertRead(id?: number, all = false) {
  const res = await fetch(`${API}?endpoint=alerts/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(all ? { all: true } : { id })
  });
  return res.json();
}

// ──────────────────────────────────────────────
// Competitors summary
// ──────────────────────────────────────────────

export interface CompetitorEntry { domain: string; position: number }
export interface CompetitorsSummaryRow {
  keyword: string;
  your_position: number | null;
  ahead: CompetitorEntry[];
  behind: CompetitorEntry[];
}
export interface CompetitorsSummary {
  site_url: string;
  keywords: CompetitorsSummaryRow[];
}

export async function getCompetitorsSummary(site: string): Promise<CompetitorsSummary> {
  return get('competitors/summary', { site });
}

// ──────────────────────────────────────────────
// Client tokens
// ──────────────────────────────────────────────

export interface ClientToken {
  site_url: string;
  token: string;
  client_name: string | null;
  created_at: string;
}

export async function listClientTokens(): Promise<ClientToken[]> {
  return get('client-tokens');
}

export async function createClientToken(site: string, client_name: string) {
  const res = await fetch(`${API}?endpoint=client-tokens/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site, client_name })
  });
  return res.json();
}

export async function deleteClientToken(token: string) {
  const res = await fetch(`${API}?endpoint=client-tokens/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return res.json();
}

export interface ClientView {
  site_url: string;
  site_display: string;
  client_name: string | null;
  keywords_count: number;
  avg_position: number | null;
  total_clicks: number;
  roi_monthly: number;
  keywords: {
    keyword: string;
    position: number | null;
    change: number | null;
    clicks: number;
  }[];
}

export async function getClientView(token: string): Promise<ClientView> {
  return get(`client/${token}`);
}

// ──────────────────────────────────────────────
// Reviews
// ──────────────────────────────────────────────

export interface Review {
  id: number;
  platform: string;
  rating: number | null;
  author: string | null;
  text: string | null;
  date: string | null;
  created_at: string;
}

export interface ReviewsResult {
  site_url: string;
  avg_rating: number | null;
  total: number;
  distribution: Record<string, number>;
  has_recent_negative: boolean;
  reviews: Review[];
}

export async function getReviews(site: string): Promise<ReviewsResult> {
  return get('reviews', { site });
}

export async function addReview(site: string, rating: number, author: string, text: string) {
  const res = await fetch(`${API}?endpoint=reviews/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site, rating, author, text, date: new Date().toISOString().slice(0, 10) })
  });
  return res.json();
}

// ──────────────────────────────────────────────
// Tasks
// ──────────────────────────────────────────────

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  completed_at: string | null;
}

export interface TasksResult {
  total: number;
  completed: number;
  tasks: Task[];
}

export async function getTasks(site: string): Promise<TasksResult> {
  return get('tasks', { site });
}

export async function addTask(site: string, title: string, description: string, priority: string) {
  const res = await fetch(`${API}?endpoint=tasks/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site, title, description, priority })
  });
  return res.json();
}

export async function updateTask(id: number, status: string) {
  const res = await fetch(`${API}?endpoint=tasks/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });
  return res.json();
}

export async function deleteTask(id: number) {
  const res = await fetch(`${API}?endpoint=tasks/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return res.json();
}
