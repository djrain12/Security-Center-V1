import { NextResponse } from 'next/server';
import https from 'node:https';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/pfsense-crypto';

function request(url: URL, headers: Record<string, string>) {
  return new Promise<{ status: number; text: string }>((resolve, reject) => {
    const request = https.request(url, { method: 'GET', headers, rejectUnauthorized: process.env.PFSENSE_TLS_INSECURE !== 'true' }, response => {
      const chunks: Buffer[] = [];
      response.on('data', chunk => chunks.push(Buffer.from(chunk)));
      response.on('end', () => resolve({ status: response.statusCode || 500, text: Buffer.concat(chunks).toString('utf8') }));
    });
    request.setTimeout(8000, () => request.destroy(new Error('pfSense interface request timed out')));
    request.on('error', reject);
    request.end();
  });
}

export async function GET() {
  const saved = await prisma.pfSenseConnection.findUnique({ where: { id: 1 } });
  if (!saved?.baseUrl || !saved.encryptedApiKey) return NextResponse.json({ interfaces: [], error: 'pfSense credentials are not configured.' }, { status: 200 });
  const apiKey = decrypt(saved.encryptedApiKey);
  const response = await request(new URL('/api/v2/interface', saved.baseUrl), { Accept: 'application/json', 'X-API-Key': apiKey });
  let payload: unknown = null;
  try { payload = response.text ? JSON.parse(response.text) : null; } catch { payload = null; }
  const raw = typeof payload === 'object' && payload !== null && 'data' in payload ? (payload as { data?: unknown }).data : payload;
  const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? Object.values(raw) : [];
  const interfaces = list.map(item => { const entry = item as Record<string, unknown>; return String(entry.descr || entry.name || entry.if || entry.interface || '').trim(); }).filter(Boolean);
  return NextResponse.json({ interfaces: [...new Set(interfaces)], status: response.status });
}