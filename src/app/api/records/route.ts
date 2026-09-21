import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generic per-module record store. Query with ?module=<name>.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moduleName = searchParams.get('module') || '';
  if (!moduleName) return NextResponse.json({ error: 'module is required.' }, { status: 400 });
  const records = await prisma.moduleRecord.findMany({ where: { module: moduleName }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
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
  return NextResponse.json(record, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const record = await prisma.moduleRecord.update({
    where: { id: body.id },
    data: { title: body.title, tag: body.tag, meta: body.meta, detail: body.detail, attachmentName: body.attachmentName, attachmentType: body.attachmentType, attachmentData: body.attachmentData },
  });
  return NextResponse.json(record);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  await prisma.moduleRecord.delete({ where: { id: body.id } });
  return NextResponse.json({ deleted: true });
}
