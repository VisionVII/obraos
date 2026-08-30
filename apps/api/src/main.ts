import { buildApp } from "./app.js";
import { env } from "./core/config/env.js";
import { closeDb } from "./infra/db/client.js";
import { redis } from "./infra/cache/redis.js";

const app = await buildApp();
await redis.connect();
await app.listen({ port: env.API_PORT, host: "0.0.0.0" });

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "shutting down");
  await app.close();
  await closeDb();
  redis.disconnect();
  process.exit(0);
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
