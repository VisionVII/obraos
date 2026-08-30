/**
 * Fluxo de reposição de password contra Postgres + Redis reais (CI tem ambos os serviços).
 * Sem DATABASE_URL o ficheiro é ignorado (imports dinâmicos para não abortar o processo).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const hasDb = !!process.env.DATABASE_URL && !!process.env.REDIS_URL && !!process.env.SESSION_SECRET;

describe.skipIf(!hasDb)('reposição de password', () => {
  let db: typeof import('../src/infra/db/client.js');
  let schema: typeof import('../src/infra/db/schema/index.js');
  let redisMod: typeof import('../src/infra/cache/redis.js');
  let AuthService: typeof import('../src/modules/auth/auth.service.js')['AuthService'];
  let PasswordResetStore: typeof import('../src/modules/auth/password-reset.store.js')['PasswordResetStore'];
  let SessionStore: typeof import('../src/core/tenancy/session.js')['SessionStore'];
  let eq: typeof import('drizzle-orm')['eq'];
  const createdOrgIds: string[] = [];

  beforeAll(async () => {
    db = await import('../src/infra/db/client.js');
    schema = await import('../src/infra/db/schema/index.js');
    redisMod = await import('../src/infra/cache/redis.js');
    ({ AuthService } = await import('../src/modules/auth/auth.service.js'));
    ({ PasswordResetStore } = await import('../src/modules/auth/password-reset.store.js'));
    ({ SessionStore } = await import('../src/core/tenancy/session.js'));
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
    const email = `reset-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const user = await AuthService.register({
      name: 'Teste', email, password: 'password1234', organizationName: 'Org de Teste',
    });
    createdOrgIds.push(user.organizationId);
    return user;
  }

  it('token válido troca a password e não pode ser reutilizado', async () => {
    const user = await registerFresh();
    const token = await PasswordResetStore.create(user.id);

    await AuthService.resetPassword(token, 'nova-password-1234');
    await expect(AuthService.login({ email: user.email, password: 'password1234' })).rejects.toThrow();
    await expect(AuthService.login({ email: user.email, password: 'nova-password-1234' })).resolves.toMatchObject({ email: user.email });

    await expect(AuthService.resetPassword(token, 'outra-password-1234')).rejects.toThrow();
  });

  it('token inválido rejeita', async () => {
    await expect(AuthService.resetPassword('token-que-nao-existe', 'password1234')).rejects.toThrow();
  });

  it('reset revoga todas as sessões ativas do utilizador', async () => {
    const user = await registerFresh();
    const sessionToken = await SessionStore.create(user);
    expect(await SessionStore.get(sessionToken)).not.toBeNull();

    const resetToken = await PasswordResetStore.create(user.id);
    await AuthService.resetPassword(resetToken, 'nova-password-1234');

    expect(await SessionStore.get(sessionToken)).toBeNull();
  });

  it('pedido de reset para email inexistente não rebenta (não revela existência)', async () => {
    await expect(AuthService.requestPasswordReset('ninguem@example.com')).resolves.toBeUndefined();
  });
});
