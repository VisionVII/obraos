import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";

/** Colunas base obrigatórias em todas as entidades. */
export const baseColumns = {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const auditColumns = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
};

/**
 * Depois do primeiro `set_config('app.organization_id', ...)` numa ligação, o valor
 * "reset" desse GUC fica `''` (não NULL) — sem o `nullif`, uma query fora de `withTenant`
 * numa ligação reutilizada do pool falha com "invalid input syntax for type uuid" em vez
 * de devolver zero linhas.
 */
export const currentOrgId = sql`nullif(current_setting('app.organization_id', true), '')::uuid`;

/**
 * Política RLS padrão de tenant. A app define `SET LOCAL app.organization_id`
 * no início de cada transação; qualquer linha fora desse tenant é invisível.
 */
export const tenantCheck = sql`organization_id = ${currentOrgId}`;
