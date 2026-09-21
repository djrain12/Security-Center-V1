import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  const rows = await prisma.libraryDocument.findMany({ where: session?.accessLevel === 'MASTER_ADMIN' ? undefined : { companyId: session?.companyId || -1 }, orderBy: { uploadedAt: 'desc' } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: 'name is required.' }, { status: 400 });
  const row = await prisma.libraryDocument.create({ data: { id: body.id || `doc-${Date.now()}`, companyId: session?.accessLevel === 'MASTER_ADMIN' && body.companyId ? Number(body.companyId) : session?.companyId || null, name: body.name, category: body.category || 'Policy', framework: body.framework || 'General', status: body.status || 'Draft', size: body.size || '—', uploadedAt: body.uploadedAt || new Date().toISOString().slice(0, 10), dataUrl: body.dataUrl || null } });
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = getSessionFromRequest(request);
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const existing = await prisma.libraryDocument.findUnique({ where: { id: body.id } });
  if (!existing || (session?.accessLevel !== 'MASTER_ADMIN' && existing.companyId !== session?.companyId)) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
  const row = await prisma.libraryDocument.update({ where: { id: body.id }, data: { name: body.name, category: body.category, framework: body.framework, status: body.status, size: body.size, uploadedAt: body.uploadedAt, dataUrl: body.dataUrl } });
  return NextResponse.json(row);
}

export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request);
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const existing = await prisma.libraryDocument.findUnique({ where: { id: body.id } });
  if (!existing || (session?.accessLevel !== 'MASTER_ADMIN' && existing.companyId !== session?.companyId)) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
  await prisma.libraryDocument.delete({ where: { id: body.id } });
  return NextResponse.json({ deleted: true });
}
