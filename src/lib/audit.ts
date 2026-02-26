import { prisma } from "@/lib/prisma";

type AuditPayload = {
  actorUserId?: string;
  module: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
};

export async function auditLog(payload: AuditPayload) {
  await prisma.auditLog.create({
    data: {
      actorUserId: payload.actorUserId,
      module: payload.module,
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId,
      ipAddress: payload.ipAddress,
      metadata: payload.metadata
    }
  });
}
