import prisma from './prisma';

export async function logAuditEvent({
  actorId,
  actorEmail = 'system',
  action,
  entity,
  entityId,
  metadata,
}: {
  actorId?: string;
  actorEmail?: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        actorEmail: actorEmail,
        action: action,
        entity: entity,
        entityId: entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
