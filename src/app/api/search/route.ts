import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (query.length < 2) return NextResponse.json({ results: [] });
  const contains = { contains: query };
  const [users, documents, records, assets, servers, devices] = await Promise.all([
    prisma.user.findMany({ where: { OR: [{ fullName: contains }, { email: contains }, { department: contains }] }, take: 8, include: { role: true } }),
    prisma.libraryDocument.findMany({ where: { OR: [{ name: contains }, { category: contains }, { framework: contains }] }, take: 8 }),
    prisma.moduleRecord.findMany({ where: { OR: [{ title: contains }, { module: contains }, { detail: contains }, { meta: contains }] }, take: 12 }),
    prisma.securityAsset.findMany({ where: { OR: [{ name: contains }, { assetTag: contains }, { ownerDepartment: contains }] }, take: 8 }),
    prisma.monitoredServer.findMany({ where: { OR: [{ name: contains }, { host: contains }, { serverType: contains }] }, take: 8 }),
    prisma.networkDevice.findMany({ where: { OR: [{ ipAddress: contains }, { name: contains }, { deviceType: contains }, { zoneName: contains }] }, take: 8 }),
  ]);
  return NextResponse.json({
    results: [
      ...users.map(item => ({ id: `user-${item.id}`, group: 'People', title: item.fullName, detail: `${item.role.name} · ${item.email}`, module: 'User Management' })),
      ...documents.map(item => ({ id: `document-${item.id}`, group: 'Documents', title: item.name, detail: `${item.framework} · ${item.status}`, module: 'Document Library' })),
      ...records.map(item => ({ id: `record-${item.id}`, group: item.module, title: item.title, detail: `${item.tag} · ${item.meta || item.detail.slice(0, 80)}`, module: item.module })),
      ...assets.map(item => ({ id: `asset-${item.id}`, group: 'Security Assets', title: item.name, detail: `${item.assetTag} · ${item.ownerDepartment}`, module: 'Security Assets' })),
      ...servers.map(item => ({ id: `server-${item.id}`, group: 'Infrastructure', title: item.name, detail: `${item.host} · ${item.status}`, module: 'Server Management' })),
      ...devices.map(item => ({ id: `network-${item.id}`, group: 'Infrastructure', title: item.name || item.ipAddress, detail: `${item.ipAddress} · ${item.status}`, module: 'Network Management' })),
    ],
  });
}
