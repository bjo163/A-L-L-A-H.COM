---
contract: unit
id: PKG_ARSY_CORE
tier: package
name: @allah/arsy-core
owner: platform-core
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Shared kernel for response envelope errors logging and config
publicSurface: [logger, AppError, resolveLocalSecret]
depends: []
---

# @allah/arsy-core — Unit Contract

The shared kernel every backend package and app depends on: the response
envelope, the `AppError` type, structured `logger`, the DI container/kernel, the
request principal, and local secret/config resolution.

## Public surface

`logger`, `AppError`, `resolveLocalSecret` re-exported from `src/index.ts`
(`response`, `errors`, `logger`, `container`, `kernel`, `principal`, `config`).

## Depends

Workspace-internal dependencies: none. External runtime: `pino`.
