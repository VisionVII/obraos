# FASE 0 — FOUNDATION · plano de implementação

Objetivo: base segura e testada sobre a qual a Fase 1 (Core) constrói sem tocar em infraestrutura.

| # | entregável | estado | critério de aceitação |
|---|---|---|---|
| 0.1 | Monorepo, compose, CI | ✅ scaffold | `pnpm install && pnpm build` verde em CI |
| 0.2 | Schema base + 1ª migration | ⏳ | `pnpm db:generate` produz SQL com políticas RLS; `db:migrate` corre em CI |
| 0.3 | RLS + role `obraos_app` | ✅ código | `tenancy.integration.test.ts` verde |
| 0.4 | Auth: registo, login, logout, me | ✅ código | E2E: criar conta → /me devolve user |
| 0.5 | Verificação de email | ⏳ | token único, expira em 24h, reenvio com rate limit |
| 0.6 | Recuperação de password | ⏳ | token single-use, revoga todas as sessões após reset |
| 0.7 | RBAC + módulo de referência (`clients`) | ✅ código | worker recebe 403 em `POST /clients` |
| 0.8 | Audit log imutável | ✅ código | UPDATE/DELETE em `audit_logs` falha com role app |
| 0.9 | Design system: tokens, Button, Field, Stat, Shell | ✅ base | 360px sem scroll horizontal; foco visível |
| 0.10 | Observabilidade: logs pino, /health, /ready | ✅ | /ready devolve 503 se Redis cair |
| 0.11 | Testes base: unit (RBAC), integration (RLS), E2E esqueleto (Playwright) | parcial | E2E: registo → login → criar cliente |
| 0.12 | Docs + ADRs | ✅ | este diretório |

Ordem sugerida: 0.2 → 0.5 → 0.6 → 0.11 → gate de saída da Fase 0 (CI verde, RLS testado, sem `adminDb` fora de auth/infra).
