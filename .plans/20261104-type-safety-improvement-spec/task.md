# Task — Remediation Implementation Plan — Type Safety & API Contract Consistency

## Implementation Phases and Ordered Tasks

### Phase 1: Define Shared Type Interfaces (`packages/types/src/index.ts`)

| Task ID | Task | Objective | Expected Changes | Dependencies | Validation | Completion Criteria |
|---------|------|-----------|------------------|--------------|------------|---------------------|
| T-001 | Define `SDUINodeProps` interface | Replace `props?: Record<string, any>` with explicit props type | Add `SDUINodeProps` interface to `packages/types/src/index.ts` | None | `pnpm typecheck` passes | Interface defined and exported |
| T-002 | Define `ToolResult` interface | Replace `output: any` with strict `unknown` type | Add `ToolResult` interface with `success: boolean`, `output: unknown`, `error?: string \| null`, `latencyMs?: number` to `packages/types/src/index.ts` | T-001 | `pnpm typecheck` passes | Interface defined and exported |
| T-003 | Define `Principal` interface | Add principal type for auth across ecosystem | Add `Principal` interface with `userId: number`, `ormUserId: number`, `companyId: number`, `role: string`, `email: string`, `sessionId?: number` | None | `pnpm typecheck` passes, `pnpm lint:arch` passes | Interface defined and exported |
| T-004 | Verify existing exports still work | Ensure no breaking changes to existing imports | Run `pnpm --filter @moonwitness/types typecheck` and check all dependent packages compile | T-001, T-002, T-003 | All dependent packages typecheck | No import errors, zero regressions |

### Phase 2: Fix ORM Row Typing (`packages/arsy-orm/`)

| Task ID | Task | Objective | Expected Changes | Dependencies | Validation | Completion Criteria |
|---------|------|-----------|------------------|--------------|------------|---------------------|
| T-005 | Define `AuthRow` interface | Create typed row shape for auth queries | Add `AuthRow` interface with `id: number`, `email: string`, `password_hash: string`, `status: 'active' \| 'disabled'` to `packages/arsy-orm/src/` | None | `pnpm --filter @allah/arsy-orm typecheck` passes | Interface defined and exported |
| T-006 | Refactor `BaseRepository.find()` | Replace `row as any` with typed access using generic constraint | Modify `packages/arsy-orm/src/repository.ts` `BaseRepository<T extends { id: number }>` to use `row.id` instead of `(row as any).id` | T-005 | `pnpm --filter @allah/arsy-orm typecheck` passes, build passes | No `as any` on row access, typecheck passes |
| T-007 | Refactor `_applyTranslations()` | Use typed row access throughout ORM | Modify `packages/arsy-orm/src/repository.ts` private methods to use `T` type constraints instead of `as any` | T-006 | `pnpm --filter @allah/arsy-orm typecheck` passes, build passes | All row access typed, no regressions |
| T-008 | Update ORM fields.ts if needed | Ensure `fields.ts` uses typed row access | Check and update `packages/arsy-orm/src/fields.ts` for `as any` patterns | T-005, T-006 | `pnpm --filter @allah/arsy-orm typecheck` passes | No `as any` on row fields, build passes |
| T-009 | Verify ORM build and tests | Ensure all ORM operations compile and run | Run `pnpm --filter @allah/arsy-orm build` and `pnpm --filter @allah/arsy-orm test` | T-005–T-008 | All build and test gates pass | Build succeeds, tests pass |

### Phase 3: Fix Auth Plugin Fastify Typing (`packages/arsy-plugin-auth/`)

| Task ID | Task | Objective | Expected Changes | Dependencies | Validation | Completion Criteria |
|---------|------|-----------|------------------|--------------|------------|---------------------|
| T-010 | Define `FastifyWithAuth` interface | Create typed Fastify interface with `resolvePrincipal` and `authenticate` | Add `FastifyWithAuth` interface extending `FastifyInstance` to `packages/arsy-plugin-auth/src/index.ts` | None | `pnpm --filter @allah/arsy-plugin-auth typecheck` passes | Interface defined and exported |
| T-011 | Replace `fastify as any` with typed cast | Replace all 3 occurrences of `fastify as any` with `(fastify as FastifyWithAuth)` | Modify `packages/arsy-plugin-auth/src/index.ts` lines 137, 374, 642 to use typed interface | T-010 | `pnpm --filter @allah/arsy-plugin-auth typecheck` passes, all `fastify as any` replaced | Zero `fastify as any` remaining, typecheck passes |
| T-012 | Verify auth plugin build | Ensure auth plugin compiles correctly | Run `pnpm --filter @allah/arsy-plugin-auth build` | T-011 | Build succeeds, typecheck passes | Build succeeds, typecheck passes |
| T-013 | Verify auth-dependent apps build | Ensure apps using auth compile | Run typecheck for apps/arsy, apps/id, apps/gate | T-011–T-012 | All apps typecheck | All affected apps compile without errors |

### Phase 4: Fix SDK MCP Response Validation (`packages/sdk/`)

| Task ID | Task | Objective | Expected Changes | Dependencies | Validation | Completion Criteria |
|---------|------|-----------|------------------|--------------|------------|---------------------|
| T-014 | Define MCP response Zod schema | Add Zod schema for MCP tool call responses | Import `z` from `zod`, define `mcpResponseSchema` in `packages/sdk/src/index.ts` | None | `pnpm --filter @allah/sdk typecheck` passes | Zod schema defined, parses valid MCP responses |
| T-015 | Replace `res as any` with schema validation | Replace `((res as any)?.result ?? ...)` with `mcpResponseSchema.parse(res)` | Modify `packages/sdk/src/index.ts` line 599 MCP call tool method | T-014 | `pnpm --filter @allah/sdk typecheck` passes, `pnpm --filter @allah/sdk test` passes | No `as any` on MCP response, typecheck and tests pass |
| T-016 | Verify SDK build and tests | Ensure SDK compiles and all tests pass | Run `pnpm --filter @allah/sdk build` and `pnpm --filter @allah/sdk test` | T-015 | All build and test gates pass | Build succeeds, tests pass |

### Phase 5: Fix LLM Adapter Zod Schemas (`packages/arsy-plugin-llm-gateway/`)

| Task ID | Task | Objective | Expected Changes | Dependencies | Validation | Completion Criteria |
|---------|------|-----------|------------------|--------------|------------|---------------------|
| T-017 | Define OpenAI response Zod schema | Add Zod schema for OpenAI LLM API response format | Add `openaiResponseSchema` in `packages/arsy-plugin-llm-gateway/src/adapters/openai.ts` | None | `pnpm --filter @allah/arsy-plugin-llm-gateway typecheck` passes | Zod schema defined, valid OpenAI responses parsed |
| T-018 | Define Anthropic response Zod schema | Add Zod schema for Anthropic LLM API response format | Add `anthropicResponseSchema` in `packages/arsy-plugin-llm-gateway/src/adapters/anthropic.ts` | T-017 | `pnpm --filter @allah/arsy-plugin-llm-gateway typecheck` passes | Zod schema defined, valid Anthropic responses parsed |
| T-019 | Define Gemini response Zod schema | Add Zod schema for Gemini LLM API response format | Add `geminiResponseSchema` in `packages/arsy-plugin-llm-gateway/src/adapters/gemini.ts` | T-017 | `pnpm --filter @allah/arsy-plugin-llm-gateway typecheck` passes | Zod schema defined, valid Gemini responses parsed |
| T-020 | Replace `as any` with schema parsing in all adapters | Replace `as any` with `schema.parse()` in openai.ts, anthropic.ts, gemini.ts | Modify all three adapter files to use Zod validation | T-017, T-018, T-019 | `pnpm --filter @allah/arsy-plugin-llm-gateway typecheck` passes, all adapters use Zod | Zero `as any` on LLM responses, typecheck passes, all schemas work |
| T-021 | Define CacheEntry interface | Add typed CacheEntry interface | Add `CacheEntry` interface with `model: string`, `expires_at: string \| number`, `hit_count: number`, `response_json: string`, `id: number` to `packages/arsy-plugin-llm-gateway/src/cache.ts` | None | `pnpm --filter @allah/arsy-plugin-llm-gateway typecheck` passes | Interface defined, typed property access replaces `as any` |
| T-022 | Fix agent loop type assumptions | Replace `as any` patterns in `packages/arsy-plugin-llm-gateway/src/agent/loop.ts` | Review and replace `as any` patterns with typed alternatives in agent orchestration layer | T-021 | `pnpm --filter @allah/arsy-plugin-llm-gateway typecheck` passes, agent loop compiles | No `as any` in agent loop, typecheck passes |

### Phase 6: Add Architecture Lint Rules (`@moonwitness/lint`)

| Task ID | Task | Objective | Expected Changes | Dependencies | Validation | Completion Criteria |
|---------|------|-----------|------------------|--------------|------------|---------------------|
| T-023 | Add `no-as-any` lint rule | Create rule that flags `as any` patterns in core packages | Add new rule to `@moonwitness/lint` configuration that detects `as any` patterns in `packages/arsy-plugin-auth`, `packages/arsy-orm`, `packages/sdk`, `packages/types`, `packages/arsy-plugin-llm-gateway` | None | `pnpm lint:arch` passes with zero violations on clean code | Rule implemented, configured correctly |
| T-024 | Add `no-record-any` lint rule | Create rule that flags `Record<string, any>` patterns where specific types available | Add new rule to `@moonwitness/lint` that flags `Record<string, any>` in `packages/types/src/index.ts` and other appropriate files | T-023 | `pnpm lint:arch` passes with zero violations | Rule implemented, `Record<string, any>` in types flagged |
| T-025 | Configure allowlist for legitimate `as any` | Allow `as any` only in designated files or with specific comments | Update lint rules configuration to allow `as any` in non-core files or with `@ts-expect-error` comments where genuinely needed | T-023, T-024 | `pnpm lint:arch` passes, allowlist works correctly | Rules enforce restrictions, legitimate uses still possible |
| T-026 | Verify lint rules don't break existing code | Ensure new lint rules don't cause false positives | Run `pnpm lint:arch` on full codebase, fix any false positives | T-023, T-024, T-025 | `pnpm lint:arch` passes with zero violations on full codebase | Full codebase lint passes, no regressions |

### Phase 7: Final Verification and Gates

| Task ID | Task | Objective | Expected Changes | Dependencies | Validation | Completion Criteria |
|---------|------|-----------|------------------|--------------|------------|---------------------|
| T-027 | Run full typecheck across monorepo | Verify `pnpm typecheck` passes across all 25 projects | Run `pnpm typecheck` from repository root | T-001–T-026 | `pnpm typecheck` passes with zero errors | All 25 tsconfig projects pass strict type checking |
| T-028 | Run full architecture lint | Verify `pnpm lint:arch` passes | Run `pnpm lint:arch` from repository root | T-023, T-024, T-025 | `pnpm lint:arch` passes with zero violations | All architectural lint rules pass |
| T-029 | Run all app builds | Verify all 6 apps build successfully | Run `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build`, `pnpm gate:build`, `pnpm --filter @allah/arsy build` | T-001–T-028 | All build gates pass | All 6 apps + arsy build successfully |
| T-030 | Run test suite for affected packages | Verify `pnpm test` passes for all changed packages | Run `pnpm --filter @moonwitness/types test`, `pnpm --filter @allah/arsy-orm test`, `pnpm --filter @allah/arsy-plugin-auth test`, `pnpm --filter @allah/sdk test`, `pnpm --filter @allah/arsy-plugin-llm-gateway test` | T-001–T-028 | All test suites pass | All affected package tests pass |
| T-031 | Verify no new `as any` patterns introduced | Confirm the plan eliminated targeted `as any` patterns | Grep for `as any` in the 5 core packages, confirm only legitimate remainders | T-001–T-030 | Zero `as any` in target files, any remaining are documented/allowlisted | Target files have zero `as any`, or all are documented |

## Dependencies and Execution Order

### Critical Path:
1. **T-001 → T-002 → T-003** (Define types in `packages/types/src/index.ts` first, as other phases depend on these interfaces)
2. **T-005 → T-006 → T-007 → T-008** (ORM typing requires `AuthRow` interface from Phase 1)
3. **T-010 → T-011 → T-012** (Auth Fastify typing requires `FastifyWithAuth` interface)
4. **T-014 → T-015 → T-016** (SDK MCP validation depends on schema definition)
5. **T-017 → T-018 → T-019 → T-020 → T-021** (LLM adapters build on each other, cache interface separate)
6. **T-023 → T-024 → T-025 → T-026** (Lint rules must be defined before final verification)
7. **T-027 → T-028 → T-029 → T-030 → T-031** (Final verification gates in order)

### Parallelizable Workstreams:
- **T-001, T-005, T-010, T-014** can start in parallel (they define independent interfaces in different packages)
- **T-017, T-018, T-019** (LLM adapter schemas) can proceed in parallel once T-001 is well underway
- **T-023, T-024** (lint rules) can start once enough type definitions are in place to identify `as any` patterns accurately

### Regression Test Dependencies:
- Each task's validation (`pnpm typecheck`, `pnpm lint:arch`, `pnpm build`, `pnpm test`) must pass before moving to the next task
- Failed validations create a blocker; revert and fix the specific change before proceeding
- Git bisect available to identify exact change causing any regression

## Completion Checklist

### Phase 1 Complete (Types):
- [ ] T-001: `SDUINodeProps` interface defined in `packages/types/src/index.ts`
- [ ] T-002: `ToolResult` interface defined in `packages/types/src/index.ts`
- [ ] T-003: `Principal` interface defined in `packages/types/src/index.ts`
- [ ] T-004: All dependent packages typecheck without errors

### Phase 2 Complete (ORM):
- [ ] T-005: `AuthRow` interface defined in `packages/arsy-orm/src/`
- [ ] T-006: `BaseRepository.find()` uses typed row access, no `row as any`
- [ ] T-007: `_applyTranslations()` uses typed row access, no `as any`
- [ ] T-008: `fields.ts` updated for typed row access, no `as any`
- [ ] T-009: ORM build and tests pass

### Phase 3 Complete (Auth):
- [ ] T-010: `FastifyWithAuth` interface defined in `packages/arsy-plugin-auth/src/index.ts`
- [ ] T-011: All 3 `fastify as any` replaced with `(fastify as FastifyWithAuth)`
- [ ] T-012: Auth plugin build succeeds
- [ ] T-013: All auth-dependent apps typecheck

### Phase 4 Complete (SDK):
- [ ] T-014: MCP Zod schema defined in `packages/sdk/src/index.ts`
- [ ] T-015: `res as any` replaced with `mcpResponseSchema.parse(res)`
- [ ] T-016: SDK build and tests pass

### Phase 5 Complete (LLM Gateway):
- [ ] T-017: OpenAI Zod schema defined in `adapters/openai.ts`
- [ ] T-018: Anthropic Zod schema defined in `adapters/anthropic.ts`
- [ ] T-019: Gemini Zod schema defined in `adapters/gemini.ts`
- [ ] T-020: All 3 adapters use Zod schema.parse() instead of `as any`
- [ ] T-021: `CacheEntry` interface defined in `cache.ts`, typed access replaces `as any`
- [ ] T-022: Agent loop `as any` patterns replaced with typed alternatives

### Phase 6 Complete (Lint Rules):
- [ ] T-023: `no-as-any` lint rule added to `@moonwitness/lint`
- [ ] T-024: `no-record-any` lint rule added to `@moonwitness/lint`
- [ ] T-025: Allowlist configured for legitimate `as any` usages
- [ ] T-026: Full codebase `pnpm lint:arch` passes with zero violations

### Phase 7 Complete (Verification):
- [ ] T-027: `pnpm typecheck` passes across all 25 projects
- [ ] T-028: `pnpm lint:arch` passes with zero violations
- [ ] T-029: All 6 apps + arsy build successfully
- [ ] T-030: All affected package tests pass
- [ ] T-031: Zero `as any` in target files, or all documented/allowlisted

### Overall Success:
- [ ] All 31 tasks completed with validation passing at each step
- [ ] Zero `as any` patterns in: `packages/arsy-plugin-auth/src/index.ts`, `packages/arsy-orm/src/repository.ts`, `packages/sdk/src/index.ts`, `packages/types/src/index.ts`
- [ ] Zero `Record<string, any>` in: `packages/types/src/index.ts` (replaced with specific interfaces)
- [ ] Architecture lint rules prevent new unsafe patterns
- [ ] All quality gates pass: `pnpm typecheck`, `pnpm lint:arch`, `pnpm lint`, all build gates, `pnpm ui:test`, `pnpm ui:contrast`, `pnpm docs:check`