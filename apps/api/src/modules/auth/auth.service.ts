import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { Role, type LoginInput, type RegisterInput, type SessionUser } from "@obraos/shared";
import { adminDb } from "../../infra/db/client.js";
import { memberships, organizations, users } from "../../infra/db/schema/index.js";
import { AppError } from "../../core/errors/app-error.js";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Registo e login usam `adminDb` porque ainda não existe tenant.
 * Tudo o que acontece DEPOIS de haver sessão passa por `withTenant`.
 */
export const AuthService = {
  async register(input: RegisterInput): Promise<SessionUser> {
    const existing = await adminDb.query.users.findFirst({ where: eq(users.email, input.email) });
    if (existing) throw AppError.conflict("EMAIL_ALREADY_IN_USE", "Já existe uma conta com este email.");

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    return adminDb.transaction(async (tx) => {
      const [org] = await tx.insert(organizations)
        .values({ name: input.organizationName, slug: `${slugify(input.organizationName)}-${Date.now().toString(36)}` })
        .returning();
      const [user] = await tx.insert(users).values({ name: input.name, email: input.email, passwordHash }).returning();
      await tx.insert(memberships).values({ organizationId: org!.id, userId: user!.id, role: Role.OWNER });
      return { id: user!.id, name: user!.name, email: user!.email, organizationId: org!.id, role: Role.OWNER };
    });
  },

  async login(input: LoginInput): Promise<SessionUser> {
    const user = await adminDb.query.users.findFirst({ where: eq(users.email, input.email) });
    // Mesma mensagem e custo semelhante quer o email exista ou não.
    const ok = user ? await argon2.verify(user.passwordHash, input.password) : false;
    if (!user || !ok) throw new AppError("INVALID_CREDENTIALS", "Email ou password incorretos.", 401);

    // V1: primeira membership. Multi-org switching fica preparado pelo modelo, não pela UI.
    const m = await adminDb.query.memberships.findFirst({ where: eq(memberships.userId, user.id) });
    if (!m) throw AppError.forbidden("Esta conta não pertence a nenhuma organização.");
    return { id: user.id, name: user.name, email: user.email, organizationId: m.organizationId, role: m.role as Role };
  },
};
