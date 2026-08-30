import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { env } from '../../core/config/env.js';
import * as schema from './schema/index.js';

/**
 * Duas conexões, propositadamente:
 * - `adminDb`: role owner. Usado APENAS por migrations e por operações
 *   pré-tenant (registo, login) que precisam de ler `users`/`memberships`
 *   antes de existir contexto de organização.
 * - `appDb`: role `obraos_app` sem BYPASSRLS. É por aqui que passa TODO
 *   o tráfego de negócio. Sem `SET LOCAL app.organization_id` não vê nada.
 */
const adminSql = postgres(env.DATABASE_URL, { max: 5, prepare: false });
const appSql = postgres(env.DATABASE_APP_URL, { max: 20, prepare: false });

export const adminDb = drizzle(adminSql, { schema });
export const appDb = drizzle(appSql, { schema });

export type Db = typeof appDb;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

/**
 * Executa `fn` numa transação com o tenant fixado ao nível do Postgres.
 * Todas as queries dentro de `fn` ficam automaticamente confinadas à organização.
 * Esta é a ÚNICA forma sancionada de aceder a dados de negócio.
 */
export async function withTenant<T>(organizationId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return appDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.organization_id', ${organizationId}, true)`);
    return fn(tx);
  });
}

export async function closeDb() {
  await Promise.all([adminSql.end(), appSql.end()]);
}
