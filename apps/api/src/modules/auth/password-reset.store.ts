import { randomBytes, createHash } from "node:crypto";
import { redis } from "../../infra/cache/redis.js";

const TTL_SECONDS = 60 * 60; // 1h
const key = (tokenHash: string) => `password-reset:${tokenHash}`;
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/** Token opaco de reset de password. Único, expira em 1h, single-use. */
export const PasswordResetStore = {
  async create(userId: string): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    await redis.set(key(hash(token)), userId, "EX", TTL_SECONDS);
    return token;
  },
  async consume(token: string): Promise<string | null> {
    const k = key(hash(token));
    const userId = await redis.get(k);
    if (userId) await redis.del(k);
    return userId;
  },
};
