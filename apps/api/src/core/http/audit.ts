import type { Tx } from "../../infra/db/client.js";
import { auditLogs } from "../../infra/db/schema/index.js";

export interface AuditEntry {
  organizationId: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}

/** Escreve no audit log DENTRO da mesma transação da ação (atómico). */
export const audit = (tx: Tx, e: AuditEntry) =>
  tx.insert(auditLogs).values({
    organizationId: e.organizationId,
    actorId: e.actorId ?? null,
    action: e.action,
    entityType: e.entityType,
    entityId: e.entityId ?? null,
    before: e.before ?? null,
    after: e.after ?? null,
    ip: e.ip ?? null,
  });
