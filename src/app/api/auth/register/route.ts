import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  const body = await request.json() as { companyName?: string; name?: string; email?: string; password?: string; department?: string };
  const companyName = String(body.companyName || '').trim();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!companyName || !name || !email || password.length < 8) return NextResponse.json({ error: 'Company, name, email, and a password of at least 8 characters are required.' }, { status: 400 });
  if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: 'That email is already registered.' }, { status: 409 });
  const role = await prisma.role.findUnique({ where: { name: 'Master Admin' } });
  if (!role) return NextResponse.json({ error: 'Registration is not configured.' }, { status: 500 });
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  const company = await prisma.company.create({ data: { name: companyName, slug, subscriptionStatus: 'TRIAL', subscriptionEndsAt: new Date(Date.now() + 30 * 86400000) } });
  const user = await prisma.user.create({ data: { fullName: name, email, department: body.department || 'Administration', companyId: company.id, roleId: role.id, accessLevel: 'MASTER_ADMIN', status: 'INACTIVE', passwordHash: await bcrypt.hash(password, 12) } });
  const token = randomBytes(32).toString('hex');
  await prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 86400000) } });
  const url = `${new URL(request.url).origin}/api/auth/verify?token=${token}`;
  const mail = await sendVerificationEmail(email, name, url);
  return NextResponse.json({ registered: true, message: mail.delivered ? 'Check your email to verify your account.' : 'Registration created. Configure email delivery before production use.', verificationUrl: process.env.NODE_ENV === 'production' ? undefined : url }, { status: 201 });
}
