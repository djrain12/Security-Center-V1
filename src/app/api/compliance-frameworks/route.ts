import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  const companyWhere = session?.accessLevel === 'MASTER_ADMIN' ? {} : { companyId: session?.companyId || -1 };
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
  const body = await request.json() as { name?: unknown; companyId?: unknown; nextReviewDate?: unknown };
  const name = String(body.name || '').trim();
  if (!name) return NextResponse.json({ error: 'Framework name is required.' }, { status: 400 });
  const companyId = session?.accessLevel === 'MASTER_ADMIN' && body.companyId ? Number(body.companyId) : session?.companyId || null;
  const framework = await prisma.complianceFramework.create({ data: { name, companyId, readinessPercent: 0, nextReviewDate: body.nextReviewDate ? new Date(String(body.nextReviewDate)) : null } });
  return NextResponse.json(framework, { status: 201 });
}

export async function DELETE(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = Number(params.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Framework id is required.' }, { status: 400 });
  await prisma.complianceFramework.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
