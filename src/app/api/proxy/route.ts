import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL || 'http://185.158.107.45:3055';

export async function GET(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get('endpoint') || 'sites';
  const params = new URLSearchParams();
  req.nextUrl.searchParams.forEach((v, k) => { if (k !== 'endpoint') params.set(k, v); });
  const url = `${BACKEND}/api/${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get('endpoint') || 'scan';
  const url = `${BACKEND}/api/${endpoint}`;
  try {
    const res = await fetch(url, { method: 'POST', cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 502 });
  }
}
