---
contract: "SPEC_DRIVEN_PLAN"
---
# Execution Tasks

## Implementation Phases

### Phase 1: Foundation and Infrastructure (Weeks 1-2)
- [ ] Set up router module structure in `addons/mw_llm_router/src/`
- [ ] Implement type definitions in `src/types.ts`
- [ ] Create in-memory cache layer in `src/cache/inmemory.ts`
- [ ] Implement provider base class in `src/providers/base.ts`
- [ ] Set up configuration schema in `config/providers.json`
- [ ] Initialize metrics collector in `src/metrics/collector.ts`
- [ ] Write unit tests for cache and types

### Phase 2: Provider Implementations (Weeks 3-4)
- [ ] Implement OpenAI provider in `src/providers/openai.ts`
- [ ] Implement Anthropic provider in `src/providers/anthropic.ts`
- [ ] Implement Together.ai provider in `src/providers/together.ts`
- [ ] Write provider integration tests with mocked responses
- [ ] Implement rate limiting per provider
- [ ] Test rate limit exhaustion and cooldown behavior

### Phase 3: Fallback and Caching (Weeks 5-6)
- [ ] Implement cache layer with TTL expiration
- [ ] Build fallback chain management in `src/fallback/chain.ts`
- [ ] Implement cache hit/miss tracking in metrics
- [ ] Write routing logic unit tests
- [ ] Test cache behavior: hit, miss, expiration, eviction
- [ ] Test fallback chain: sequential, conditional, health-aware

### Phase 4: API and Integration (Weeks 7-8)
- [ ] Implement `/v1/llm-router/run` endpoint
- [ ] Implement `/v1/llm-router/health` endpoint
- [ ] Integrate with `@allah/sdk` client methods
- [ ] Add Arsy hub service registration
- [ ] Write end-to-end tests with real provider mocks
- [ ] Document API contract for SDK consumers

### Phase 5: Hardening and Release (Weeks 9-10)
- [ ] Performance optimization: cache warming, batching
- [ ] Load testing: verify cache hit ratio ≥ 70%
- [ ] Security review: no prompt data leakage, input sanitization
- [ ] Final code review and refactoring
- [ ] Update documentation and `docs/` if needed
- [ ] Run full gate: `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`
- [ ] Mark capability as VERIFIED in BACKLOG.md

## Ordered and Independ Executable Tasks

| Task ID | Description | Phase | Dependencies |
|---|---|---|---|
| T-001 | Scaffold router module structure and package.json | 1 | None |
| T-002 | Implement type definitions (ProviderHealth, CacheEntry, RouterConfig) | 1 | T-001 |
| T-003 | Implement in-memory cache with TTL expiration | 1 | T-002 |
| T-004 | Create provider base class with common logic | 1 | T-002 |
| T-005 | Set up configuration schema and defaults | 1 | T-002 |
| T-006 | Implement OpenAI provider adapter | 2 | T-004, T-005 |
| T-007 | Implement Anthropic provider adapter | 2 | T-004, T-005 |
| T-008 | Implement Together.ai provider adapter | 2 | T-004, T-005 |
| T-009 | Implement rate limiting middleware | 2 | T-004 |
| T-010 | Build fallback chain management | 3 | T-003, T-006, T-007, T-008 |
| T-011 | Implement cache layer integration with routing | 3 | T-003, T-010 |
| T-012 | Implement `/v1/llm-router/run` endpoint | 4 | T-011, T-006, T-007, T-008 |
| T-013 | Implement `/v1/llm-router/health` endpoint | 4 | T-010, metrics collector |
| T-014 | Integrate with `@allah/sdk` `mwClient.llm.run()` | 4 | T-012 |
| T-015 | Write unit tests (router, cache, fallback, providers) | 1-4 | T-002 through T-011 |
| T-016 | Write integration tests (end-to-end with mocked providers) | 4 | T-012, T-014 |
| T-017 | Performance optimization and load testing | 5 | T-011, T-015, T-016 |
| T-018 | Security review and input sanitization | 5 | T-015, T-016 |
| T-019 | Full gate verification and BACKLOG update | 5 | All previous tasks |

## Parallelizable Workstreams

- **Provider implementations** (T-006, T-007, T-008) can run in parallel — each is independent
- **Cache and fallback** (T-003, T-010, T-011) can progress in parallel once provider bases exist
- **Unit tests** (T-015) can run in parallel across modules
- **Endpoint implementation** (T-012, T-013) depends on core logic being complete

## Required Files and Affected Modules

### New Files to Create

- `addons/mw_llm_router/src/index.ts` — Public API exports
- `addons/mw_llm_router/src/types.ts` — TypeScript type definitions
- `addons/mw_llm_router/src/router.ts` — Main routing pipeline
- `addons/mw_llm_router/src/cache/inmemory.ts` — In-memory cache with TTL
- `addons/mw_llm_router/src/cache/persistent.ts` — Persistent cache using arsY-ORM
- `addons/mw_llm_router/src/providers/base.ts` — Abstract provider base
- `addons/mw_llm_router/src/providers/openai.ts` — OpenAI adapter
- `addons/mw_llm_router/src/providers/anthropic.ts` — Anthropic adapter
- `addons/mw_llm_router/src/providers/together.ts` — Together.ai adapter
- `addons/mw_llm_router/src/fallback/chain.ts` — Fallback chain manager
- `addons/mw_llm_router/src/metrics/collector.ts` — Metrics collection
- `addons/mw_llm_router/src/metrics/exporter.ts` — Prometheus exporter
- `addons/mw_llm_router/config/providers.json` — Provider configuration
- `addons/mw_llm_router/tests/unit/router.test.ts` — Router unit tests
- `addons/mw_llm_router/tests/unit/cache.test.ts` — Cache unit tests
- `addons/mw_llm_router/tests/unit/fallback.test.ts` — Fallback unit tests
- `addons/mw_llm_router/tests/unit/provider.openai.test.ts` — OpenAI provider tests
- `addons/mw_llm_router/tests/unit/provider.anthropic.test.ts` — Anthropic provider tests
- `addons/mw_llm_router/tests/integration/router.integration.test.ts` — Router integration tests
- `addons/mw_llm_router/tests/e2e/end-to-end.test.ts` — End-to-end tests

### Modified Files

- `addons/mw_llm_router/index.ts` — Update exports (may already exist)
- `@allah/sdk/src/` — Add llm router client methods (minor updates)
- `BACKLOG.md` — Add new capability entry with VERIFIED status
- `.plans/20261104-2257-advanced-llm-router-feature/` — Planning documents (already created)

## Testing and Validation Procedures

### Unit Tests

- **Cache tests**: Test TTL expiration, key collision, hit/miss tracking, eviction order
- **Provider tests**: Test each provider adapter with mocked API responses
- **Fallback tests**: Test sequential fallback, conditional fallback, health-aware fallback
- **Router tests**: Test end-to-end routing logic with all components mocked

### Integration Tests

- **Full routing flow**: Real request from client through router to provider and back
- **Cache coherence**: Verify cache hits/misses match expected behavior under load
- **Fallback activation**: Verify fallback chain activates on various failure modes
- **Metrics accuracy**: Verify metrics are correctly incremented and exposed

### Required Test Commands

```bash
# Unit tests
pnpm --filter @moonwitness/mw_llm_router test:unit

# Integration tests  
pnpm --filter @moonwitness/mw_llm_router test:integration

# Full test suite
pnpm --filter @moonwitness/mw_llm_router test

# Type check
pnpm --filter @moonwitness/mw_llm_router typecheck

# Lint architectural
pnpm lint:arch
```

### Acceptance Criteria Verification

Each acceptance criterion must be verified:

- [ ] LR-001: LLM router module implemented — verify module loads without errors
- [ ] LR-002: Configurable fallback chains — test with disabled/failing primary provider
- [ ] LR-003: Cache with TTL — verify entries expire after configured duration
- [ ] LR-004: Cache hit ratio ≥ 70% — measure in unit tests with repeated requests
- [ ] LR-005: Fallback chain activates on failure — test primary provider timeout/error
- [ ] LR-006: Provider health metrics tracked — check metrics endpoint output
- [ ] LR-007: Per-provider rate limiting — verify quota exhaustion triggers cooldown
- [ ] LR-008: Metrics endpoint returns status — test `/v1/llm-router/health` response
- [ ] LR-009: Dynamic provider registration — add new provider via config only
- [ ] LR-010: All quality gates pass — lint:arch, typecheck, docs:check

## Documentation Requirements

- [ ] Update `addons/mw_llm_router/README.md` with usage examples
- [ ] Document provider configuration schema in `config/providers.json`
- [ ] Add API reference to SDK documentation
- [ ] Update `DECISIONS.md` with any new design decisions
- [ ] Add capability entry to `BACKLOG.md`
- [ ] Update `ROADMAP.md` if stage boundaries shift

## Quality Gates

- `pnpm lint:arch` — 0 warnings, no architectural violations
- `pnpm typecheck` — strict TypeScript, no errors
- `pnpm docs:check` — 100/100 required
- All unit tests pass
- All integration tests pass
- Performance: cache hit ratio ≥ 70% in test conditions
- Security: no prompt data leakage, input sanitization verified

## Completion Checklist

- [ ] All tasks T-001 through T-019 marked complete
- [ ] `pnpm lint:arch` passes with 0 warnings
- [ ] `pnpm typecheck` passes strictly
- [ ] `pnpm docs:check` passes 100/100
- [ ] Unit test suite passes (100% coverage of new code)
- [ ] Integration test suite passes
- [ ] Performance requirements met (cache hit ratio ≥ 70%)
- [ ] Security review completed (no data leakage)
- [ ] BACKLOG.md updated with new capability entry
- [ ] All acceptance criteria verified and checked
- [ ] Documentation updated (README, SDK docs, DECISIONS.md)
- [ ] Feature branch merged to `dev`
- [ ] Capability marked VERIFIED in BACKLOG.md