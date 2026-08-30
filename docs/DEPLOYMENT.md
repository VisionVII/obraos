# DEPLOYMENT

## Ambientes
`development` (docker compose local) · `staging` · `production`.

## Requisitos
Node 22, Postgres 16 (com role `obraos_app` criado por `scripts/init-db.sql`), Redis 7, bucket S3-compatible, HTTPS terminado num proxy (`trustProxy: true`).

## Pipeline (CI em `.github/workflows/ci.yml`)
install → lint → typecheck → migrate → test (inclui isolamento RLS) → build.

## Deploy
1. `pnpm build` → `apps/api/dist` e `apps/web/dist`.
2. Aplicar migrations **antes** de arrancar a nova versão da API: `pnpm db:migrate` com `DATABASE_URL` do owner.
3. API: `node apps/api/dist/main.js`; expõe `/health` (liveness) e `/ready` (readiness com Postgres + Redis).
4. Web: servir `apps/web/dist` como estático com fallback para `index.html`.

## Backups
Postgres: snapshot diário + WAL. S3: versioning ligado. Testar restauro trimestralmente.
