/**
 * Fluxo de verificação de email contra Postgres + Redis reais (CI tem ambos os serviços).
 * Sem DATABASE_URL o ficheiro é ignorado (imports dinâmicos para não abortar o processo).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const hasDb = !!process.env.DATABASE_URL && !!process.env.REDIS_URL && !!process.env.SESSION_SECRET;

describe.skipIf(!hasDb)('verificação de email', () => {
  let db: typeof import('../src/infra/db/client.js');
  let schema: typeof import('../src/infra/db/schema/index.js');
  let redisMod: typeof import('../src/infra/cache/redis.js');
  let AuthService: typeof import('../src/modules/auth/auth.service.js')['AuthService'];
  let EmailVerificationStore: typeof import('../src/modules/auth/verification.store.js')['EmailVerificationStore'];
  let eq: typeof import('drizzle-orm')['eq'];
  const createdOrgIds: string[] = [];

  beforeAll(async () => {
    db = await import('../src/infra/db/client.js');
    schema = await import('../src/infra/db/schema/index.js');
    redisMod = await import('../src/infra/cache/redis.js');
    ({ AuthService } = await import('../src/modules/auth/auth.service.js'));
    ({ EmailVerificationStore } = await import('../src/modules/auth/verification.store.js'));
    ({ eq } = await import('drizzle-orm'));
  });

  afterAll(async () => {
    for (const orgId of createdOrgIds) {
      const orgMemberships = await db.adminDb.query.memberships.findMany({ where: eq(schema.memberships.organizationId, orgId) });
      for (const m of orgMemberships) {
        await db.adminDb.delete(schema.memberships).where(eq(schema.memberships.id, m.id));
        await db.adminDb.delete(schema.users).where(eq(schema.users.id, m.userId));
      }
      await db.adminDb.delete(schema.organizations).where(eq(schema.organizations.id, orgId));
    }
    await db.closeDb();
    await redisMod.redis.quit();
  });

  async function registerFresh() {
    const email = `verify-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const user = await AuthService.register({
      name: 'Teste', email, password: 'password1234', organizationName: 'Org de Teste',
    });
    createdOrgIds.push(user.organizationId);
    return user;
  }

  it('novo utilizador começa por verificar', async () => {
    const user = await registerFresh();
    expect(user.emailVerified).toBe(false);
  });

  it('token válido marca o email como verificado e não pode ser reutilizado', async () => {
    const user = await registerFresh();
    const token = await EmailVerificationStore.create(user.id);

    await AuthService.verifyEmail(token);
    const verified = await AuthService.login({ email: user.email, password: 'password1234' });
    expect(verified.emailVerified).toBe(true);

    await expect(AuthService.verifyEmail(token)).rejects.toThrow();
  });

  it('token inválido rejeita', async () => {
    await expect(AuthService.verifyEmail('token-que-nao-existe')).rejects.toThrow();
  });

  it('reenvio para email inexistente não rebenta (não revela existência)', async () => {
    await expect(AuthService.resendVerification('ninguem@example.com')).resolves.toBeUndefined();
  });
});
