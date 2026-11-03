# Tasks: ISP Product Phase 1 — Canonical Domain Models & Cross-Domain Contracts (Issue #7)

## 1. Domain Modeling & Specifications
- [x] Document domain boundaries between WORKS, NEXUS, SENTINEL, and HARBOR
- [x] Define subscription lifecycle state machine (`active`, `grace`, `suspended`, `expired`, etc.)
- [x] Define deterministic access decision matrix for RADIUS authentication

## 2. Shared Types Contracts (`packages/types`)
- [x] Add `IspPlanRecord` and `IspSubscriptionRecord` to `@moonwitness/types`
- [x] Add `NexusNasRecord` and `NexusIpPoolRecord` to `@moonwitness/types`
- [x] Add `SentinelAccountRecord` and `SentinelSessionRecord` to `@moonwitness/types`
- [x] Export all network/ISP contracts from `@moonwitness/types/src/index.ts`
- [x] Compile `@moonwitness/types` via `pnpm --filter @moonwitness/types build`

## 3. Verification & Monorepo Gates
- [x] Run `pnpm lint:arch` (Monorepo Architectural Invariants Gate)
- [x] Run `pnpm typecheck` (Strict TypeScript Gate)
- [x] Run `pnpm docs:check` (Documentation Contract Score 100/100)
- [x] Commit and prepare evidence for Issue #7 handoff

