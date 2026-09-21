import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSessionFromRequest } from '@/lib/session';

// GET returns full user directory with module permissions.
export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  const users = await prisma.user.findMany({ where: session?.accessLevel === 'SUPER_MASTER_ADMIN' ? undefined : { companyId: session?.companyId || -1 }, orderBy: { fullName: 'asc' }, include: { role: true, company: true, modulePermissions: true } });
  return NextResponse.json(users.map(user => ({
    id: user.id,
    companyId: user.companyId,
    companyName: user.company?.name || '',
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
  const session = getSessionFromRequest(request);
  const body = await request.json();
  if (!body.name || !body.email) return NextResponse.json({ error: 'name and email are required.' }, { status: 400 });
  const roleName = String(body.role || 'IT User');
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) role = await prisma.role.create({ data: { name: roleName, description: '', canViewConfidential: body.accessLevel !== 'IT_USER' } });
  const passwordHash = body.password ? await bcrypt.hash(String(body.password), 10) : null;
  const requestedAccess = String(body.accessLevel || 'IT_USER');
  if (requestedAccess === 'SUPER_MASTER_ADMIN' || (requestedAccess === 'MASTER_ADMIN' && session?.accessLevel !== 'SUPER_MASTER_ADMIN')) return NextResponse.json({ error: 'Only the Super Master Admin can create platform administrators.' }, { status: 403 });
  const companyId = session?.accessLevel === 'SUPER_MASTER_ADMIN' && body.companyId ? Number(body.companyId) : session?.companyId || null;
  const user = await prisma.user.create({ data: { fullName: body.name, email: String(body.email).toLowerCase(), companyId, department: body.department || '', roleId: role.id, accessLevel: requestedAccess as 'MASTER_ADMIN' | 'ADMIN' | 'IT_SECURITY_OFFICER' | 'IT_USER', birthday: body.birthday ? new Date(body.birthday) : null, contactNumber: body.contactNumber || null, address: body.address || null, photoUrl: body.photoUrl || null, mfaEnabled: Boolean(body.mfaEnabled), passwordHash } });
  return NextResponse.json({ id: user.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = getSessionFromRequest(request);
  const body = await request.json();
  if (!body.email) return NextResponse.json({ error: 'email is required.' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: String(body.email).toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  if (session?.accessLevel !== 'SUPER_MASTER_ADMIN' && user.companyId !== session?.companyId) return NextResponse.json({ error: 'User access denied.' }, { status: 403 });
  if (body.accessLevel === 'SUPER_MASTER_ADMIN' && session?.accessLevel !== 'SUPER_MASTER_ADMIN') return NextResponse.json({ error: 'Only the Super Master Admin can grant platform access.' }, { status: 403 });
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
  const updated = await prisma.user.update({ where: { id: user.id }, data: { fullName: body.name ?? user.fullName, companyId: body.companyId === null ? null : body.companyId ? Number(body.companyId) : user.companyId, department: body.department ?? user.department, accessLevel: body.accessLevel ?? user.accessLevel, birthday: body.birthday ? new Date(body.birthday) : user.birthday, contactNumber: body.contactNumber ?? user.contactNumber, address: body.address ?? user.address, photoUrl: body.photoUrl ?? user.photoUrl, mfaEnabled: body.mfaEnabled ?? user.mfaEnabled, roleId, passwordHash } });
  return NextResponse.json({ id: updated.id });
}

export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request);
  const body = await request.json();
  if (!body.email) return NextResponse.json({ error: 'email is required.' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: String(body.email).toLowerCase() } });
  if (!user || (session?.accessLevel !== 'SUPER_MASTER_ADMIN' && user.companyId !== session?.companyId)) return NextResponse.json({ error: 'User access denied.' }, { status: 403 });
  await prisma.user.delete({ where: { id: user.id } });
  return NextResponse.json({ deleted: true });
}
