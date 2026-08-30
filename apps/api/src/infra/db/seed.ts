import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { Role } from "@obraos/shared";
import { isProd } from "../../core/config/env.js";
import { adminDb, closeDb } from "./client.js";
import { memberships, organizations, users } from "./schema/index.js";

/** Credenciais fixas e conhecidas — só para desenvolvimento local. */
export const DEV_USER = { email: "dev@obraos.local", password: "password1234" };

/** Cria uma organização + utilizador dono, já com email verificado, para login imediato em dev. Idempotente. */
async function seed() {
  if (isProd) throw new Error("Seed de desenvolvimento não corre em produção.");

  const existing = await adminDb.query.users.findFirst({ where: eq(users.email, DEV_USER.email) });
  if (existing) {
    console.warn(`Utilizador de dev já existe: ${DEV_USER.email} / ${DEV_USER.password}`);
    return;
  }

  const passwordHash = await argon2.hash(DEV_USER.password, { type: argon2.argon2id });
  await adminDb.transaction(async (tx) => {
    const [org] = await tx.insert(organizations).values({ name: "Obra Dev", slug: "obra-dev" }).returning();
    const [user] = await tx.insert(users)
      .values({ name: "Dev", email: DEV_USER.email, passwordHash, emailVerifiedAt: new Date() })
      .returning();
    await tx.insert(memberships).values({ organizationId: org!.id, userId: user!.id, role: Role.OWNER });
  });
  console.warn(`Utilizador de dev criado: ${DEV_USER.email} / ${DEV_USER.password}`);
}

seed()
  .then(closeDb)
  .catch(async (e) => {
    console.error(e);
    await closeDb();
    process.exit(1);
  });
