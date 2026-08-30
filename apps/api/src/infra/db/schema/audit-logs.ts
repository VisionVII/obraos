import { pgTable, text, uuid, jsonb, pgPolicy, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { baseColumns, tenantCheck } from "./_helpers.js";

/** Imutável: a política permite apenas SELECT e INSERT. Sem UPDATE/DELETE para o role da app. */
export const auditLogs = pgTable(
  "audit_logs",
  {
    ...baseColumns,
    organizationId: uuid("organization_id").notNull(),
    actorId: uuid("actor_id"),
    action: text("action").notNull(),       // ex: quote.accepted
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    ip: text("ip"),
  },
  (t) => [
    index("audit_org_created_idx").on(t.organizationId, t.createdAt),
    pgPolicy("audit_select", { for: "select", using: tenantCheck }),
    pgPolicy("audit_insert", { for: "insert", withCheck: tenantCheck }),
    pgPolicy("audit_no_update", { for: "update", using: sql`false` }),
    pgPolicy("audit_no_delete", { for: "delete", using: sql`false` }),
  ],
).enableRLS();
