import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function writeAuditLog(input: {
  actorId?: number | null;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata,
    },
  });
}
