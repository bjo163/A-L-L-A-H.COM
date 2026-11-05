---
contract: unit
id: ADDON_MW_LLM_ROUTER
tier: addon
name: mw_llm_router
owner: ai-platform
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Multi-provider AI routing virtual keys and usage analytics
depends: [base]
models: [ai.provider, ai.model, ai.route, ai.virtual_key, ai.usage_log, ai.usage_daily, ai.semantic_cache, ai.thread, ai.message]
data: [data/index.ts]
installable: true
---

# mw_llm_router — Unit Contract

Data models for the multi-provider AI gateway: providers, models, named routes,
virtual keys, usage rollups, semantic cache, and chat threads/messages.

## Default data

`data/index.ts` (`loadDefaultData`) is the canonical single source for the
platform routing catalog at company_id 0, seeded in FK-safe order: providers
(keyed on `slug`), then models (`provider_id` resolved from the just-seeded
provider slugs, keyed on `model_id`), then routes (keyed on `alias`). Specs live
in `data/default.ts`.

The gateway plugin's lazy `seedDefaultsIfEmpty()` is now a guarded standalone-path
fallback marked `@deprecated`; it defers to these rows whenever the hub has
already seeded them. The platform master virtual key stays in the plugin because
its hash depends on a runtime secret.

## Models

Nine `ai.*` models registered by `registerMwLlmRouterAddon`; `models` mirrors
`__manifest__.json`.
