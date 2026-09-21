import { NextResponse } from 'next/server';

function isPrivateHost(hostname: string) {
  if (hostname === 'localhost' || hostname.endsWith('.local')) return true;
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const [a, b] = match.slice(1).map(Number);
  return a === 10 || a === 127 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const baseUrl = String(body.baseUrl || '').trim();
    const apiKey = String(body.apiKey || '').trim();
    if (!title) return NextResponse.json({ error: 'Menu title is required.' }, { status: 400 });
    if (!baseUrl) return NextResponse.json({ ok: true, title, status: 'saved', detail: 'Module saved. Add a base URL to test connectivity.' });

    let parsed: URL;
    try { parsed = new URL(baseUrl); } catch { return NextResponse.json({ error: 'Base URL must be a valid http(s) address.' }, { status: 400 }); }
    if (!['http:', 'https:'].includes(parsed.protocol)) return NextResponse.json({ error: 'Only HTTP or HTTPS URLs are allowed.' }, { status: 400 });
    if (parsed.protocol === 'http:' && !isPrivateHost(parsed.hostname)) return NextResponse.json({ error: 'HTTP is only allowed for private/internal hosts.' }, { status: 400 });

    const headers: Record<string, string> = { Accept: 'application/json, text/plain, */*' };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const started = Date.now();
    const response = await fetch(parsed.toString(), { method: 'GET', headers, signal: AbortSignal.timeout(8000), cache: 'no-store' });
    const text = await response.text();
    let preview = text.slice(0, 400);
    try { preview = JSON.stringify(JSON.parse(text), null, 2).slice(0, 400); } catch { /* keep raw */ }
    return NextResponse.json({
      ok: response.ok,
      title,
      status: response.ok ? 'reachable' : 'error',
      httpStatus: response.status,
      durationMs: Date.now() - started,
      preview,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Connection test failed.' }, { status: 400 });
  }
}
