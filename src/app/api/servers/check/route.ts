import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { id } = await request.json();
  const server = await prisma.monitoredServer.findUnique({ where: { id: Number(id) } });
  if (!server) return NextResponse.json({ error: 'Server not found.' }, { status: 404 });
  const started = Date.now();
  let status = 'offline';
  let details = 'No response received.';
  try {
    const target = /^https?:\/\//i.test(server.host) ? server.host : `http://${server.host}`;
    const response = await fetch(target, { method: 'HEAD', signal: AbortSignal.timeout(5000), cache: 'no-store' });
    status = response.ok ? 'online' : 'degraded';
    details = `HTTP ${response.status}`;
  } catch (error) {
    details = error instanceof Error ? error.message.slice(0, 180) : 'Health check failed.';
  }
  const responseMs = Date.now() - started;
  const checked = await prisma.serverHealthCheck.create({ data: { serverId: server.id, status, responseMs, details } });
  await prisma.monitoredServer.update({ where: { id: server.id }, data: { status, responseMs, lastCheckedAt: checked.checkedAt } });
  return NextResponse.json({ ...server, status, responseMs, lastCheckedAt: checked.checkedAt, details });
}
