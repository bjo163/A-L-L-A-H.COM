---
contract: unit
id: PKG_ARSY_PLUGIN_SDUI
tier: package
name: @allah/arsy-plugin-sdui
owner: product-design
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Server-driven UI plugin emitting skin-aware component trees
publicSurface: [sduiPlugin, SduiPluginOptions]
depends: [@allah/arsy-core, @allah/arsy-orm]
---

# @allah/arsy-plugin-sdui — Unit Contract

Fastify plugin that renders server-driven UI node trees for the design-system
skins, so the hub can emit skin-aware component payloads the front-end apps mount.

## Public surface

`sduiPlugin` (the registered plugin) and the `SduiPluginOptions` type.

## Depends

`@allah/arsy-core`, `@allah/arsy-orm`; external: `fastify`, `fastify-plugin`.
