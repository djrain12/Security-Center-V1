import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';

async function companyAllowed(request: Request, companyId: number) {
  const session = getSessionFromRequest(request);
  return session && (session.accessLevel === 'SUPER_MASTER_ADMIN' || session.companyId === companyId);
}

export async function GET(request: Request) {
  const companyId = Number(new URL(request.url).searchParams.get('companyId'));
  if (!Number.isInteger(companyId) || !(await companyAllowed(request, companyId))) return NextResponse.json({ error: 'Company backup access denied.' }, { status: 403 });
  const rows = await prisma.companyBackup.findMany({ where: { companyId }, select: { id: true, companyId: true, name: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json() as { action?: string; companyId?: number; name?: string; payload?: string };
  const companyId = Number(body.companyId);
  if (!Number.isInteger(companyId) || !(await companyAllowed(request, companyId))) return NextResponse.json({ error: 'Company backup access denied.' }, { status: 403 });
  if (body.action === 'load') {
    if (!body.payload) return NextResponse.json({ error: 'Backup payload is required.' }, { status: 400 });
    try {
      const parsed = JSON.parse(body.payload) as { companyId?: number; documents?: Array<Record<string, unknown>>; frameworks?: Array<Record<string, unknown>> };
      if (parsed.companyId && parsed.companyId !== companyId) return NextResponse.json({ error: 'This backup belongs to a different company.' }, { status: 400 });
      if (parsed.documents) for (const document of parsed.documents) await prisma.libraryDocument.upsert({ where: { id: String(document.id) }, update: { companyId, name: String(document.name || ''), category: String(document.category || 'Policy'), framework: String(document.framework || 'General'), status: String(document.status || 'Draft'), size: String(document.size || '—'), uploadedAt: String(document.uploadedAt || ''), dataUrl: typeof document.dataUrl === 'string' ? document.dataUrl : null }, create: { id: String(document.id), companyId, name: String(document.name || ''), category: String(document.category || 'Policy'), framework: String(document.framework || 'General'), status: String(document.status || 'Draft'), size: String(document.size || '—'), uploadedAt: String(document.uploadedAt || ''), dataUrl: typeof document.dataUrl === 'string' ? document.dataUrl : null } });
      return NextResponse.json({ loaded: true, documents: parsed.documents?.length || 0 });
    } catch { return NextResponse.json({ error: 'Invalid company backup file.' }, { status: 400 }); }
  }
  const [documents, frameworks] = await Promise.all([
    prisma.libraryDocument.findMany({ where: { companyId } }),
    prisma.complianceFramework.findMany({ where: { companyId } }),
  ]);
  const payload = JSON.stringify({ version: 1, companyId, exportedAt: new Date().toISOString(), documents, frameworks });
  const backup = await prisma.companyBackup.create({ data: { companyId, name: body.name || `company-${companyId}-${new Date().toISOString().slice(0, 10)}`, payload } });
  return NextResponse.json({ id: backup.id, name: backup.name, createdAt: backup.createdAt, payload }, { status: 201 });
}

export async function DELETE(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = Number(params.get('id'));
  const backup = await prisma.companyBackup.findUnique({ where: { id } });
  if (!backup || !(await companyAllowed(request, backup.companyId))) return NextResponse.json({ error: 'Company backup access denied.' }, { status: 403 });
  await prisma.companyBackup.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
