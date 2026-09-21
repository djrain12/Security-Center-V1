import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { writeAuditLog } from '@/lib/audit';

// Generic per-module record store. Query with ?module=<name>.
export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const moduleName = searchParams.get('module') || '';
  if (!moduleName) return NextResponse.json({ error: 'module is required.' }, { status: 400 });
  const records = await prisma.moduleRecord.findMany({ where: { module: moduleName }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await request.json();
  if (!body.module || !body.title) return NextResponse.json({ error: 'module and title are required.' }, { status: 400 });
  const record = await prisma.moduleRecord.upsert({
    where: { id: body.id || `${body.module}-${Date.now()}` },
    update: {
      module: body.module,
      title: body.title,
      tag: body.tag || 'Info',
      meta: body.meta || '',
      detail: body.detail || '',
      attachmentName: body.attachmentName || null,
      attachmentType: body.attachmentType || null,
      attachmentData: body.attachmentData || null,
    },
    create: {
      id: body.id || `${body.module}-${Date.now()}`,
      module: body.module,
      title: body.title,
      tag: body.tag || 'Info',
      meta: body.meta || '',
      detail: body.detail || '',
      attachmentName: body.attachmentName || null,
      attachmentType: body.attachmentType || null,
      attachmentData: body.attachmentData || null,
    },
  });
  await writeAuditLog({ actorId: session.userId, action: 'CREATE_RECORD', resourceType: body.module, resourceId: record.id, metadata: { title: record.title } });
  return NextResponse.json(record, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const current = await prisma.moduleRecord.findUnique({ where: { id: body.id } });
  if (!current) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });
  const changes = { title: body.title, tag: body.tag, meta: body.meta, detail: body.detail, attachmentName: body.attachmentName, attachmentType: body.attachmentType, attachmentData: body.attachmentData };
  if (session.accessLevel !== 'ADMIN' && session.accessLevel !== 'MASTER_ADMIN' && session.accessLevel !== 'SUPER_MASTER_ADMIN') {
    if (!body.reason || String(body.reason).trim().length < 5) return NextResponse.json({ error: 'An edit reason is required.' }, { status: 400 });
    const requestRow = await prisma.recordEditRequest.create({ data: { recordId: current.id, module: current.module, requestedById: session.userId, reason: String(body.reason).trim(), changes } });
    await writeAuditLog({ actorId: session.userId, action: 'REQUEST_RECORD_EDIT', resourceType: current.module, resourceId: current.id, metadata: { requestId: requestRow.id, reason: requestRow.reason, changes } });
    return NextResponse.json({ approvalRequired: true, requestId: requestRow.id }, { status: 202 });
  }
  const record = await prisma.moduleRecord.update({ where: { id: body.id }, data: changes });
  await writeAuditLog({ actorId: session.userId, action: 'EDIT_RECORD', resourceType: current.module, resourceId: current.id, metadata: { changes } });
  return NextResponse.json(record);
}

export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  await prisma.moduleRecord.delete({ where: { id: body.id } });
  await writeAuditLog({ actorId: session.userId, action: 'DELETE_RECORD', resourceType: body.module || 'ModuleRecord', resourceId: body.id });
  return NextResponse.json({ deleted: true });
}
