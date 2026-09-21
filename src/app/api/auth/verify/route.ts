import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'node:crypto';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const verification = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!verification || verification.expiresAt < new Date()) return NextResponse.json({ error: 'Verification link is invalid or expired.' }, { status: 400 });
  await prisma.user.update({ where: { id: verification.userId }, data: { emailVerifiedAt: new Date(), status: 'ACTIVE' } });
  await prisma.emailVerificationToken.delete({ where: { id: verification.id } });
  return NextResponse.redirect(new URL('/login?verified=1', request.url));
}
