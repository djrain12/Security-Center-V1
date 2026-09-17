import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET returns full user directory with module permissions.
export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { fullName: 'asc' }, include: { role: true, modulePermissions: true } });
  return NextResponse.json(users.map(user => ({
    id: user.id,
    name: user.fullName,
    title: user.role.name,
    department: user.department,
    role: user.role.name,
    accessLevel: user.accessLevel,
    birthday: user.birthday ? user.birthday.toISOString().slice(0, 10) : '',
    contactNumber: user.contactNumber || '',
    address: user.address || '',
    email: user.email,
    passwordConfigured: Boolean(user.passwordHash),
    mfaEnabled: user.mfaEnabled,
    photoUrl: user.photoUrl || '',
    status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
    permissions: Object.fromEntries(user.modulePermissions.map(permission => [permission.moduleName, permission.allowed])),
  })));
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.email) return NextResponse.json({ error: 'name and email are required.' }, { status: 400 });
  const roleName = String(body.role || 'IT User');
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) role = await prisma.role.create({ data: { name: roleName, description: '', canViewConfidential: body.accessLevel !== 'IT_USER' } });
  const passwordHash = body.password ? await bcrypt.hash(String(body.password), 10) : null;
  const user = await prisma.user.create({ data: { fullName: body.name, email: String(body.email).toLowerCase(), department: body.department || '', roleId: role.id, accessLevel: body.accessLevel || 'IT_USER', birthday: body.birthday ? new Date(body.birthday) : null, contactNumber: body.contactNumber || null, address: body.address || null, photoUrl: body.photoUrl || null, mfaEnabled: Boolean(body.mfaEnabled), passwordHash } });
  return NextResponse.json({ id: user.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.email) return NextResponse.json({ error: 'email is required.' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: String(body.email).toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  if (body.permissions && typeof body.permissions === 'object') {
    const entries = Object.entries(body.permissions as Record<string, boolean>);
    await Promise.all(entries.map(([moduleName, allowed]) => prisma.userModulePermission.upsert({ where: { userId_moduleName: { userId: user.id, moduleName } }, update: { allowed: Boolean(allowed) }, create: { userId: user.id, moduleName, allowed: Boolean(allowed) } })));
  }
  let roleId: number | undefined;
  if (body.role) {
    const roleName = String(body.role);
    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) role = await prisma.role.create({ data: { name: roleName, description: '', canViewConfidential: true } });
    roleId = role.id;
  }
  let passwordHash: string | null | undefined;
  if (body.password) passwordHash = await bcrypt.hash(String(body.password), 10);
  else if (body.passwordConfigured === false) passwordHash = null;
  const updated = await prisma.user.update({ where: { id: user.id }, data: { fullName: body.name ?? user.fullName, department: body.department ?? user.department, accessLevel: body.accessLevel ?? user.accessLevel, birthday: body.birthday ? new Date(body.birthday) : user.birthday, contactNumber: body.contactNumber ?? user.contactNumber, address: body.address ?? user.address, photoUrl: body.photoUrl ?? user.photoUrl, mfaEnabled: body.mfaEnabled ?? user.mfaEnabled, roleId, passwordHash } });
  return NextResponse.json({ id: updated.id });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.email) return NextResponse.json({ error: 'email is required.' }, { status: 400 });
  await prisma.user.delete({ where: { email: String(body.email).toLowerCase() } });
  return NextResponse.json({ deleted: true });
}
