import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const [incidents, vulnerabilities, risks, assets, frameworks, activities] = await Promise.all([
    prisma.securityIncident.findMany({ orderBy:{detectedAt:'desc'}, take:8, include:{affectedAsset:true, assignee:true} }),
    prisma.vulnerability.groupBy({ by:['severity'], _count:{_all:true} }),
    prisma.risk.groupBy({ by:['rating'], _count:{_all:true} }),
    prisma.securityAsset.count(),
    prisma.complianceFramework.findMany({ orderBy:{name:'asc'} }),
    prisma.securityActivity.findMany({ orderBy:{completionPercent:'asc'} })
  ]);
  return NextResponse.json({ incidents, vulnerabilities, risks, assets, frameworks, activities });
}
