---
contract: unit
id: PKG_ARSY_PLUGIN_STORAGE
tier: package
name: @allah/arsy-plugin-storage
owner: platform-core
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Content-addressed storage Fastify plugin and hashing store
publicSurface: [storagePlugin, ContentAddressedStorage, StoragePluginOptions]
depends: [@allah/arsy-core, @allah/arsy-orm]
---

# @allah/arsy-plugin-storage — Unit Contract

Fastify plugin and `ContentAddressedStorage` service backing the `mw_storage`
models: content-addressed put/get and legal-hold-aware retention.

## Public surface

`storagePlugin`, `ContentAddressedStorage`, `StoragePluginOptions`.

## Depends

`@allah/arsy-core`, `@allah/arsy-orm`; external: `fastify`, `fastify-plugin`.
