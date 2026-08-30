import fp from "fastify-plugin";
import type { FastifyRequest } from "fastify";
import type { SessionUser } from "@obraos/shared";
import { SessionStore } from "./session.js";
import { AppError } from "../errors/app-error.js";

export const SESSION_COOKIE = "obraos_session";

declare module "fastify" {
  interface FastifyRequest {
    user: SessionUser | null;
  }
  interface FastifyInstance {
    /** preHandler: exige sessão válida. */
    requireAuth: (req: FastifyRequest) => Promise<void>;
  }
}

/** Resolve a sessão a partir do cookie em TODOS os pedidos; não bloqueia por si só. */
export const authPlugin = fp(async (app) => {
  app.decorateRequest("user", null);
  app.addHook("onRequest", async (req) => {
    const token = req.cookies[SESSION_COOKIE];
    req.user = token ? await SessionStore.get(token) : null;
  });
  app.decorate("requireAuth", async (req: FastifyRequest) => {
    if (!req.user) throw AppError.unauthenticated();
  });
});
