import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const rows = await prisma.recordEditRequest.findMany({
    where: session.accessLevel === 'SUPER_MASTER_ADMIN' || session.accessLevel === 'MASTER_ADMIN' || session.accessLevel === 'ADMIN'
      ? { status: 'PENDING' }
      : { requestedById: session.userId },
    include: { requestedBy: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(rows);
}

export async function PATCH(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!['ADMIN', 'MASTER_ADMIN', 'SUPER_MASTER_ADMIN'].includes(session.accessLevel)) return NextResponse.json({ error: 'Admin approval is required.' }, { status: 403 });
  const body = await request.json() as { id?: number; decision?: string };
  if (!body.id || !['APPROVE', 'REJECT'].includes(body.decision || '')) return NextResponse.json({ error: 'Request id and decision are required.' }, { status: 400 });
  const editRequest = await prisma.recordEditRequest.findUnique({ where: { id: Number(body.id) } });
  if (!editRequest || editRequest.status !== 'PENDING') return NextResponse.json({ error: 'Pending edit request not found.' }, { status: 404 });
  const status = body.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  if (status === 'APPROVED') await prisma.moduleRecord.update({ where: { id: editRequest.recordId }, data: editRequest.changes as Record<string, string | null> });
  const updated = await prisma.recordEditRequest.update({ where: { id: editRequest.id }, data: { status, reviewedById: session.userId, reviewedAt: new Date() } });
  await writeAuditLog({ actorId: session.userId, action: status === 'APPROVED' ? 'APPROVE_RECORD_EDIT' : 'REJECT_RECORD_EDIT', resourceType: editRequest.module, resourceId: editRequest.recordId, metadata: { requestId: editRequest.id, reason: editRequest.reason } });
  return NextResponse.json(updated);
}
