import { NextResponse } from 'next/server';
import https from 'node:https';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/pfsense-crypto';

function requestPfSense(url: URL, headers: Record<string, string>, insecure: boolean) {
  return new Promise<{ status: number; text: string }>((resolve, reject) => {
    const request = https.request(url, { method: 'GET', headers, rejectUnauthorized: !insecure }, response => {
      const chunks: Buffer[] = [];
      response.on('data', chunk => chunks.push(Buffer.from(chunk)));
      response.on('end', () => resolve({ status: response.statusCode || 500, text: Buffer.concat(chunks).toString('utf8') }));
    });
    request.setTimeout(8000, () => request.destroy(new Error('The operation was aborted due to timeout')));
    request.on('error', reject);
    request.end();
  });
}

export async function GET() {
  const saved = await prisma.pfSenseConnection.findUnique({ where: { id: 1 } });
  const baseUrl = saved?.baseUrl || process.env.PFSENSE_URL;
  let apiKey = process.env.PFSENSE_API_KEY;
  let apiSecret = process.env.PFSENSE_API_SECRET;
  let username: string | undefined;
  let password: string | undefined;
  if (saved) {
    try { if (saved.encryptedApiKey) apiKey = decrypt(saved.encryptedApiKey); if (saved.encryptedApiSecret) apiSecret = decrypt(saved.encryptedApiSecret); if (saved.encryptedUsername && saved.encryptedPassword) { username = decrypt(saved.encryptedUsername); password = decrypt(saved.encryptedPassword); } } catch { return NextResponse.json({ connected: false, configured: true, error: 'Saved pfSense credentials are invalid. Re-enter and save them.' }, { status: 200 }); }
  }
  const statusPath = saved?.statusPath || process.env.PFSENSE_STATUS_PATH || '/';

  if (!baseUrl || ((!apiKey || !apiSecret) && (!username || !password))) {
    return NextResponse.json({ connected: false, configured: false, error: 'pfSense integration is not configured.' }, { status: 503 });
  }

  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey && !apiSecret) headers['X-API-Key'] = apiKey;
    else if (apiSecret) { headers.Authorization = `Bearer ${apiKey}`; headers['X-API-Secret'] = apiSecret; }
    else if (username && password) headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    let response = await requestPfSense(new URL(statusPath, baseUrl), headers, process.env.PFSENSE_TLS_INSECURE === 'true');
    if (response.status === 404 && username && password) response = await requestPfSense(new URL('/', baseUrl), headers, process.env.PFSENSE_TLS_INSECURE === 'true');
    const text = response.text;
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 500) }; }
    if (response.status < 200 || response.status >= 300) return NextResponse.json({ connected: false, configured: true, status: response.status, data }, { status: 200 });
    const loginPage = typeof data === 'object' && data !== null && 'raw' in data && String((data as { raw?: string }).raw).includes('pfSense - Login');
    return NextResponse.json({ connected: true, authenticated: !loginPage, configured: true, checkedAt: new Date().toISOString(), error: loginPage ? 'pfSense WebGUI is reachable, but the normal web login cannot provide API data. Install/configure a pfSense API or NetFlow/syslog integration for dashboard and traffic data.' : undefined, data });
  } catch (error) {
    return NextResponse.json({ connected: false, configured: true, error: error instanceof Error ? error.message : 'pfSense request failed.' }, { status: 502 });
  }
}
