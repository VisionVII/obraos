# ObraOS

**O seu trabalho. As suas obras. Num só lugar.**

SaaS para empreiteiros e profissionais independentes da construção e remodelação.
Cliente → Orçamento → Obra → Trabalho → Custos → Pagamentos → Conclusão.

## Arranque rápido

```bash
pnpm install
cp .env.example .env
pnpm infra:up          # Postgres 16 + Redis 7 + MinIO
pnpm db:generate       # gera SQL a partir do schema Drizzle
pnpm db:migrate        # aplica migrations
pnpm db:seed           # cria utilizador de dev: dev@obraos.local / password1234
pnpm dev               # api :3000 · web :5173 · docs :3000/docs
```

## Estrutura

```
apps/api        Fastify + Drizzle (Node 22, TS)
apps/web        Vite + React + Tailwind (PWA, mobile-first)
packages/shared Enums de estado, schemas Zod, matriz RBAC — fonte única de verdade
packages/config tsconfig / eslint base
docs/           ARCHITECTURE · DATABASE · API · SECURITY · DEPLOYMENT · adr/
```

## Comandos

| comando | faz |
|---|---|
| `pnpm dev` | arranca api + web em watch |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | qualidade |
| `pnpm db:generate` | nova migration a partir de `apps/api/src/infra/db/schema` |
| `pnpm db:migrate` | aplica migrations (nunca alterar produção à mão) |
| `pnpm db:seed` | cria o utilizador de dev (idempotente, nunca corre em produção) |
| `pnpm --filter @obraos/web test:e2e` | testes E2E (Playwright) — precisa da infra e da API a correr |

Ver `docs/` para arquitetura e decisões. Princípio: **Menos gestão. Mais obra.**
