# ARCHITECTURE

## Camadas (apps/api)

```
Presentation   modules/*/**.routes.ts      valida (Zod), autoriza (RBAC), delega
Application    modules/*/**.service.ts     regras de negócio, transações, audit
Domain         packages/shared             enums, schemas, matriz RBAC — partilhado com web
Infrastructure infra/db, infra/cache, infra/storage
Core           core/config, core/errors, core/tenancy, core/rbac, core/http
```

Regra: rotas não fazem SQL; serviços não conhecem Fastify; repositórios só fazem SQL e recebem sempre uma `Tx` de tenant.

## Multi-tenancy (defesa em 3 níveis)
1. **RBAC** em `preHandler` — role → permission (matriz em `@obraos/shared`).
2. **Serviço** — `withTenant(orgId, tx => …)` abre transação com `SET LOCAL app.organization_id`.
3. **Postgres RLS** — políticas em cada tabela de negócio; a app liga com role `obraos_app` sem `BYPASSRLS`. Sem contexto → zero linhas.

## Fluxo de um pedido
```
cookie → authPlugin (Redis) → req.user
      → requireAuth → authorize(perm)
      → Service.withTenant → Repository → RLS
      → audit() na mesma transação
      → resposta / AppError → error-handler (sem stack traces)
```

## Frontend (apps/web)
`app/` (router, shell) · `features/<domínio>/` (páginas + hooks de dados) · `shared/ui` (design system) · `shared/api` (cliente HTTP único).
Estado servidor via TanStack Query; sem estado global de negócio no cliente. A matriz RBAC partilhada só esconde UI; a decisão real é sempre no backend.

## Extensibilidade planeada (não implementar sem autorização)
Novos módulos = pasta em `apps/api/src/modules/` + registo em `app.ts` + tabela com política RLS. WhatsApp/IA/pagamentos entram como módulos com as suas próprias portas (`*.port.ts`), como `storage.port.ts`.
