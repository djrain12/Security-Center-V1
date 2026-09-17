import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const servers = await prisma.monitoredServer.findMany({ orderBy: { name: 'asc' }, include: { healthChecks: { orderBy: { checkedAt: 'desc' }, take: 5 } } });
  return NextResponse.json(servers.map(server => ({ ...server, healthChecks: server.healthChecks.map(check => ({ ...check, id: check.id.toString() })) })));
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.host || !body.serverType) return NextResponse.json({ error: 'Name, host or IP, and server type are required.' }, { status: 400 });
  const server = await prisma.monitoredServer.create({ data: { name: body.name, host: body.host, serverType: body.serverType, environment: body.environment || 'Production' } });
  return NextResponse.json(server, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id || !body.name || !body.host || !body.serverType) return NextResponse.json({ error: 'Id, name, host, and server type are required.' }, { status: 400 });
  const server = await prisma.monitoredServer.update({ where: { id: Number(body.id) }, data: { name: body.name, host: body.host, serverType: body.serverType, environment: body.environment || 'Production' } });
  return NextResponse.json(server);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Server id is required.' }, { status: 400 });
  await prisma.monitoredServer.delete({ where: { id: Number(body.id) } });
  return NextResponse.json({ deleted: true });
}
