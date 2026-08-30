import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import { env, isProd } from "./core/config/env.js";
import { registerErrorHandler } from "./core/errors/error-handler.js";
import { authPlugin } from "./core/tenancy/auth.plugin.js";
import { healthRoutes } from "./core/http/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { clientsRoutes } from "./modules/clients/clients.routes.js";
import { redis } from "./infra/cache/redis.js";

export async function buildApp() {
  const app = Fastify({
    logger: isProd ? { level: "info" } : { level: "debug", transport: { target: "pino-pretty" } },
    trustProxy: true,
    bodyLimit: 1024 * 1024, // 1 MB; uploads vão direto para o S3 via signed URL
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: isProd });
  await app.register(cors, { origin: env.WEB_BASE_URL, credentials: true });
  await app.register(cookie, { secret: env.SESSION_SECRET });
  await app.register(rateLimit, { max: 300, timeWindow: "1 minute", redis });

  await app.register(swagger, {
    openapi: { info: { title: "ObraOS API", version: "1" } },
    transform: jsonSchemaTransform,
  });
  if (!isProd) await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(authPlugin);
  registerErrorHandler(app);

  await app.register(healthRoutes);
  await app.register(async (v1) => {
    await v1.register(authRoutes);
    await v1.register(clientsRoutes);
    // Fase 1+: works, tasks, agenda, quotes, expenses, payments, daily logs, photos, portal…
  }, { prefix: "/api/v1" });

  return app;
}
