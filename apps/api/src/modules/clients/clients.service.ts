import type { CreateClientInput, SessionUser, UpdateClientInput } from "@obraos/shared";
import { withTenant } from "../../infra/db/client.js";
import { AppError } from "../../core/errors/app-error.js";
import { audit } from "../../core/http/audit.js";
import { ClientsRepository as Repo } from "./clients.repository.js";

const notFound = () => AppError.notFound("CLIENT_NOT_FOUND", "Cliente não encontrado.");

/** Serviço = regras de negócio + auditoria. Nunca fala com Fastify. */
export const ClientsService = {
  list: (u: SessionUser) => withTenant(u.organizationId, (tx) => Repo.list(tx, u.organizationId)),

  get: (u: SessionUser, id: string) =>
    withTenant(u.organizationId, async (tx) => (await Repo.findById(tx, u.organizationId, id)) ?? Promise.reject(notFound())),

  create: (u: SessionUser, input: CreateClientInput) =>
    withTenant(u.organizationId, async (tx) => {
      const row = await Repo.create(tx, u.organizationId, u.id, input);
      await audit(tx, { organizationId: u.organizationId, actorId: u.id, action: "client.created", entityType: "client", entityId: row.id, after: row });
      return row;
    }),

  update: (u: SessionUser, id: string, input: UpdateClientInput) =>
    withTenant(u.organizationId, async (tx) => {
      const before = await Repo.findById(tx, u.organizationId, id);
      if (!before) throw notFound();
      const after = await Repo.update(tx, u.organizationId, u.id, id, input);
      await audit(tx, { organizationId: u.organizationId, actorId: u.id, action: "client.updated", entityType: "client", entityId: id, before, after });
      return after!;
    }),

  remove: (u: SessionUser, id: string) =>
    withTenant(u.organizationId, async (tx) => {
      const before = await Repo.findById(tx, u.organizationId, id);
      if (!before) throw notFound();
      await Repo.softDelete(tx, u.organizationId, u.id, id);
      await audit(tx, { organizationId: u.organizationId, actorId: u.id, action: "client.deleted", entityType: "client", entityId: id, before });
    }),
};
