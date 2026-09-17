import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Security incidents stored in the existing SecurityIncident table.
export async function GET() {
  const incidents = await prisma.securityIncident.findMany({ orderBy: { detectedAt: 'desc' }, include: { assignee: true, affectedAsset: true } });
  return NextResponse.json(incidents.map(incident => ({
    id: incident.incidentCode,
    title: incident.title,
    severity: incident.severity.charAt(0) + incident.severity.slice(1).toLowerCase(),
    asset: incident.affectedAsset?.name || '',
    status: incident.status.charAt(0) + incident.status.slice(1).toLowerCase(),
    reportedAt: incident.detectedAt.toLocaleString(),
    owner: incident.assignee?.fullName || 'Unassigned',
  })));
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: 'title is required.' }, { status: 400 });
  const severity = String(body.severity || 'MEDIUM').toUpperCase();
  const count = await prisma.securityIncident.count();
  const incident = await prisma.securityIncident.create({
    data: {
      incidentCode: body.id || `INC-${String(count + 1).padStart(3, '0')}`,
      title: body.title,
      severity: (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(severity) ? severity : 'MEDIUM') as never,
      status: 'OPEN',
      detectedAt: new Date(),
    },
  });
  return NextResponse.json({ id: incident.incidentCode }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  const status = String(body.status || 'OPEN').toUpperCase().replace(/\s+/g, '_');
  const incident = await prisma.securityIncident.update({ where: { incidentCode: body.id }, data: { status: (['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'].includes(status) ? status : 'OPEN') as never, resolvedAt: status === 'RESOLVED' ? new Date() : null } });
  return NextResponse.json({ id: incident.incidentCode });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  await prisma.securityIncident.delete({ where: { incidentCode: body.id } });
  return NextResponse.json({ deleted: true });
}
