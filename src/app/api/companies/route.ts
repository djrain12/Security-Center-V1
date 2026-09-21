import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session || session.accessLevel !== 'SUPER_MASTER_ADMIN') return NextResponse.json({ error: 'Only the Super Master Admin can manage companies.' }, { status: 403 });
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { users: true, documents: true, frameworks: true } } },
  });
  return NextResponse.json(companies);
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session || session.accessLevel !== 'SUPER_MASTER_ADMIN') return NextResponse.json({ error: 'Only the Super Master Admin can manage companies.' }, { status: 403 });
  const body = await request.json() as { name?: unknown; slug?: unknown; status?: unknown; subscriptionStatus?: unknown; subscriptionEndsAt?: unknown };
  const name = String(body.name || '').trim();
  if (!name) return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
  const slug = slugify(String(body.slug || name));
  if (!slug) return NextResponse.json({ error: 'A valid company slug is required.' }, { status: 400 });
  try {
    const company = await prisma.company.create({ data: { name, slug, status: String(body.status || 'ACTIVE'), subscriptionStatus: String(body.subscriptionStatus || 'ACTIVE'), subscriptionEndsAt: body.subscriptionEndsAt ? new Date(String(body.subscriptionEndsAt)) : null } });
    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'A company with that slug already exists.' }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session || session.accessLevel !== 'SUPER_MASTER_ADMIN') return NextResponse.json({ error: 'Only the Super Master Admin can manage companies.' }, { status: 403 });
  const body = await request.json() as { id?: unknown; name?: unknown; slug?: unknown; status?: unknown; subscriptionStatus?: unknown; subscriptionEndsAt?: unknown };
  const id = Number(body.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Company id is required.' }, { status: 400 });
  try {
    const company = await prisma.company.update({ where: { id }, data: { name: body.name ? String(body.name).trim() : undefined, slug: body.slug ? slugify(String(body.slug)) : undefined, status: body.status ? String(body.status) : undefined, subscriptionStatus: body.subscriptionStatus ? String(body.subscriptionStatus) : undefined, subscriptionEndsAt: body.subscriptionEndsAt ? new Date(String(body.subscriptionEndsAt)) : undefined } });
    return NextResponse.json(company);
  } catch {
    return NextResponse.json({ error: 'Could not update company.' }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session || session.accessLevel !== 'SUPER_MASTER_ADMIN') return NextResponse.json({ error: 'Only the Super Master Admin can manage companies.' }, { status: 403 });
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Company id is required.' }, { status: 400 });
  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
