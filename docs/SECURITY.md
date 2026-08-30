# SECURITY

- **Isolamento de tenant:** RLS no Postgres + role sem BYPASSRLS + filtro explícito no repositório. Teste `test/tenancy.integration.test.ts` corre em CI.
- **Passwords:** argon2id. Login com mensagem única e verificação de hash mesmo quando o email não existe (sem oracle de existência).
- **Sessões:** token aleatório 256-bit; só o SHA-256 é guardado no Redis; revogação imediata (uma ou todas as sessões do utilizador). Cookie httpOnly, Secure em prod, SameSite=Lax.
- **CSRF:** SameSite=Lax + CORS com origem única + só JSON bodies. Reavaliar se surgirem formulários cross-site.
- **Rate limiting:** global 300/min por IP (Redis) + limites apertados em auth.
- **Headers:** helmet. CSP ativa em produção.
- **Validação:** Zod em todos os bodies/params; `bodyLimit` 1 MB.
- **Erros:** nunca stack traces; mensagens genéricas em produção.
- **Segredos:** só via env; `.env` ignorado; arranque falha se config inválida.
- **Audit log:** imutável para a app (políticas negam UPDATE/DELETE), escrito na mesma transação da ação.
- **Ficheiros:** nunca no Postgres; chaves S3 prefixadas por org; acesso por signed URL com TTL curto.
- **Portal do cliente:** tokens próprios (`portal_tokens`), nunca sessões de staff; só campos explicitamente autorizados.

Preparado para (não implementado): MFA, Google/Microsoft login (basta adicionar `identities` ligado a `users`).
