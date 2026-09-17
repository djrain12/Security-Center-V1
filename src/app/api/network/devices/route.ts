import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { return NextResponse.json(await prisma.networkDevice.findMany({ orderBy: { ipAddress: 'asc' } })); }
export async function PATCH(request: Request) { const body = await request.json(); if (!body.ipAddress || !body.name) return NextResponse.json({ error: 'IP address and device name are required.' }, { status: 400 }); const device = await prisma.networkDevice.upsert({ where: { ipAddress: body.ipAddress }, update: { name: body.name }, create: { ipAddress: body.ipAddress, name: body.name, status: body.status || 'online', responseMs: body.responseMs ?? null, lastScannedAt: new Date() } }); return NextResponse.json(device); }
