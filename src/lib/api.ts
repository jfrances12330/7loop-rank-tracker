const API = '/api/proxy';

async function get(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`${API}?${searchParams.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getSites() { return get('sites'); }
export async function getKeywords(site: string) { return get('keywords', { site }); }
export async function getHistory(site: string, keyword: string, days = '30') { return get('history', { site, keyword, days }); }
export async function getStats() { return get('stats'); }

export async function triggerScan() {
  const res = await fetch(`${API}?endpoint=scan`, { method: 'POST', cache: 'no-store' });
  return res.json();
}
