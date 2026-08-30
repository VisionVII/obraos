# API

Base: `/api/v1`. OpenAPI gerado automaticamente a partir dos schemas Zod: `GET /docs` (fora de produção).

## Convenções
- `GET` lista/lê · `POST` cria (201) · `PATCH` atualiza parcialmente · `DELETE` soft-delete (204).
- Autenticação por cookie `obraos_session` (httpOnly, SameSite=Lax). CORS restrito a `WEB_BASE_URL` com `credentials`.
- Erros sempre com a forma:
```json
{ "error": { "code": "CLIENT_NOT_FOUND", "message": "Cliente não encontrado.", "details": {} } }
```
Códigos em `@obraos/shared` (`ErrorCode`). Nunca stack traces.

## Endpoints Fase 0
| método | rota | perm |
|---|---|---|
| POST | /auth/register | — (rate limit 5/15min) |
| POST | /auth/login | — (10/15min) |
| POST | /auth/logout | sessão |
| GET | /auth/me | sessão |
| POST | /auth/email/verify | — (10/15min) |
| POST | /auth/email/resend | — (3/15min) |
| POST | /auth/password/forgot | — (3/15min) |
| POST | /auth/password/reset | — (10/15min) |
| POST | /auth/password/change | sessão (5/15min) |
| GET/POST | /clients | clients:read / clients:write |
| GET/PATCH/DELETE | /clients/:id | clients:read / clients:write |
| GET | /health, /ready | — |
