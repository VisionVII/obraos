# PROJECT AUDIT — 2026-08-30

**Estado inicial:** repositório inexistente. Não há stack, código, dependências nem dívida técnica herdada. Este audit regista o ponto zero e as decisões que o scaffold da Fase 0 fixou.

| Área | Encontrado | Decisão |
|---|---|---|
| Stack | Nada | Spec fixa React/TS/Tailwind, Node/TS, Postgres, Redis, S3 |
| Backend framework | Não especificado | **Fastify 5 + Zod** (ver ADR-0002) |
| ORM / migrations | Não especificado | **Drizzle** — RLS declarado no schema, migrations em SQL (ADR-0003) |
| Frontend build | Não especificado | **Vite SPA + PWA**; sem SSR (ADR-0004) |
| Multi-tenancy | Spec pede RLS | RLS desde a 1ª tabela + role `obraos_app` sem BYPASSRLS (ADR-0001) |
| Auth | Spec: sessão segura, prep MFA/OAuth | Sessões opacas em Redis, cookie httpOnly, argon2id |
| Riscos | — | Ver secção abaixo |

## Riscos identificados
1. **RLS depende de `set_config` por transação.** Qualquer query fora de `withTenant` devolve zero linhas (falha segura), mas um dev pode "corrigir" usando `adminDb`. Mitigação: lint rule/PR checklist proibindo `adminDb` fora de `modules/auth` e `infra/db`.
2. **Sessão única por utilizador/organização na V1.** O modelo (`memberships`) já suporta multi-org; a UI não. Documentado, não bloqueante.
3. **Uploads.** `bodyLimit` 1 MB na API obriga uploads a irem por signed URL (S3). Implementação na Fase 3.
4. **Verificação de email e reset de password** não incluídos no scaffold; são entregáveis da Fase 0 (ver plano).

## Recomendações
Seguir `docs/PHASE0_PLAN.md`. Não iniciar Fase 1 sem CI verde e teste de isolamento RLS a correr contra Postgres.
