import { and, desc, eq, isNull } from "drizzle-orm";
import type { CreateClientInput, UpdateClientInput } from "@obraos/shared";
import type { Tx } from "../../infra/db/client.js";
import { clients } from "../../infra/db/schema/index.js";

/** Remove chaves `undefined` (compatível com exactOptionalPropertyTypes + Drizzle). */
const strip = <T extends object>(o: T): { [K in keyof T]?: Exclude<T[K], undefined> } =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as { [K in keyof T]?: Exclude<T[K], undefined> };

/**
 * Repositório = só SQL. Recebe sempre uma `Tx` já confinada ao tenant (RLS).
 * Mesmo assim filtra por organization_id: defesa em profundidade.
 */
export const ClientsRepository = {
  list: (tx: Tx, orgId: string) =>
    tx.select().from(clients).where(and(eq(clients.organizationId, orgId), isNull(clients.deletedAt))).orderBy(desc(clients.createdAt)),
  findById: (tx: Tx, orgId: string, id: string) =>
    tx.query.clients.findFirst({ where: and(eq(clients.id, id), eq(clients.organizationId, orgId), isNull(clients.deletedAt)) }),
  create: async (tx: Tx, orgId: string, actorId: string, input: CreateClientInput) => {
    const [row] = await tx.insert(clients).values({ ...strip(input), name: input.name, organizationId: orgId, createdBy: actorId, updatedBy: actorId }).returning();
    return row!;
  },
  update: async (tx: Tx, orgId: string, actorId: string, id: string, input: UpdateClientInput) => {
    const [row] = await tx.update(clients).set({ ...strip(input), updatedBy: actorId, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.organizationId, orgId))).returning();
    return row ?? null;
  },
  softDelete: (tx: Tx, orgId: string, actorId: string, id: string) =>
    tx.update(clients).set({ deletedAt: new Date(), updatedBy: actorId }).where(and(eq(clients.id, id), eq(clients.organizationId, orgId))),
};
