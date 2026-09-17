import { NextResponse } from 'next/server';
import net from 'node:net';
import dns from 'node:dns/promises';

function probe(host: string, port: number, timeout = 1500) {
  return new Promise<{ open: boolean; responseMs: number | null }>(resolve => {
    const started = Date.now();
    const socket = new net.Socket();
    let finished = false;
    const done = (open: boolean) => { if (!finished) { finished = true; socket.destroy(); resolve({ open, responseMs: open ? Date.now() - started : null }); } };
    socket.setTimeout(timeout);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });
}

const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const domainPattern = /^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function cleanList(value: unknown, max: number) {
  if (!Array.isArray(value)) return [] as string[];
  return Array.from(new Set(value.map(item => String(item).trim()).filter(Boolean))).slice(0, max);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ips = cleanList(body.ips, 64).filter(ip => { const match = ip.match(ipPattern); return match && match.slice(1).every(part => Number(part) <= 255); });
    const ports = cleanList(body.ports, 32).map(Number).filter(port => Number.isInteger(port) && port > 0 && port <= 65535);
    const domains = cleanList(body.domains, 32).filter(domain => domainPattern.test(domain));
    const emails = cleanList(body.emails, 64);
    if (ips.length + domains.length + emails.length === 0) throw new Error('Provide at least one valid IP, domain, or email target.');
    if (ports.length === 0 && ips.length > 0) throw new Error('Provide at least one valid port (1-65535).');

    const started = Date.now();

    // IP x Port matrix scan
    const portResults: Array<{ ip: string; port: number; status: string; responseMs: number | null }> = [];
    for (const ip of ips) {
      const checks = await Promise.all(ports.map(async port => ({ ip, port, ...(await probe(ip, port)) })));
      portResults.push(...checks.map(check => ({ ip: check.ip, port: check.port, status: check.open ? 'open' : 'closed', responseMs: check.responseMs })));
    }

    // Domain resolution + common web ports
    const domainResults: Array<{ domain: string; resolved: boolean; addresses: string[]; http: string; https: string; error?: string }> = [];
    for (const domain of domains) {
      try {
        const addresses = await dns.resolve4(domain);
        const [http, https] = await Promise.all([probe(domain, 80, 2000), probe(domain, 443, 2000)]);
        domainResults.push({ domain, resolved: true, addresses, http: http.open ? 'open' : 'closed', https: https.open ? 'open' : 'closed' });
      } catch (error) {
        domainResults.push({ domain, resolved: false, addresses: [], http: 'unknown', https: 'unknown', error: error instanceof Error ? error.message : 'Resolution failed' });
      }
    }

    // Email syntax + MX record validation
    const emailResults: Array<{ email: string; syntax: string; domain: string; mx: string; status: string }> = [];
    for (const email of emails) {
      const syntax = emailPattern.test(email);
      const domain = email.split('@')[1] || '';
      let mx = 'unknown';
      if (syntax && domainPattern.test(domain)) {
        try { mx = (await dns.resolveMx(domain)).length > 0 ? 'found' : 'none'; } catch { mx = 'none'; }
      } else if (syntax) { mx = 'invalid domain'; }
      emailResults.push({ email, syntax: syntax ? 'valid' : 'invalid', domain, mx, status: syntax && mx === 'found' ? 'deliverable' : syntax ? 'risky' : 'invalid' });
    }

    return NextResponse.json({
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: {
        ipsScanned: ips.length,
        portsPerIp: ports.length,
        openPorts: portResults.filter(result => result.status === 'open').length,
        domainsResolved: domainResults.filter(result => result.resolved).length,
        emailsChecked: emailResults.length,
        deliverableEmails: emailResults.filter(result => result.status === 'deliverable').length,
      },
      portResults,
      domainResults,
      emailResults,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'VAPT scan failed.' }, { status: 400 });
  }
}
