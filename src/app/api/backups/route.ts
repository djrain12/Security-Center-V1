import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.backupJob.findMany({ orderBy: { jobName: 'asc' } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.jobName) return NextResponse.json({ error: 'jobName is required.' }, { status: 400 });
  const row = await prisma.backupJob.create({ data: { id: body.id || `bk-${Date.now()}`, jobName: body.jobName, backupType: body.backupType || 'Full', schedule: body.schedule || '', target: body.target || '', status: body.status || 'Healthy', lastRun: body.lastRun || '', retention: body.retention || '30 days', attachmentName: body.attachmentName || null, attachmentData: body.attachmentData || null } });
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const row = await prisma.backupJob.update({ where: { id: body.id }, data: { jobName: body.jobName, backupType: body.backupType, schedule: body.schedule, target: body.target, status: body.status, lastRun: body.lastRun, retention: body.retention, attachmentName: body.attachmentName, attachmentData: body.attachmentData } });
  return NextResponse.json(row);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  await prisma.backupJob.delete({ where: { id: body.id } });
  return NextResponse.json({ deleted: true });
}
