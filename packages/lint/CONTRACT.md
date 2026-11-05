---
contract: unit
id: PKG_LINT
tier: package
name: @moonwitness/lint
owner: qa
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Architecture and style gate tooling run as pnpm lint:arch
publicSurface: []
depends: []
---

# @moonwitness/lint — Unit Contract

The architectural gate engine (`check-architecture.mjs`) and style baseline that
`pnpm lint:arch` runs. It introspects addon manifests, `defineModel` declarations,
app skin roots, and now the default-data registry and unit-contract consistency.

## Public surface

Empty by design: this package is executed as CLI scripts, not imported as a
library, so it exposes no runtime API surface.

## Depends

None (workspace-internal or otherwise).
