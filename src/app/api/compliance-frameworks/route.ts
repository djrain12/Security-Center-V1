import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const platformAdmin = session.accessLevel === 'SUPER_MASTER_ADMIN' || (session.accessLevel === 'MASTER_ADMIN' && !session.companyId);
  const companyWhere = platformAdmin ? {} : { companyId: session.companyId || -1 };
  const frameworks = await prisma.complianceFramework.findMany({ where: companyWhere, orderBy: { name: 'asc' } });
  const documents = await prisma.libraryDocument.findMany({ where: companyWhere, select: { framework: true, status: true, companyId: true } });
  return NextResponse.json(frameworks.map(framework => {
    const matching = documents.filter(document => document.companyId === framework.companyId && (document.framework === framework.name || document.framework === 'General'));
    const readinessPercent = matching.length === 0 ? 0 : Math.round(matching.reduce((sum, document) => sum + (document.status === 'Approved' ? 100 : document.status === 'Under review' ? 60 : 30), 0) / matching.length);
    return { ...framework, readinessPercent };
  }));
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await request.json() as { name?: unknown; companyId?: unknown; nextReviewDate?: unknown };
  const name = String(body.name || '').trim();
  if (!name) return NextResponse.json({ error: 'Framework name is required.' }, { status: 400 });
  const platformAdmin = session.accessLevel === 'SUPER_MASTER_ADMIN' || (session.accessLevel === 'MASTER_ADMIN' && !session.companyId);
  const companyId = platformAdmin && body.companyId ? Number(body.companyId) : session.companyId;
  const reviewDate = body.nextReviewDate ? new Date(String(body.nextReviewDate)) : null;
  const existing = await prisma.complianceFramework.findFirst({ where: { name, companyId } });
  const framework = existing
    ? await prisma.complianceFramework.update({ where: { id: existing.id }, data: { nextReviewDate: reviewDate } })
    : await prisma.complianceFramework.create({ data: { name, companyId, readinessPercent: 0, nextReviewDate: reviewDate } });
  return NextResponse.json(framework, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const id = Number(params.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Framework id is required.' }, { status: 400 });
  const framework = await prisma.complianceFramework.findUnique({ where: { id } });
  const platformAdmin = session.accessLevel === 'SUPER_MASTER_ADMIN' || (session.accessLevel === 'MASTER_ADMIN' && !session.companyId);
  if (!framework || (!platformAdmin && framework.companyId !== session.companyId)) return NextResponse.json({ error: 'Certification not found.' }, { status: 404 });
  await prisma.complianceFramework.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
