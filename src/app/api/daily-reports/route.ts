import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.dailyReportEntry.findMany({ orderBy: { date: 'desc' } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.employeeName || !body.tasks) return NextResponse.json({ error: 'employeeName and tasks are required.' }, { status: 400 });
  const row = await prisma.dailyReportEntry.create({ data: { id: body.id || `dr-${Date.now()}`, date: body.date || new Date().toISOString().slice(0, 10), employeeName: body.employeeName, department: body.department || '', timeIn: body.timeIn || '', timeOut: body.timeOut || '', tasks: body.tasks, accomplishments: body.accomplishments || '', issues: body.issues || '', status: body.status || 'Submitted', attachmentName: body.attachmentName || null, attachmentData: body.attachmentData || null } });
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const row = await prisma.dailyReportEntry.update({ where: { id: body.id }, data: { date: body.date, employeeName: body.employeeName, department: body.department, timeIn: body.timeIn, timeOut: body.timeOut, tasks: body.tasks, accomplishments: body.accomplishments, issues: body.issues, status: body.status, attachmentName: body.attachmentName, attachmentData: body.attachmentData } });
  return NextResponse.json(row);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  await prisma.dailyReportEntry.delete({ where: { id: body.id } });
  return NextResponse.json({ deleted: true });
}
