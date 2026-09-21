import { NextResponse } from 'next/server';
import tls from 'node:tls';

const targetPattern = /^(localhost|[a-zA-Z0-9.-]+|\d{1,3}(?:\.\d{1,3}){3})(?::\d{1,5})?$/;

function checkTls(host: string, port: number) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false, timeout: 8000 }, () => {
      const certificate = socket.getPeerCertificate();
      const protocol = socket.getProtocol();
      const authorized = socket.authorized;
      const authorizationError = socket.authorizationError || null;
      socket.end();
      resolve({ host, port, protocol, authorized, authorizationError, certificate: { subject: certificate.subject || null, issuer: certificate.issuer || null, validFrom: certificate.valid_from || null, validTo: certificate.valid_to || null, subjectAltName: certificate.subjectaltname || null } });
    });
    socket.once('timeout', () => { socket.destroy(); reject(new Error('TLS connection timed out.')); });
    socket.once('error', error => reject(error));
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { target?: unknown };
    const rawTarget = String(body.target || '').trim();
    if (!rawTarget || !targetPattern.test(rawTarget)) throw new Error('Enter an authorized hostname or IP, optionally with a port.');
    const [host, portText] = rawTarget.split(':');
    const port = portText ? Number(portText) : 443;
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Port must be between 1 and 65535.');
    const checked = await checkTls(host, port);
    const certificate = checked.certificate as { validTo?: string | null };
    const expiresAt = certificate.validTo ? new Date(certificate.validTo) : null;
    const daysUntilExpiry = expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 86400000) : null;
    return NextResponse.json({
      scannedAt: new Date().toISOString(),
      target: rawTarget,
      ...checked,
      findings: [
        { name: 'Certificate trust', status: checked.authorized ? 'pass' : 'problem', detail: checked.authorized ? 'Certificate is trusted by the runtime.' : `Certificate is not trusted: ${checked.authorizationError || 'unknown reason'}.`, severity: checked.authorized ? 'Info' : 'High' },
        { name: 'Certificate expiry', status: daysUntilExpiry !== null && daysUntilExpiry >= 30 ? 'pass' : 'problem', detail: daysUntilExpiry === null ? 'Certificate expiry could not be determined.' : `${daysUntilExpiry} day(s) until expiry.`, severity: daysUntilExpiry !== null && daysUntilExpiry >= 30 ? 'Info' : 'Medium' },
        { name: 'Negotiated protocol', status: checked.protocol && !['TLSv1', 'TLSv1.1'].includes(String(checked.protocol)) ? 'pass' : 'problem', detail: `Negotiated ${checked.protocol || 'unknown'}.`, severity: checked.protocol && !['TLSv1', 'TLSv1.1'].includes(String(checked.protocol)) ? 'Info' : 'High' },
      ],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'TLS check failed.' }, { status: 400 });
  }
}
