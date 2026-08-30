import './load-env.js';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(3000),
  API_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  DATABASE_APP_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  SESSION_TTL_SECONDS: z.coerce.number().default(60 * 60 * 24 * 14),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default('eu-west-1'),
  S3_BUCKET: z.string().default('obraos'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Falhar cedo e alto: nunca arrancar com configuração inválida.
  console.error('Configuração inválida:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
