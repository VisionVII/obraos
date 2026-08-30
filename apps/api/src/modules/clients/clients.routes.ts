import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { Permission, createClientSchema, updateClientSchema } from "@obraos/shared";
import { authorize } from "../../core/rbac/authorize.js";
import { ClientsService } from "./clients.service.js";

const idParam = z.object({ id: z.string().uuid() });

/** Rotas = transporte. Validam entrada, autorizam, delegam ao serviço. */
export async function clientsRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const read = [app.requireAuth, authorize(Permission.CLIENTS_READ)];
  const write = [app.requireAuth, authorize(Permission.CLIENTS_WRITE)];

  r.get("/clients", { schema: { tags: ["clients"] }, preHandler: read }, (req) => ClientsService.list(req.user!));
  r.get("/clients/:id", { schema: { tags: ["clients"], params: idParam }, preHandler: read }, (req) => ClientsService.get(req.user!, req.params.id));
  r.post("/clients", { schema: { tags: ["clients"], body: createClientSchema }, preHandler: write }, async (req, reply) =>
    reply.status(201).send(await ClientsService.create(req.user!, req.body)));
  r.patch("/clients/:id", { schema: { tags: ["clients"], params: idParam, body: updateClientSchema }, preHandler: write }, (req) =>
    ClientsService.update(req.user!, req.params.id, req.body));
  r.delete("/clients/:id", { schema: { tags: ["clients"], params: idParam }, preHandler: write }, async (req, reply) => {
    await ClientsService.remove(req.user!, req.params.id);
    return reply.status(204).send();
  });
}
