import { randomBytes, createHash } from "node:crypto";
import { redis } from "../../infra/cache/redis.js";

const TTL_SECONDS = 60 * 60 * 24; // 24h
const key = (tokenHash: string) => `email-verify:${tokenHash}`;
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Token opaco de verificação de email. Único, expira em 24h, single-use:
 * `consume` apaga a chave, por isso o mesmo token nunca verifica duas vezes.
 */
export const EmailVerificationStore = {
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
