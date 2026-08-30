/**
 * Teste de isolamento multi-tenant contra Postgres real (CI tem serviço).
 * Prova que a org B não vê clientes da org A mesmo sem filtro explícito.
 * Sem DATABASE_APP_URL o ficheiro é ignorado (imports dinâmicos para não abortar o processo).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const hasDb = !!process.env.DATABASE_APP_URL && !!process.env.SESSION_SECRET;

describe.skipIf(!hasDb)('RLS tenant isolation', () => {
  let db: typeof import('../src/infra/db/client.js');
  let schema: typeof import('../src/infra/db/schema/index.js');
  let sql: typeof import('drizzle-orm').sql;
  let orgA = '', orgB = '';

  beforeAll(async () => {
    db = await import('../src/infra/db/client.js');
    schema = await import('../src/infra/db/schema/index.js');
    ({ sql } = await import('drizzle-orm'));
    const [a] = await db.adminDb.insert(schema.organizations).values({ name: 'A', slug: `a-${Date.now()}` }).returning();
    const [b] = await db.adminDb.insert(schema.organizations).values({ name: 'B', slug: `b-${Date.now()}` }).returning();
    orgA = a!.id; orgB = b!.id;
    await db.withTenant(orgA, (tx) => tx.insert(schema.clients).values({ organizationId: orgA, name: 'Cliente de A' }));
  });
  afterAll(async () => {
    await db.adminDb.execute(sql`delete from clients where organization_id in (${orgA}, ${orgB})`);
    await db.adminDb.execute(sql`delete from organizations where id in (${orgA}, ${orgB})`);
    await db.closeDb();
  });

  it('org B não vê dados de A (sem where)', async () => {
    const rows = await db.withTenant(orgB, (tx) => tx.select().from(schema.clients));
    expect(rows).toHaveLength(0);
  });
  it('org A vê os seus dados', async () => {
    const rows = await db.withTenant(orgA, (tx) => tx.select().from(schema.clients));
    expect(rows.map((r) => r.name)).toContain('Cliente de A');
  });
  it('sem contexto de tenant não se vê nada', async () => {
    const rows = await db.appDb.select().from(schema.clients);
    expect(rows).toHaveLength(0);
  });
  it('org B não consegue inserir em A', async () => {
    await expect(
      db.withTenant(orgB, (tx) => tx.insert(schema.clients).values({ organizationId: orgA, name: 'intruso' })),
    ).rejects.toThrow();
  });
});
