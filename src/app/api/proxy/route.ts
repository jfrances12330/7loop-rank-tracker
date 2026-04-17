import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL || 'http://185.158.107.45:3055';

export async function GET(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get('endpoint') || 'sites';
  const params = new URLSearchParams();
  req.nextUrl.searchParams.forEach((v, k) => { if (k !== 'endpoint') params.set(k, v); });
  const url = `${BACKEND}/api/${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const buf = await res.arrayBuffer();
      return new NextResponse(buf, {
        status: res.status,
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Content-Disposition': res.headers.get('content-disposition') || 'inline',
        },
      });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get('endpoint') || 'scan';
  const url = `${BACKEND}/api/${endpoint}`;
  try {
    let body: string | undefined;
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try { body = JSON.stringify(await req.json()); } catch { /* empty body is fine */ }
    }
    const res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      ...(body ? { body } : {}),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 502 });
  }
}
