---
contract: unit
id: PKG_ARSY_PLUGIN_AUTH
tier: package
name: @allah/arsy-plugin-auth
owner: security
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Fastify authentication principal-guard and JWT plugin
publicSurface: [authPlugin, createPrincipalGuard, AuthPluginOptions]
depends: [@allah/arsy-core, @allah/arsy-orm]
---

# @allah/arsy-plugin-auth — Unit Contract

Fastify plugin that authenticates requests and attaches the verified principal
(company scope, user id) used by the ORM's tenant scoping and audit actor.

## Public surface

`authPlugin` (the registered plugin), `createPrincipalGuard` (per-route guard),
and the `AuthPluginOptions` type.

## Depends

`@allah/arsy-core`, `@allah/arsy-orm`; external: `@fastify/jwt`, `bcryptjs`,
`better-auth`, `fastify`, `fastify-plugin`.
