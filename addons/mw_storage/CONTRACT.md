---
contract: unit
id: ADDON_MW_STORAGE
tier: addon
name: mw_storage
owner: platform-core
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: MoonWitness content-addressed storage models and legal retention hold
depends: [base]
models: [mw.storage.backend, ir.attachment, ir.legal.hold]
data: [data/index.ts]
installable: true
---

# mw_storage — Unit Contract

Content-addressed storage backends, attachments, and legal retention holds. These
are configured and created per deployment by operators, so the addon ships no
platform reference rows.

## Default data

`data/index.ts` (`loadDefaultData`) is declared empty (returns `[]`): storage
backends and attachments are operational records, not shipped defaults. The
explicit empty declaration is verified by `lint:arch` (ADDON_DEFAULT_DATA).

## Models

`mw.storage.backend`, `ir.attachment`, `ir.legal.hold`; `models` mirrors
`__manifest__.json`.
