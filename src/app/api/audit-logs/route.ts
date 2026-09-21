import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const from = params.get('from');
  const to = params.get('to');
  const query = params.get('q')?.trim();
  const where = {
    ...(session.accessLevel === 'SUPER_MASTER_ADMIN' ? {} : { actor: { companyId: session.companyId || -1 } }),
    ...(from || to ? { createdAt: { ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}), ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}) } } : {}),
    ...(query ? { OR: [{ action: { contains: query } }, { resourceType: { contains: query } }, { resourceId: { contains: query } }] } : {}),
  };
  const logs = await prisma.auditLog.findMany({ where, include: { actor: { select: { fullName: true, email: true, companyId: true } } }, orderBy: { createdAt: 'desc' }, take: 500 });
  return NextResponse.json(logs);
}
