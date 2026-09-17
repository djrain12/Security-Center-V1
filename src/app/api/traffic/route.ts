import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { const logs = await prisma.trafficLog.findMany({ orderBy: { loggedAt: 'desc' }, take: 100 }); return NextResponse.json(logs.map(log => ({ ...log, id: log.id.toString() }))); }
