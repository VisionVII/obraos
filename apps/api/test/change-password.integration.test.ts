/**
 * Fluxo de mudança de password (utilizador autenticado) contra Postgres + Redis reais.
 * Sem DATABASE_URL o ficheiro é ignorado (imports dinâmicos para não abortar o processo).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const hasDb = !!process.env.DATABASE_URL && !!process.env.REDIS_URL && !!process.env.SESSION_SECRET;

describe.skipIf(!hasDb)('mudar password (autenticado)', () => {
  let db: typeof import('../src/infra/db/client.js');
  let schema: typeof import('../src/infra/db/schema/index.js');
  let redisMod: typeof import('../src/infra/cache/redis.js');
  let AuthService: typeof import('../src/modules/auth/auth.service.js')['AuthService'];
  let eq: typeof import('drizzle-orm')['eq'];
  const createdOrgIds: string[] = [];

  beforeAll(async () => {
    db = await import('../src/infra/db/client.js');
    schema = await import('../src/infra/db/schema/index.js');
    redisMod = await import('../src/infra/cache/redis.js');
    ({ AuthService } = await import('../src/modules/auth/auth.service.js'));
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
    const email = `change-pw-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const user = await AuthService.register({
      name: 'Teste', email, password: 'password1234', organizationName: 'Org de Teste',
    });
    createdOrgIds.push(user.organizationId);
    return user;
  }

  it('password atual correta troca a password', async () => {
    const user = await registerFresh();
    await AuthService.changePassword(user.id, 'password1234', 'nova-password-9999');
    await expect(AuthService.login({ email: user.email, password: 'password1234' })).rejects.toThrow();
    await expect(AuthService.login({ email: user.email, password: 'nova-password-9999' })).resolves.toMatchObject({ email: user.email });
  });

  it('password atual incorreta rejeita', async () => {
    const user = await registerFresh();
    await expect(AuthService.changePassword(user.id, 'password-errada', 'nova-password-9999')).rejects.toThrow();
  });

  it('revoga as restantes sessões ativas', async () => {
    const { SessionStore } = await import('../src/core/tenancy/session.js');
    const user = await registerFresh();
    const sessionToken = await SessionStore.create(user);
    expect(await SessionStore.get(sessionToken)).not.toBeNull();

    await AuthService.changePassword(user.id, 'password1234', 'nova-password-9999');

    expect(await SessionStore.get(sessionToken)).toBeNull();
  });
});
