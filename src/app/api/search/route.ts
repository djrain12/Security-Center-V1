import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const query = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (query.length < 2) return NextResponse.json({ results: [] });
  const contains = { contains: query };
  const companyId = session.accessLevel === 'SUPER_MASTER_ADMIN' ? undefined : session.companyId || -1;
  const [users, documents, records, assets, servers, devices, frameworks, incidents, vulnerabilities, risks, auditLogs] = await Promise.all([
    prisma.user.findMany({ where: { ...(companyId === undefined ? {} : { companyId }), OR: [{ fullName: contains }, { email: contains }, { department: contains }] }, take: 8, include: { role: true } }),
    prisma.libraryDocument.findMany({ where: { ...(companyId === undefined ? {} : { companyId }), OR: [{ name: contains }, { category: contains }, { framework: contains }] }, take: 8 }),
    prisma.moduleRecord.findMany({ where: { OR: [{ title: contains }, { module: contains }, { detail: contains }, { meta: contains }] }, take: 12 }),
    prisma.securityAsset.findMany({ where: { OR: [{ name: contains }, { assetTag: contains }, { ownerDepartment: contains }] }, take: 8 }),
    prisma.monitoredServer.findMany({ where: { OR: [{ name: contains }, { host: contains }, { serverType: contains }] }, take: 8 }),
    prisma.networkDevice.findMany({ where: { OR: [{ ipAddress: contains }, { name: contains }, { deviceType: contains }, { zoneName: contains }] }, take: 8 }),
    prisma.complianceFramework.findMany({ where: { ...(companyId === undefined ? {} : { companyId }), name: contains }, take: 8 }),
    prisma.securityIncident.findMany({ where: { OR: [{ incidentCode: contains }, { title: contains }] }, take: 8 }),
    prisma.vulnerability.findMany({ where: { OR: [{ cveId: contains }, { title: contains }] }, take: 8 }),
    prisma.risk.findMany({ where: { OR: [{ riskCode: contains }, { title: contains }] }, take: 8 }),
    prisma.auditLog.findMany({ where: { ...(companyId === undefined ? {} : { actor: { companyId } }), OR: [{ action: contains }, { resourceType: contains }, { resourceId: contains }] }, take: 8, orderBy: { createdAt: 'desc' } }),
  ]);
  return NextResponse.json({
    results: [
      ...users.map(item => ({ id: `user-${item.id}`, group: 'People', title: item.fullName, detail: `${item.role.name} · ${item.email}`, module: 'User Management' })),
      ...documents.map(item => ({ id: `document-${item.id}`, group: 'Documents', title: item.name, detail: `${item.framework} · ${item.status}`, module: 'Document Library' })),
      ...records.map(item => ({ id: `record-${item.id}`, group: item.module, title: item.title, detail: `${item.tag} · ${item.meta || item.detail.slice(0, 80)}`, module: item.module })),
      ...assets.map(item => ({ id: `asset-${item.id}`, group: 'Security Assets', title: item.name, detail: `${item.assetTag} · ${item.ownerDepartment}`, module: 'Security Assets' })),
      ...servers.map(item => ({ id: `server-${item.id}`, group: 'Infrastructure', title: item.name, detail: `${item.host} · ${item.status}`, module: 'Server Management' })),
      ...devices.map(item => ({ id: `network-${item.id}`, group: 'Infrastructure', title: item.name || item.ipAddress, detail: `${item.ipAddress} · ${item.status}`, module: 'Network Management' })),
      ...frameworks.map(item => ({ id: `framework-${item.id}`, group: 'Certifications', title: item.name, detail: `${item.readinessPercent}% readiness`, module: `${item.name} Compliance` })),
      ...incidents.map(item => ({ id: `incident-${item.id}`, group: 'Security Incidents', title: item.title, detail: `${item.incidentCode} · ${item.status}`, module: 'Security Incidents' })),
      ...vulnerabilities.map(item => ({ id: `vulnerability-${item.id}`, group: 'Vulnerabilities', title: item.title, detail: `${item.cveId || 'No CVE'} · ${item.status}`, module: 'Vulnerability Management' })),
      ...risks.map(item => ({ id: `risk-${item.id}`, group: 'Risks', title: item.title, detail: `${item.riskCode} · ${item.status}`, module: 'Risk Management' })),
      ...auditLogs.map(item => ({ id: `audit-${String(item.id)}`, group: 'Audit Logs', title: item.action, detail: `${item.resourceType}${item.resourceId ? ` · ${item.resourceId}` : ''} · ${new Date(item.createdAt).toLocaleString()}`, module: 'Audit Logs' })),
    ],
  });
}
