import type { FastifyRequest } from "fastify";
import { hasPermission, type Permission } from "@obraos/shared";
import { AppError } from "../errors/app-error.js";

/**
 * preHandler de autorização. Verifica role → permission com a MESMA matriz
 * usada pelo frontend (@obraos/shared). O frontend só esconde botões;
 * a decisão real é sempre aqui e nas políticas RLS.
 */
export const authorize = (...required: Permission[]) => async (req: FastifyRequest) => {
  if (!req.user) throw AppError.unauthenticated();
  const ok = required.every((p) => hasPermission(req.user!.role, p));
  if (!ok) throw AppError.forbidden();
};
