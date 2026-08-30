# DATABASE

PostgreSQL 16. Schema em `apps/api/src/infra/db/schema/`. Migrations SQL geradas pelo Drizzle em `apps/api/drizzle/`.

## Convenções
- PK `uuid` (`gen_random_uuid()`), `created_at`, `updated_at` em todas as tabelas (`baseColumns`).
- `deleted_at`, `created_by`, `updated_by` quando faz sentido (`auditColumns`). Delete é sempre soft nas entidades de negócio.
- Toda a tabela com `organization_id` tem `.enableRLS()` + `pgPolicy` com `tenantCheck` + índice em `organization_id`.
- Enums de estado guardados como `text`; os valores válidos vivem em `@obraos/shared` (uma só fonte, sem `ALTER TYPE` a cada mudança).

## Roles
| role | usado por | RLS |
|---|---|---|
| `obraos` (owner) | migrations, registo/login | bypass |
| `obraos_app` | todo o tráfego de negócio | aplicado |

## Tabelas Fase 0
`organizations`, `users` (global, sem RLS — acesso só via memberships), `memberships`, `clients`, `audit_logs` (só SELECT/INSERT para a app; UPDATE/DELETE negados por política).

Modelo alvo (Fases 1–4): `works`, `work_members`, `quotes`, `quote_items`, `tasks`, `task_comments`, `daily_logs`, `daily_log_photos`, `photos`, `expenses`, `payments`, `documents`, `document_versions`, `events` (agenda), `notifications`, `portal_tokens`.

## Fluxo de alteração
1. editar schema TS → 2. `pnpm db:generate` → 3. rever o SQL gerado → 4. `pnpm db:migrate` → 5. commit do SQL. Nunca alterar produção à mão.
