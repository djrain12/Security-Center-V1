import { NextResponse } from 'next/server';
import net from 'node:net';
import { prisma } from '@/lib/prisma';

function ipToNumber(ip: string) { return ip.split('.').reduce((value, part) => value * 256 + Number(part), 0); }
function numberToIp(value: number) { return [24, 16, 8, 0].map(shift => (value >>> shift) & 255).join('.'); }
function expandRange(cidr: string) {
  const [base, bitsText] = cidr.split('/');
  const bits = Number(bitsText);
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(base) || !Number.isInteger(bits) || bits < 16 || bits > 30) throw new Error('Use a private CIDR between /16 and /30.');
  const baseNumber = ipToNumber(base) >>> 0;
  const size = 2 ** (32 - bits);
  if (size > 1024) throw new Error('Scan ranges are limited to 1,024 addresses.');
  const network = (baseNumber & (~(size - 1))) >>> 0;
  return Array.from({ length: size }, (_, index) => numberToIp((network + index) >>> 0)).slice(1, -1);
}
function probe(ip: string, port: number) { return new Promise<number | null>(resolve => { const started = Date.now(); const socket = new net.Socket(); let finished = false; const done = (result: number | null) => { if (!finished) { finished = true; socket.destroy(); resolve(result); } }; socket.setTimeout(500); socket.once('connect', () => done(Date.now() - started)); socket.once('timeout', () => done(null)); socket.once('error', () => done(null)); socket.connect(port, ip); }); }

export async function POST(request: Request) {
  try {
    const { cidr, ports = [80, 443, 445, 3389] } = await request.json();
    const ips = expandRange(String(cidr || ''));
    const results = await Promise.all(ips.map(async ip => { for (const port of ports.slice(0, 4)) { const responseMs = await probe(ip, Number(port)); if (responseMs !== null) return { ipAddress: ip, status: 'online', responseMs, port }; } return { ipAddress: ip, status: 'offline', responseMs: null }; }));
    const zone = cidr === '192.168.25.0/24' ? 'VLAN 25 · Office' : cidr === '192.168.26.0/24' ? 'VLAN 26 · Office' : cidr === '192.168.27.0/24' ? 'VLAN 27 · Management' : 'Network scan';
    const vlanId = cidr.startsWith('192.168.25.') ? 25 : cidr.startsWith('192.168.26.') ? 26 : cidr.startsWith('192.168.27.') ? 27 : null;
    const onlineDevices = results.filter(result => result.status === 'online').map(device => ({ ...device, deviceType: device.port === 3389 || device.port === 445 ? 'pc' : 'unknown' }));
    await Promise.all(onlineDevices.map(device => prisma.networkDevice.upsert({ where: { ipAddress: device.ipAddress }, update: { status: device.status, responseMs: device.responseMs, lastScannedAt: new Date(), vlanId, zoneName: zone, deviceType: device.deviceType }, create: { ipAddress: device.ipAddress, status: device.status, responseMs: device.responseMs, lastScannedAt: new Date(), vlanId, zoneName: zone, deviceType: device.deviceType } })));
    return NextResponse.json({ cidr, zone, vlanId, scanned: ips.length, online: onlineDevices.length, devices: onlineDevices });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Network scan failed.' }, { status: 400 }); }
}
