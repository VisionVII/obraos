# ADR-0004 — Vite + React SPA (PWA), sem SSR

**Estado:** aceite · 2026-08-30

O backoffice é privado e o portal do cliente vive atrás de links com token; não há valor em SEO/SSR. Uma SPA instalável (PWA) com cache de assets responde melhor ao contexto "telemóvel na obra com rede fraca". Se no futuro houver páginas públicas de marketing, vivem num site separado, não nesta app.
