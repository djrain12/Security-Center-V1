import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session';

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const attempt = attempts.get(address);
  if (attempt && attempt.resetAt > now && attempt.count >= 8) {
    return new Response(JSON.stringify({ error: 'Too many sign-in attempts. Try again in a few minutes.' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((attempt.resetAt - now) / 1000)) } });
  }
  const body = await request.json();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }, include: { role: true, company: true, modulePermissions: true } });
  if (!user || !user.passwordHash) {
    recordFailure(address, now);
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    recordFailure(address, now);
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }
  if (user.status !== 'ACTIVE') return NextResponse.json({ error: 'Account is inactive.' }, { status: 403 });
  if (user.company && !user.emailVerifiedAt) return NextResponse.json({ error: 'Verify your email before signing in.' }, { status: 403 });
  if (user.company && user.company.subscriptionEndsAt && user.company.subscriptionEndsAt < new Date()) return NextResponse.json({ error: 'This company trial or subscription has ended. Contact WSI to renew access.' }, { status: 403 });

  attempts.delete(address);
  const response = NextResponse.json({
    id: user.id,
    name: user.fullName,
    email: user.email,
    title: user.role.name,
    role: user.role.name,
    department: user.department,
    accessLevel: user.accessLevel,
    companyId: user.companyId,
    companyName: user.company?.name || '',
    photoUrl: user.photoUrl || '',
    permissions: Object.fromEntries(user.modulePermissions.map(permission => [permission.moduleName, permission.allowed])),
  });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions);
  return response;
}

function recordFailure(address: string, now: number) {
  const previous = attempts.get(address);
  if (!previous || previous.resetAt <= now) {
    attempts.set(address, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return;
  }
  attempts.set(address, { count: previous.count + 1, resetAt: previous.resetAt });
}
