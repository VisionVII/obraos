# ADR-0001 — Multi-tenancy com Row Level Security

**Estado:** aceite · 2026-08-30

## Contexto
SaaS multi-tenant; um único bug de `WHERE organization_id` num futuro módulo não pode expor dados de outra empresa.

## Decisão
Modelo shared-database/shared-schema com `organization_id` em todas as tabelas de negócio e **RLS ativo** desde a primeira migration. A app liga com role `obraos_app` (sem BYPASSRLS) e fixa o tenant por transação com `set_config(app.organization_id, …, true)` via `withTenant()`. Repositórios continuam a filtrar por `organization_id` (defesa em profundidade).

## Alternativas rejeitadas
- Schema por tenant: migrations × N, custo operacional desproporcionado para o segmento.
- Só filtros na aplicação: um esquecimento = fuga de dados.

## Consequências
Qualquer acesso fora de `withTenant` devolve zero linhas (falha segura). `users` fica global (sem RLS) porque um utilizador pode pertencer a várias organizações; o acesso é mediado por `memberships`. Registo/login usam `adminDb` por necessidade (pré-tenant) — único sítio autorizado.
