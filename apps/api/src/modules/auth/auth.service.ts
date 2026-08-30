import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { Role, type LoginInput, type RegisterInput, type SessionUser } from "@obraos/shared";
import { adminDb } from "../../infra/db/client.js";
import { memberships, organizations, users } from "../../infra/db/schema/index.js";
import { AppError } from "../../core/errors/app-error.js";
import { env } from "../../core/config/env.js";
import { consoleMailer } from "../../infra/mail/mailer.port.js";
import { EmailVerificationStore } from "./verification.store.js";
import { PasswordResetStore } from "./password-reset.store.js";
import { SessionStore } from "../../core/tenancy/session.js";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function sendVerificationEmail(userId: string, email: string) {
  const token = await EmailVerificationStore.create(userId);
  const link = `${env.WEB_BASE_URL}/verify-email?token=${token}`;
  await consoleMailer.send({
    to: email,
    subject: "Confirme o seu email \u2014 ObraOS",
    text: `Bem-vindo ao ObraOS. Confirme o seu email em: ${link}\n\nO link expira em 24 horas.`,
  });
}

/**
 * Registo e login usam `adminDb` porque ainda não existe tenant.
 * Tudo o que acontece DEPOIS de haver sessão passa por `withTenant`.
 */
export const AuthService = {
  async register(input: RegisterInput): Promise<SessionUser> {
    const existing = await adminDb.query.users.findFirst({ where: eq(users.email, input.email) });
    if (existing) throw AppError.conflict("EMAIL_ALREADY_IN_USE", "Já existe uma conta com este email.");

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const sessionUser = await adminDb.transaction(async (tx) => {
      const [org] = await tx.insert(organizations)
        .values({ name: input.organizationName, slug: `${slugify(input.organizationName)}-${Date.now().toString(36)}` })
        .returning();
      const [user] = await tx.insert(users).values({ name: input.name, email: input.email, passwordHash }).returning();
      await tx.insert(memberships).values({ organizationId: org!.id, userId: user!.id, role: Role.OWNER });
      return { id: user!.id, name: user!.name, email: user!.email, organizationId: org!.id, role: Role.OWNER, emailVerified: false };
    });
    await sendVerificationEmail(sessionUser.id, sessionUser.email);
    return sessionUser;
  },

  async login(input: LoginInput): Promise<SessionUser> {
    const user = await adminDb.query.users.findFirst({ where: eq(users.email, input.email) });
    // Mesma mensagem e custo semelhante quer o email exista ou não.
    const ok = user ? await argon2.verify(user.passwordHash, input.password) : false;
    if (!user || !ok) throw new AppError("INVALID_CREDENTIALS", "Email ou password incorretos.", 401);

    // V1: primeira membership. Multi-org switching fica preparado pelo modelo, não pela UI.
    const m = await adminDb.query.memberships.findFirst({ where: eq(memberships.userId, user.id) });
    if (!m) throw AppError.forbidden("Esta conta não pertence a nenhuma organização.");
    return {
      id: user.id, name: user.name, email: user.email,
      organizationId: m.organizationId, role: m.role as Role,
      emailVerified: !!user.emailVerifiedAt,
    };
  },

  /** Consome o token (single-use) e marca o email como verificado. */
  async verifyEmail(token: string): Promise<void> {
    const userId = await EmailVerificationStore.consume(token);
    if (!userId) throw new AppError("INVALID_VERIFICATION_TOKEN", "Link de verificação inválido ou expirado.", 400);
    await adminDb.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userId));
  },

  /**
   * Nunca revela se o email existe: responde sempre com sucesso.
   * O rate limit fica a cargo da rota (config.rateLimit).
   */
  async resendVerification(email: string): Promise<void> {
    const user = await adminDb.query.users.findFirst({ where: eq(users.email, email) });
    if (user && !user.emailVerifiedAt) await sendVerificationEmail(user.id, user.email);
  },

  /** Nunca revela se o email existe: responde sempre com sucesso. */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await adminDb.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) return;
    const token = await PasswordResetStore.create(user.id);
    const link = `${env.WEB_BASE_URL}/reset-password?token=${token}`;
    await consoleMailer.send({
      to: user.email,
      subject: "Repor a sua password — ObraOS",
      text: `Pediu para repor a password. Escolha uma nova em: ${link}\n\nO link expira em 1 hora. Se não foi você, ignore este email.`,
    });
  },

  /** Consome o token (single-use), define a nova password e revoga todas as sessões ativas. */
  async resetPassword(token: string, password: string): Promise<void> {
    const userId = await PasswordResetStore.consume(token);
    if (!userId) throw new AppError("INVALID_RESET_TOKEN", "Link de reposição inválido ou expirado.", 400);
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await adminDb.update(users).set({ passwordHash }).where(eq(users.id, userId));
    await SessionStore.revokeAllForUser(userId);
  },

  /** Utilizador autenticado a mudar a própria password. Revoga as restantes sessões. */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await adminDb.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw AppError.unauthenticated();
    const ok = await argon2.verify(user.passwordHash, currentPassword);
    if (!ok) throw new AppError("INVALID_CREDENTIALS", "Password atual incorreta.", 401);
    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await adminDb.update(users).set({ passwordHash }).where(eq(users.id, userId));
    await SessionStore.revokeAllForUser(userId);
  },
};
