import { randomBytes, createHash } from "node:crypto";
import type { SessionUser } from "@obraos/shared";
import { redis } from "../../infra/cache/redis.js";
import { env } from "../config/env.js";

/**
 * Sessões opacas server-side em Redis. O cookie só transporta um token aleatório;
 * o Redis guarda o hash do token → SessionUser. Revogação = apagar a chave.
 */
const key = (tokenHash: string) => `session:${tokenHash}`;
const userIndex = (userId: string) => `session:user:${userId}`;
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export const SessionStore = {
  async create(user: SessionUser): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const h = hash(token);
    await redis.multi()
      .set(key(h), JSON.stringify(user), "EX", env.SESSION_TTL_SECONDS)
      .sadd(userIndex(user.id), h)
      .expire(userIndex(user.id), env.SESSION_TTL_SECONDS)
      .exec();
    return token;
  },
  async get(token: string): Promise<SessionUser | null> {
    const raw = await redis.get(key(hash(token)));
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  },
  async revoke(token: string) {
    await redis.del(key(hash(token)));
  },
  /** Revoga todas as sessões de um utilizador (ex.: mudança de password). */
  async revokeAllForUser(userId: string) {
    const hashes = await redis.smembers(userIndex(userId));
    if (hashes.length) await redis.del(...hashes.map(key), userIndex(userId));
  },
};
