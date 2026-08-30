import { pgTable, text, uuid, pgPolicy, index } from "drizzle-orm/pg-core";
import { baseColumns, auditColumns, tenantCheck } from "./_helpers.js";
import { organizations } from "./organizations.js";

export const clients = pgTable(
  "clients",
  {
    ...baseColumns,
    ...auditColumns,
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    notes: text("notes"),
  },
  (t) => [
    index("clients_org_idx").on(t.organizationId),
    pgPolicy("clients_tenant", { for: "all", using: tenantCheck, withCheck: tenantCheck }),
  ],
).enableRLS();
