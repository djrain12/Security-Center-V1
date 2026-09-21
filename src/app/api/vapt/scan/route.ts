import { NextResponse } from 'next/server';
import net from 'node:net';
import tls from 'node:tls';
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

function readCertificate(host: string, port = 443) {
  const pickValue = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] || '-';
    return value || '-';
  };

  return new Promise<{ host: string; port: number; status: string; subject: string; issuer: string; validTo: string; expired: boolean | null }>(resolve => {
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false, timeout: 2500 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      const validTo = cert?.valid_to || '';
      const expired = validTo ? new Date(validTo).getTime() < Date.now() : null;
      const subject = pickValue(cert?.subject?.CN ?? cert?.subject?.O);
      const issuer = pickValue(cert?.issuer?.O ?? cert?.issuer?.CN);
      resolve({
        host,
        port,
        status: cert?.fingerprint ? 'present' : 'none',
        subject,
        issuer,
        validTo: validTo || '-',
        expired,
      });
    });
    socket.once('error', () => resolve({ host, port, status: 'unreachable', subject: '-', issuer: '-', validTo: '-', expired: null }));
    socket.once('timeout', () => { socket.destroy(); resolve({ host, port, status: 'timeout', subject: '-', issuer: '-', validTo: '-', expired: null }); });
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
    const body = (await request.json()) as Record<string, unknown>;
    const normalizeStringList = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
      if (typeof value === 'string') return [value.trim()].filter(Boolean);
      return [];
    };

    const ips = normalizeStringList(body.ips).filter((ip): ip is string => {
      const match = ip.match(ipPattern);
      return Boolean(match && match.slice(1).every(part => Number(part) <= 255));
    });
    const ports = normalizeStringList(body.ports)
      .map(value => Number(value))
      .filter(port => Number.isInteger(port) && port > 0 && port <= 65535);
    const domains = normalizeStringList(body.domains).filter(domain => domainPattern.test(domain));
    const emails = normalizeStringList(body.emails);
    const tools = normalizeStringList(body.tools);
    const runPorts = tools.length === 0 || tools.includes('ports');
    const runWeb = tools.length === 0 || tools.includes('web');
    const runTls = tools.length === 0 || tools.includes('tls');
    const runDns = tools.length === 0 || tools.includes('dns');
    if (ips.length + domains.length + emails.length === 0) throw new Error('Provide at least one valid IP, domain, or email target.');
    if (runPorts && ports.length === 0 && ips.length > 0) throw new Error('Provide at least one valid port (1-65535).');

    const started = Date.now();

    // IP x Port matrix scan
    const portResults: Array<{ ip: string; port: number; status: string; responseMs: number | null }> = [];
    if (runPorts) {
      for (const ip of ips) {
        const checks = await Promise.all(ports.map(async port => ({ ip, port, ...(await probe(ip, port)) })));
        portResults.push(...checks.map(check => ({ ip: check.ip, port: check.port, status: check.open ? 'open' : 'closed', responseMs: check.responseMs })));
      }
    }

    // Domain resolution + common web ports
    const domainResults: Array<{ domain: string; resolved: boolean; addresses: string[]; http: string; https: string; error?: string }> = [];
    if (runDns || runWeb) {
    for (const domain of domains) {
      try {
        const addresses = await dns.resolve4(domain);
        const [http, https] = await Promise.all([probe(domain, 80, 2000), probe(domain, 443, 2000)]);
        domainResults.push({ domain, resolved: true, addresses, http: http.open ? 'open' : 'closed', https: https.open ? 'open' : 'closed' });
      } catch (error) {
        domainResults.push({ domain, resolved: false, addresses: [], http: 'unknown', https: 'unknown', error: error instanceof Error ? error.message : 'Resolution failed' });
      }
    }
    }

    const tlsTargets = Array.from(new Set([
      ...portResults.filter(result => result.status === 'open' && (result.port === 443 || result.port === 8443)).map(result => ({ host: result.ip, port: result.port })),
      ...domainResults.filter(result => result.https === 'open').map(result => ({ host: result.domain, port: 443 })),
    ].map(target => `${target.host}:${target.port}`))).map(value => {
      const [host, port] = value.split(':');
      return { host, port: Number(port) };
    });
    const tlsResults = runTls ? await Promise.all(tlsTargets.slice(0, 32).map(target => readCertificate(target.host, target.port))) : [];

    // Email syntax + MX record validation
    const emailResults: Array<{ email: string; syntax: string; domain: string; mx: string; status: string }> = [];
    if (runDns) {
    for (const email of emails) {
      const syntax = emailPattern.test(email);
      const domain = email.split('@')[1] || '';
      let mx = 'unknown';
      if (syntax && domainPattern.test(domain)) {
        try { mx = (await dns.resolveMx(domain)).length > 0 ? 'found' : 'none'; } catch { mx = 'none'; }
      } else if (syntax) { mx = 'invalid domain'; }
      emailResults.push({ email, syntax: syntax ? 'valid' : 'invalid', domain, mx, status: syntax && mx === 'found' ? 'deliverable' : syntax ? 'risky' : 'invalid' });
    }
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
        tlsReviewed: tlsResults.length,
        expiredCerts: tlsResults.filter(result => result.expired).length,
      },
      portResults,
      domainResults,
      emailResults,
      tlsResults,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'VAPT scan failed.' }, { status: 400 });
  }
}
