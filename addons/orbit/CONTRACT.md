---
contract: unit
id: ADDON_ORBIT
tier: addon
name: orbit
owner: cloud
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: ORBIT cloud compute and hosting customer experience
depends: [base]
models: [orbit.instance, orbit.template, orbit.volume]
data: [data/index.ts]
installable: true
---

# orbit — Unit Contract

Cloud compute and hosting: instances, templates, and volumes. These are tenant
compute resources provisioned at runtime, so the addon ships no platform reference
rows.

## Default data

`data/index.ts` (`loadDefaultData`) is declared empty (returns `[]`) on purpose, so
"no defaults" is an explicit decision verified by `lint:arch` (ADDON_DEFAULT_DATA).

## Models

Three `orbit.*` models; `models` mirrors `__manifest__.json`.
