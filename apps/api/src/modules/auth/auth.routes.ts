import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resendVerificationSchema,
  resetPasswordSchema, sessionUserSchema, verifyEmailSchema,
} from "@obraos/shared";
import { AuthService } from "./auth.service.js";
import { SessionStore } from "../../core/tenancy/session.js";
import { SESSION_COOKIE } from "../../core/tenancy/auth.plugin.js";
import { env, isProd } from "../../core/config/env.js";

const cookieOpts = {
  httpOnly: true, secure: isProd, sameSite: "lax" as const, path: "/", maxAge: env.SESSION_TTL_SECONDS,
};

export async function authRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.post("/auth/register", {
    schema: { tags: ["auth"], body: registerSchema, response: { 201: z.object({ user: sessionUserSchema }) } },
    config: { rateLimit: { max: 5, timeWindow: "15 minutes" } },
  }, async (req, reply) => {
    const user = await AuthService.register(req.body);
    const token = await SessionStore.create(user);
    return reply.setCookie(SESSION_COOKIE, token, cookieOpts).status(201).send({ user });
  });

  r.post("/auth/login", {
    schema: { tags: ["auth"], body: loginSchema, response: { 200: z.object({ user: sessionUserSchema }) } },
    config: { rateLimit: { max: 10, timeWindow: "15 minutes" } },
  }, async (req, reply) => {
    const user = await AuthService.login(req.body);
    const token = await SessionStore.create(user);
    return reply.setCookie(SESSION_COOKIE, token, cookieOpts).send({ user });
  });

  r.post("/auth/logout", { schema: { tags: ["auth"] } }, async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    if (token) await SessionStore.revoke(token);
    return reply.clearCookie(SESSION_COOKIE, { path: "/" }).status(204).send();
  });

  r.post("/auth/email/verify", {
    schema: { tags: ["auth"], body: verifyEmailSchema, response: { 204: z.void() } },
    config: { rateLimit: { max: 10, timeWindow: "15 minutes" } },
  }, async (req, reply) => {
    await AuthService.verifyEmail(req.body.token);
    return reply.status(204).send();
  });

  r.post("/auth/email/resend", {
    schema: { tags: ["auth"], body: resendVerificationSchema, response: { 202: z.void() } },
    config: { rateLimit: { max: 3, timeWindow: "15 minutes" } },
  }, async (req, reply) => {
    await AuthService.resendVerification(req.body.email);
    return reply.status(202).send();
  });

  r.post("/auth/password/forgot", {
    schema: { tags: ["auth"], body: forgotPasswordSchema, response: { 202: z.void() } },
    config: { rateLimit: { max: 3, timeWindow: "15 minutes" } },
  }, async (req, reply) => {
    await AuthService.requestPasswordReset(req.body.email);
    return reply.status(202).send();
  });

  r.post("/auth/password/reset", {
    schema: { tags: ["auth"], body: resetPasswordSchema, response: { 204: z.void() } },
    config: { rateLimit: { max: 10, timeWindow: "15 minutes" } },
  }, async (req, reply) => {
    await AuthService.resetPassword(req.body.token, req.body.password);
    return reply.status(204).send();
  });

  r.post("/auth/password/change", {
    schema: { tags: ["auth"], body: changePasswordSchema, response: { 200: z.object({ user: sessionUserSchema }) } },
    preHandler: app.requireAuth,
    config: { rateLimit: { max: 5, timeWindow: "15 minutes" } },
  }, async (req, reply) => {
    await AuthService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    const token = await SessionStore.create(req.user!);
    return reply.setCookie(SESSION_COOKIE, token, cookieOpts).send({ user: req.user! });
  });

  r.get("/auth/me", {
    schema: { tags: ["auth"], response: { 200: z.object({ user: sessionUserSchema }) } },
    preHandler: app.requireAuth,
  }, async (req) => ({ user: req.user! }));
}
