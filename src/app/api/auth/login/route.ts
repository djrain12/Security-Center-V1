import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const body = await request.json();
  const requestedEmail = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!requestedEmail || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { email: requestedEmail },
    include: { role: true, modulePermissions: true },
  });
  if (!user || !user.passwordHash) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  if (user.status !== 'ACTIVE') return NextResponse.json({ error: 'Account is inactive.' }, { status: 403 });

  return NextResponse.json({
    id: user.id,
    name: user.fullName,
    email: user.email,
    title: user.role.name,
    role: user.role.name,
    department: user.department,
    accessLevel: user.accessLevel,
    photoUrl: user.photoUrl || '',
    permissions: Object.fromEntries(user.modulePermissions.map(permission => [permission.moduleName, permission.allowed])),
  });
}
