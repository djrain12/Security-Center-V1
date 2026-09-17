import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.emailAccount.findMany({ orderBy: { employeeName: 'asc' } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.employeeName) return NextResponse.json({ error: 'employeeName is required.' }, { status: 400 });
  const row = await prisma.emailAccount.create({ data: { id: body.id || `em-${Date.now()}`, date: body.date || '', employeeName: body.employeeName, verifyName: body.verifyName || '', userType: body.userType || 'New', status: body.status || 'Active', personalEmail: body.personalEmail || '', personalPassword: body.personalPassword || '', wsiEmail: body.wsiEmail || '', wsiPassword: body.wsiPassword || '', company: body.company || '', remarks: body.remarks || '' } });
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const row = await prisma.emailAccount.update({ where: { id: body.id }, data: { date: body.date, employeeName: body.employeeName, verifyName: body.verifyName, userType: body.userType, status: body.status, personalEmail: body.personalEmail, personalPassword: body.personalPassword, wsiEmail: body.wsiEmail, wsiPassword: body.wsiPassword, company: body.company, remarks: body.remarks } });
  return NextResponse.json(row);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  await prisma.emailAccount.delete({ where: { id: body.id } });
  return NextResponse.json({ deleted: true });
}
