import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.cctvDevice.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: 'name is required.' }, { status: 400 });
  const row = await prisma.cctvDevice.create({ data: { id: body.id || `cctv-${Date.now()}`, name: body.name, location: body.location || '', ipAddress: body.ipAddress || '', model: body.model || '', status: body.status || 'Online', lastService: body.lastService || '', streamUrl: body.streamUrl || '', username: body.username || '', password: body.password || '' } });
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const row = await prisma.cctvDevice.update({ where: { id: body.id }, data: { name: body.name, location: body.location, ipAddress: body.ipAddress, model: body.model, status: body.status, lastService: body.lastService, streamUrl: body.streamUrl, username: body.username, password: body.password } });
  return NextResponse.json(row);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  await prisma.cctvDevice.delete({ where: { id: body.id } });
  return NextResponse.json({ deleted: true });
}
