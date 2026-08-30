import type { FastifyError, FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { AppError } from "./app-error.js";
import { isProd } from "../config/env.js";

/** Respostas de erro previsíveis. Nunca devolve stack traces ao cliente. */
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err: FastifyError | AppError | ZodError, req, reply) => {
    if (err instanceof AppError) {
      return reply.status(err.status).send({ error: { code: err.code, message: err.message, details: err.details } });
    }
    if (err instanceof ZodError || hasZodFastifySchemaValidationErrors(err)) {
      const details = err instanceof ZodError ? err.flatten() : (err as FastifyError).validation;
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: "Dados inválidos.", details } });
    }
    const fe = err as FastifyError;
    if (fe.statusCode === 429) {
      return reply.status(429).send({ error: { code: "RATE_LIMITED", message: "Demasiados pedidos. Tente novamente daqui a pouco." } });
    }
    req.log.error({ err }, "unhandled error");
    return reply.status(500).send({
      error: { code: "INTERNAL", message: isProd ? "Ocorreu um erro inesperado." : fe.message },
    });
  });
  app.setNotFoundHandler((_req, reply) =>
    reply.status(404).send({ error: { code: "NOT_FOUND", message: "Recurso não encontrado." } }),
  );
}
