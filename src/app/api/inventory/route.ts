import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.inventoryDevice.findMany({ orderBy: { assetTag: 'desc' } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.assetTag) return NextResponse.json({ error: 'assetTag is required.' }, { status: 400 });
  const row = await prisma.inventoryDevice.create({ data: { id: body.id || `${body.assetTag}-${Date.now()}`, assetTag: body.assetTag, deviceType: body.deviceType || 'Laptop', brand: body.brand || '', model: body.model || '', serialNumber: body.serialNumber || '', status: body.status || 'Good', deployed: Boolean(body.deployed), assignedTo: body.assignedTo || '' } });
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const row = await prisma.inventoryDevice.update({ where: { id: body.id }, data: { assetTag: body.assetTag, deviceType: body.deviceType, brand: body.brand, model: body.model, serialNumber: body.serialNumber, status: body.status, deployed: Boolean(body.deployed), assignedTo: body.assignedTo } });
  return NextResponse.json(row);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  await prisma.inventoryDevice.delete({ where: { id: body.id } });
  return NextResponse.json({ deleted: true });
}
