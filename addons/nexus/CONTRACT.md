---
contract: unit
id: ADDON_NEXUS
tier: addon
name: nexus
owner: network
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Network inventory and MikroTik NAS registry foundation
depends: [base]
models: [nexus.site, nexus.device, nexus.nas, nexus.ip_pool, nexus.nas_secret_log]
data: [data/index.ts]
installable: true
---

# nexus — Unit Contract

Network inventory: sites, devices, MikroTik NAS entries, IP pools, and NAS secret
audit logs. These are the operator's real network records, discovered or entered
per deployment, so the addon ships no platform reference rows.

## Default data

`data/index.ts` (`loadDefaultData`) is declared empty (returns `[]`). The absence
is deliberate and manifest-declared, verified by `lint:arch` (ADDON_DEFAULT_DATA).

## Models

Five `nexus.*` models; `models` mirrors `__manifest__.json`.
