import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';

const domainPattern = /^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { target?: unknown };
    const domain = String(body.target || '').trim().toLowerCase();
    if (!domainPattern.test(domain)) throw new Error('Enter an authorized domain name.');
    const [addresses, mx, txt] = await Promise.all([
      dns.resolve4(domain).catch(() => [] as string[]),
      dns.resolveMx(domain).catch(() => [] as Array<{ exchange: string; priority: number }>),
      dns.resolveTxt(domain).catch(() => [] as string[][]),
    ]);
    const txtRecords = txt.flat();
    const spf = txtRecords.find(record => record.toLowerCase().startsWith('v=spf1')) || null;
    let dmarc: string[] = [];
    try { dmarc = await dns.resolveTxt(`_dmarc.${domain}`).then(records => records.flat()); } catch { dmarc = []; }
    const dmarcRecord = dmarc.find(record => record.toLowerCase().startsWith('v=dmarc1')) || null;
    return NextResponse.json({
      scannedAt: new Date().toISOString(),
      target: domain,
      addresses,
      mx,
      spf,
      dmarc: dmarcRecord,
      findings: [
        { name: 'A record', status: addresses.length ? 'pass' : 'problem', detail: addresses.length ? `${addresses.length} address(es) resolved.` : 'No A record resolved.', severity: addresses.length ? 'Info' : 'Medium' },
        { name: 'SPF policy', status: spf ? 'pass' : 'problem', detail: spf || 'No SPF TXT record found.', severity: spf ? 'Info' : 'Medium' },
        { name: 'DMARC policy', status: dmarcRecord ? 'pass' : 'problem', detail: dmarcRecord || 'No DMARC record found.', severity: dmarcRecord ? 'Info' : 'Medium' },
        { name: 'Mail exchange', status: mx.length ? 'pass' : 'problem', detail: mx.length ? `${mx.length} MX record(s) found.` : 'No MX record found.', severity: mx.length ? 'Info' : 'Low' },
      ],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'DNS check failed.' }, { status: 400 });
  }
}
