import { Redis } from "ioredis";
import { env } from "../../core/config/env.js";

export const redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 });
