---
contract: unit
id: PKG_ARSY_PLUGIN_LLM_GATEWAY
tier: package
name: @allah/arsy-plugin-llm-gateway
owner: ai-platform
version: 1.0.0
status: released
last_verified: 2026-11-05
summary: Multi-provider LLM routing gateway with caching usage and circuit breaking
publicSurface: [SmartRouter, GatewayCache, UsageManager, deviceControlPlugin, validateUrlSsrf, ssrfSafeFetch]
depends: [@allah/arsy-core, @allah/arsy-orm, @moonwitness/types]
---

# @allah/arsy-plugin-llm-gateway — Unit Contract

The AI gateway Fastify plugin: strategy-based routing across providers with
fallback chains, semantic and TTL caches, usage accounting, circuit breaking, and
SSRF-guarded adapters.

The resolver-aware SSRF implementation is owned by `@allah/arsy-core` and
re-exported here for gateway callers.

## Public surface

`SmartRouter`, `GatewayCache`, `UsageManager`, `deviceControlPlugin` (plus the
`llmGateway` plugin and adapters).

## Default data note

The canonical platform routing catalog (providers / models / routes) now lives in
the `mw_llm_router` addon dataset and is boot-seeded by the hub. This package's
`seedDefaultsIfEmpty()` is a guarded standalone-path fallback marked
`@deprecated`; it defers to the addon rows when present. The package must not
import addon code, so a synced fallback copy remains intentionally.

## Depends

`@allah/arsy-core`, `@allah/arsy-orm`, `@moonwitness/types`; external: `fastify`,
`fastify-plugin`, `undici`.
