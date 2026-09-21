import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function serviceStatus(ok: boolean, empty: boolean) {
  if (empty) return 'Not configured';
  return ok ? 'Operational' : 'Degraded';
}

export async function GET() {
  const [incidents, vulnerabilities, risks, assets, frameworks, activities, servers, backups, documents, users] = await Promise.all([
    prisma.securityIncident.findMany({ orderBy: { detectedAt: 'desc' }, take: 8, include: { affectedAsset: true, assignee: true } }),
    prisma.vulnerability.groupBy({ by: ['severity'], _count: { _all: true } }),
    prisma.risk.groupBy({ by: ['rating'], _count: { _all: true } }),
    prisma.securityAsset.count(),
    prisma.complianceFramework.findMany({ orderBy: { name: 'asc' } }),
    prisma.securityActivity.findMany({ orderBy: { completionPercent: 'asc' } }),
    prisma.monitoredServer.findMany({ orderBy: { name: 'asc' } }),
    prisma.backupJob.findMany({ orderBy: { jobName: 'asc' } }),
    prisma.libraryDocument.findMany({ orderBy: { uploadedAt: 'desc' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
  ]);

  const openIncidents = incidents.filter(incident => incident.status !== 'RESOLVED').length;
  const onlineServers = servers.filter(server => server.status === 'online').length;
  const unhealthyBackups = backups.filter(job => !['Healthy', 'Success', 'Completed'].includes(job.status));
  const cyberOk = openIncidents < 8;
  const identityOk = users > 0;
  const backupOk = backups.length === 0 || unhealthyBackups.length === 0;
  const docsOk = true;

  const services = [
    {
      name: 'Cyber Security',
      status: serviceStatus(cyberOk, false),
      detail: openIncidents === 0 ? 'No open incidents in the latest snapshot.' : `${openIncidents} open incident(s) in the latest snapshot.`,
    },
    {
      name: 'Identity services',
      status: serviceStatus(identityOk, users === 0),
      detail: users === 0 ? 'No active directory accounts loaded.' : `${users} active user account(s) available.`,
    },
    {
      name: 'Backup services',
      status: serviceStatus(backupOk, backups.length === 0),
      detail: backups.length === 0
        ? 'No backup jobs registered yet.'
        : unhealthyBackups.length === 0
          ? `${backups.length} backup job(s) reporting healthy.`
          : `${unhealthyBackups.length} of ${backups.length} job(s) need attention.`,
    },
    {
      name: 'Document library',
      status: serviceStatus(docsOk, documents.length === 0),
      detail: documents.length === 0 ? 'Library is reachable; no documents uploaded yet.' : `${documents.length} document(s) accessible.`,
    },
    {
      name: 'Monitored servers',
      status: serviceStatus(servers.length === 0 || onlineServers === servers.length, servers.length === 0),
      detail: servers.length === 0
        ? 'No servers configured for health checks.'
        : `${onlineServers}/${servers.length} endpoint(s) online.`,
    },
  ];

  const uptimePercent = servers.length === 0 ? null : Math.round((onlineServers / servers.length) * 10000) / 100;
  const healthyServices = services.filter(service => service.status === 'Operational').length;

  return NextResponse.json({
    incidents,
    vulnerabilities,
    risks,
    assets,
    frameworks,
    activities,
    services,
    uptime: uptimePercent === null ? '—' : `${uptimePercent.toFixed(2)}%`,
    uptimeDetail: servers.length === 0 ? `${healthyServices}/${services.length} platform services ready` : `${onlineServers}/${servers.length} servers online`,
    members: users,
    backups: backups.length,
    documents: documents.length,
    openIncidents,
  });
}
