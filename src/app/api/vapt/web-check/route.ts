import { NextResponse } from 'next/server';

const allowedTarget = /^(https?:\/\/)?(localhost|[a-zA-Z0-9.-]+|\d{1,3}(?:\.\d{1,3}){3})(?::\d{1,5})?(?:\/.*)?$/;
const securityHeaders = [
  ['strict-transport-security', 'HSTS'],
  ['content-security-policy', 'Content Security Policy'],
  ['x-content-type-options', 'X-Content-Type-Options'],
  ['x-frame-options', 'X-Frame-Options'],
  ['referrer-policy', 'Referrer-Policy'],
] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { target?: unknown };
    const rawTarget = String(body.target || '').trim();
    if (!rawTarget || !allowedTarget.test(rawTarget)) throw new Error('Enter an authorized hostname, IP, or URL.');
    const url = rawTarget.startsWith('http://') || rawTarget.startsWith('https://') ? rawTarget : `https://${rawTarget}`;
    const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(8000) });
    const headers = Object.fromEntries(response.headers.entries());
    const findings = securityHeaders.map(([header, label]) => ({
      header: label,
      present: Boolean(response.headers.get(header)),
      value: response.headers.get(header) || null,
      severity: response.headers.get(header) ? 'Info' : header === 'strict-transport-security' ? 'High' : 'Medium',
    }));
    return NextResponse.json({
      scannedAt: new Date().toISOString(),
      target: url,
      status: response.status,
      redirectedTo: response.headers.get('location'),
      headers,
      findings,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Web security check failed.' }, { status: 400 });
  }
}
