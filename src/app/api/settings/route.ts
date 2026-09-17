import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all settings as a single object; POST upserts keys.
export async function GET() {
  const rows = await prisma.appSetting.findMany();
  const result: Record<string, string> = {};
  rows.forEach(row => { result[row.key] = row.value; });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const entries = Object.entries(body).filter(([, value]) => value !== undefined);
  await Promise.all(entries.map(([key, value]) => prisma.appSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })));
  return NextResponse.json({ saved: entries.length });
}
