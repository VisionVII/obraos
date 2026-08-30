# ADR-0003 — Drizzle ORM

**Estado:** aceite · 2026-08-30

Escolhido sobre Prisma e Kysely. Motivo decisivo: `enableRLS()` e `pgPolicy` declarados no schema TypeScript, com migrations em SQL puro revisáveis em PR. Prisma obrigaria a manter as políticas RLS fora do schema e não suporta `SET LOCAL` de forma ergonómica por transação. Kysely daria o mesmo controlo mas sem geração de migrations.
