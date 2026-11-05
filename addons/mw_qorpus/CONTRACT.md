---
contract: unit
id: ADDON_MW_QORPUS
tier: addon
name: mw_qorpus
owner: knowledge
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Qorpus knowledge ingestion and RAG engine
depends: [base]
models: [qorpus.document, qorpus.chunk]
data: [data/index.ts]
installable: true
---

# mw_qorpus — Unit Contract

Knowledge ingestion and RAG chunking. Documents and chunks are tenant/user
content ingested at runtime, so this addon ships no platform reference rows.

## Default data

`data/index.ts` (`loadDefaultData`) is deliberately empty and returns `[]`. The
absence of default data is an explicit, manifest-declared choice, not a gap: the
`data` key lists the loader path and the loader is registered in
`DEFAULT_DATA_REGISTRY`, so `lint:arch` (ADDON_DEFAULT_DATA) confirms the intent.

## Models

`qorpus.document`, `qorpus.chunk`; `models` mirrors `__manifest__.json`.
