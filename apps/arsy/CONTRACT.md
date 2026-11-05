---
contract: unit
id: APP_ARSY
tier: app
name: @allah/arsy
owner: platform-core
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Fastify API hub that boots addons migrates schema and seeds default data
routes: []
ports: [5150]
---

# @allah/arsy — Unit Contract

The backend hub. `buildArsyApp` connects the ORM engine, registers all addons in
dependency order, runs `SchemaMigrator.sync()` (which creates the `system` bot the
audit actor needs), and mounts the `/v1` API. `main.ts` then calls `runBootSeed()`
after build.

## Boot seeding

`src/seed.ts` builds a `SeedContext` (`repository` factory over `modelRegistry`,
`actor = SYSTEM_ACTOR`), walks `resolveSeedOrder()` and calls each addon's
`loadDefaultData` in dependency order with per-addon try/catch for boot
resilience. Demo rows are seeded only when `ARSY_SEED_DEMO === 'true'` and not in
production.

## Routes / ports

A Fastify service, not a Next app: no `src/app` route tree (routes are the `/v1`
API surface, listed in the OpenAPI docs at `/docs`). Default HTTP port 5150
(`PORT`).

## Container contract

The Docker builder and runner copy every addon because the hub loads the complete
addon registry at startup.
