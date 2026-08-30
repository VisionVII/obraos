import { pgTable, text, boolean, uuid, timestamp, pgPolicy, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { baseColumns, currentOrgId, tenantCheck } from "./_helpers.js";

export const organizations = pgTable(
  "organizations",
  {
    ...baseColumns,
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    active: boolean("active").notNull().default(true),
  },
  () => [
    // Uma organização só se vê a si própria.
    pgPolicy("organizations_tenant", {
      for: "all",
      using: sql`id = ${currentOrgId}`,
    }),
  ],
).enableRLS();

export const users = pgTable(
  "users",
  {
    ...baseColumns,
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  },
  // Sem RLS: users é global (um utilizador pode pertencer a várias orgs).
  // O acesso é controlado exclusivamente pela camada de aplicação + memberships.
);

export const memberships = pgTable(
  "memberships",
  {
    ...baseColumns,
    organizationId: uuid("organization_id").notNull().references(() => organizations.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    role: text("role").notNull(), // valores em @obraos/shared Role
  },
  (t) => [
    index("memberships_org_idx").on(t.organizationId),
    index("memberships_user_idx").on(t.userId),
    pgPolicy("memberships_tenant", { for: "all", using: tenantCheck, withCheck: tenantCheck }),
  ],
).enableRLS();
