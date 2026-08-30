# ADR-0002 — Fastify + Zod como framework de API

**Estado:** aceite · 2026-08-30

Escolhido sobre NestJS e Express. Motivo: validação Zod end-to-end com schemas partilhados com o frontend (`fastify-type-provider-zod`), OpenAPI gerado sem duplicação, melhor desempenho, e camadas explícitas (rotas/serviços/repositórios) sem DI/decorators mágicos — mais fácil de auditar. A modularidade pedida pela spec é obtida por convenção de pastas (`modules/<domínio>`), suficiente para a dimensão do produto. Revisitar se o número de módulos cruzados justificar um container de DI.
