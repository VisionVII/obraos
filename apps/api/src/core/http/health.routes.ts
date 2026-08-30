import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { adminDb } from "../../infra/db/client.js";
import { redis } from "../../infra/cache/redis.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", { config: { rateLimit: false } }, async () => ({ status: "ok" }));
  app.get("/ready", { config: { rateLimit: false } }, async (_req, reply) => {
    const checks: Record<string, "ok" | "fail"> = {};
    try { await adminDb.execute(sql`select 1`); checks.postgres = "ok"; } catch { checks.postgres = "fail"; }
    try { await redis.ping(); checks.redis = "ok"; } catch { checks.redis = "fail"; }
    const ready = Object.values(checks).every((c) => c === "ok");
    return reply.status(ready ? 200 : 503).send({ status: ready ? "ready" : "degraded", checks });
  });
}
