---
contract: "SPEC_DRIVEN_PLAN"
---
# Implementation Rules & Agent Guardrails

## Mandatory Architectural Invariants

1. **Single Source of Truth for Provider Configuration** — All LLM provider definitions live in `config/providers.json`. No provider hardcoding in route handlers or API endpoints. Configuration is the only way to add/remove/ modify providers.

2. **Cache Never Stores Sensitive Data** — Cache entries store only: (a) prompt hash, (b) model name, (c) response text. Never store raw API keys, system prompts, or any personally identifiable information. All cache entries expire via TTL automatically.

3. **Fallback Chain Respects Rate Limits** — When a provider is exhausted (rate limit), it is paused for the configured cooldown period. Fallback chain skips paused providers but does not mark them as "failed" permanently — they recover after cooldown.

4. **Strong Typing Across all Modules** — All TypeScript types must be complete and strict. No `any` types in public interfaces. Use exact types for ProviderHealth, CacheEntry, RouterConfig, and all internal structures.

5. **Arsy Hub Integration Pattern** — The LLM router registers as an Arsy service via the standard pattern: `/health` and `/ready` endpoints, service discovery via hub, and metric exposure through the existing Prometheus pipeline.

6. **Backward Compatibility** — SDK client methods `mwClient.llm.run()` and `mwClient.llm.stream()` must remain functionally identical after the router integration. Existing code must not require changes to compile or run.

7. **One-Way Data Flow** — Request pipeline is unidirectional: Entry → Validation → Cache → Provider → Fallback → Caching → Metrics → Response. No circular dependencies between pipeline stages.

## Coding Conventions and Repository Standards

### TypeScript Conventions

- All new files must use TypeScript strict mode (`--strict` flag)
- Interface names must use PascalCase (e.g., `ProviderHealth`, `CacheEntry`)
- Function and variable names must use camelCase (e.g., `providerHealth`, `cacheEntry`)
- Enum names must use SCREAMING_SNAKE_CASE (e.g., `PROVIDER_STATUS`)
- Type aliases for complex types must be defined at module level with documentation JSDoc

### Import Ordering

1. Internal modules (same package): `../types`, `../cache`, `../providers`
2. Package dependencies: `@allah/arsy-orm`, `@moonwitness/ui`, `@allah/sdk`
3. External utilities: `crypto`, `lodash`, `date-fns`
4. Third-party: `hono`, `zod`, `prom-client`

### File Organization

- Each provider gets its own file: `openai.ts`, `anthropic.ts`, `together.ts`
- Cache implementations in `cache/` subdirectory
- Fallback logic in `fallback/chain.ts`
- Metrics in `metrics/` subdirectory
- Configuration in `config/` directory (JSON for runtime, TS for types)

### Naming Conventions

- Cache keys: `model:promptHash:temperature` format (string)
- Provider identifiers: lowercase kebab-case or short identifier (e.g., "openai", "anthropic")
- Fallback chain items: ordered array with `provider` and `condition` fields
- Metric names: `llm_` prefix followed by descriptive name (e.g., `llm_requests_total`, `llm_cache_hits_total`)

## Package Boundaries and Dependency Rules

### Allowed Dependencies (addons/mw_llm_router)

- `@allah/arsy-orm` — for persistent health metric storage
- `@moonwitness/ui` — for any UI configuration components
- `@allah/sdk` — for client integration (read-only, type references only)
- `hono` — for HTTP route handlers (existing in addon)
- `zod` — for request validation (existing in addon)
- `prom-client` — for metrics export
- `date-fns` — for date handling
- `lodash` — for utility functions

### Prohibited Dependencies

- `redis` — avoid external cache server dependency; use in-memory + arsY-ORM
- `memcached` — same reason
- `opossum` — circuit breaker library; implement fallback natively
- `kafkajs` — message broker; not needed for router pattern
- Any OAuth or auth library beyond what Arsy hub provides

### Dependency Direction

- `addons/mw_llm_router` → `@allah/arsy-orm` (downward: router uses ORM)
- `@allah/sdk` → `addons/mw_llm_router` (downward: SDK calls router)
- `addons/mw_llm_router` — NO outward dependencies on apps/*
- `apps/*` — NO inward dependencies on `addons/mw_llm_router` (apps use SDK which uses router)

### Circular Dependency Prevention

- Never import from `apps/*` into `addons/mw_llm_router`
- Never import from `addons/mw_llm_router` into `apps/*` directly — go through `@allah/sdk`
- All cross-package communication goes through defined API contracts

## Reusability and Modularity Requirements

### Module Responsibility Boundaries

| Module | Responsibility | Not Responsible |
|---|---|---|
| `addons/mw_llm_router/router.ts` | Orchestrate pipeline stages | Provider implementation details |
| `addons/mw_llm_router/providers/openai.ts` | OpenAI API calls | Cache management, fallback logic |
| `addons/mw_llm_router/cache/inmemory.ts` | TTL-based in-memory storage | Provider selection, routing decisions |
| `addons/mw_llm_router/fallback/chain.ts` | Fallback chain execution | Provider health tracking, rate limiting |
| `addons/mw_llm_router/metrics/collector.ts` | Metrics collection | Routing logic, provider calls |

### Extension Points

- **New providers**: Add implementation file + register in `config/providers.json` — no code changes beyond that
- **New cache strategies**: Implement `CacheStrategy` interface in `cache/` — router uses interface, not concrete
- **New fallback strategies**: Implement `FallbackStrategy` interface in `fallback/` — chain uses interface
- **Custom rate limit policies**: Extend rate limiter config in `providers.json` — no code change needed

### Plugin/Layered Architecture

The router follows a **layered architecture** where each layer has a single responsibility:
1. **Presentation** (API routes) — Hono handlers, validation, response formatting
2. **Logic** (router.ts) — Pipeline orchestration, cache check, fallback decision
3. **Data** (providers/) — Provider-specific API calls, request/response transformation
4. **Storage** (cache/) — TTL-managed key-value storage
5. **Metrics** (metrics/) — Collection and export of observability data

No layer knows implementation details of another layer beyond its interface.

## Naming Conventions

### Module Names

- `addons/mw_llm_router/src/index.ts` — Public API barrel file
- `addons/mw_llm_router/src/types.ts` — Type definitions
- `addons/mw_llm_router/src/router.ts` — Main routing pipeline
- `addons/mw_llm_router/src/cache/inmemory.ts` — Simple in-memory cache
- `addons/mw_llm_router/src/cache/persistent.ts` — Persistent cache using ORM
- `addons/mw_llm_router/src/providers/base.ts` — Abstract base class
- `addons/mw_llm_router/src/providers/openai.ts` — OpenAI adapter
- `addons/mw_llm_router/src/providers/anthropic.ts` — Anthropic adapter
- `addons/mw_llm_router/src/providers/together.ts` — Together.ai adapter
- `addons/mw_llm_router/src/fallback/chain.ts` — Fallback chain manager
- `addons/mw_llm_router/src/metrics/collector.ts` — Metrics collector
- `addons/mw_llm_router/src/metrics/exporter.ts` — Prometheus exporter

### Type Names

- `ProviderHealth` — Provider success/ error metrics
- `CacheEntry` — Single cached response entry
- `RouterConfig` — Overall router configuration
- `ProviderConfig` — Individual provider configuration
- `FallbackChain` — Ordered list of fallback providers
- `CacheStrategy` — Interface for cache implementations
- `FallbackStrategy` — Interface for fallback strategies

### API Endpoint Names

- `POST /v1/llm-router/run` — Execute LLM request with routing
- `POST /v1/llm-router/health` — Get per-provider health status
- `GET /v1/llm-router/cache/stats` — Cache statistics (hit/miss ratios)
- `GET /metrics` — Prometheus metrics endpoint (inherited from Arsy hub)

### Configuration File Keys

- `providers.json` structure:
  ```json
  {
    "providers": {
      "openai": {
        "priority": 1,
        "rateLimit": { "requestsPerMinute": 1000 },
        "health": { "successRateThreshold": 0.95 },
        "ttl": 300
      },
      "anthropic": { ... }
    },
    "fallbackChain": [ "openai", "anthropic", "together" ]
  }
  ```

## API and Database Rules

### API Route Rules

- All LLM router routes prefixed with `/v1/llm-router`
- Routes must return JSON responses only
- Error responses follow standard format: `{ error: string, correlationId: string, retryAfter?: number }`
- Successful run response: `{ response: string, cached: boolean, provider: string, latency: number, correlationId: string }`
- Health response: `{ providers: ProviderHealth[] }`

### Request Validation Rules

- Model name must be registered in `config/providers.json`
- Prompt must not be empty (after trimming)
- Prompt max length: 100,000 characters
- Temperature must be between 0 and 2 (inclusive)
- If temperature not provided, default to 0.7
- Top-p and frequency_penalty optional, validated if provided

### Cache Rules

- Cache key = `sha256(model + promptHash + temperature)` — hex string, consistent across requests
- Cache TTL per provider, default 300 seconds (5 minutes), configurable per provider
- Cache on successful responses only — never cache errors or failures
- Cache entries automatically expire via TTL — no manual cleanup required in most cases
- Maximum cache size: 10,000 entries — LRU eviction if exceeded

### Provider Health Rules

- Health tracked per (provider, model) combination
- success_rate = successful_requests / total_requests (range 0-1)
- latency_p95 computed from last 100 request latencies
- error_rate = errored_requests / total_requests (range 0-1)
- Health checked on every request — update metrics after each completion
- If success_rate falls below threshold (configurable, default 0.95), provider moved to lower priority in fallback chain

## Security and Privacy Requirements

### Data Protection

- **Never store raw API keys** in code, config, or cache. Keys read from environment variables at runtime.
- **Prompt data purged after TTL** — cache entries expire automatically, no manual cleanup.
- **Response size limit** — cached responses max 1MB; larger responses not stored.
- **Input sanitization** — prompt truncated at 100k characters; SQL injection, XSS patterns stripped.
- **Correlation IDs** — every request gets unique ID for tracing; never log raw prompts without correlation ID.

### Authentication and Authorization

- LLM router routes require verified principal (Arsy hub auth middleware)
- Different models may have different access levels per tenant
- Superusers can configure all providers; regular users limited to approved models
- Rate limits apply per tenant, not just globally

### Threat Mitigation

- **Prompt injection prevention** — strip common prompt injection patterns before provider call
- **Response size limits** — prevent memory exhaustion from large provider responses
- **Rate limiting** — prevent API abuse and quota exhaustion
- **Timeout handling** — 30s max per provider call; cancel and fallback on timeout
- **DoS protection** — rate limits per tenant; burst protection via token bucket

## Testing and Quality Requirements

### Test Coverage minimums

- **Unit tests**: ≥ 80% line coverage for all new `.ts` files
- **Integration tests**: Full routing flow with mocked providers
- **E2E tests**: One complete integration test exercising cache hit, cache miss, and fallback

### Testing Standards

- Use `tsx --test` for test execution (project standard)
- All test files must have `.test.ts` suffix
- Test descriptions must be descriptive (not just `test('should...')`)
- Mock external dependencies (provider APIs) — never test against real APIs
- Test data must be deterministic (fixed prompts, fixed models)

### Quality Gate Commands

```bash
# Lint architectural compliance
pnpm lint:arch

# TypeScript strict check
pnpm typecheck

# Documentation contract check
pnpm docs:check

# Run all tests for the addon
pnpm --filter @moonwitness/mw_llm_router test

# Build the addon
pnpm --filter @moonwitness/mw_llm_router build
```

### Test Data Requirements

- Fixed prompts for deterministic testing (e.g., "Design a user interface for a task manager")
- Fixed models per provider (e.g., "gpt-4o", "claude-3-opus-20240229")
- Fixed temperatures (0.0, 0.7, 1.0) for consistent caching behavior
- Fixed rate limit configurations for testing exhaustion scenarios

## Performance Constraints

### Latency Requirements

- **Cache hit**: ≤ 100ms (from cache retrieval + response formatting)
- **Cache miss + provider call**: ≤ 5s (including timeout and fallback)
- **Full fallback chain** (all providers fail): ≤ 30s (overall request timeout)
- **Metrics endpoint**: ≤ 50ms response time

### Throughput Requirements

- **Concurrent requests**: ≥ 50 simultaneous without degradation
- **Cache TTL**: Default 300s (5 minutes), configurable per provider
- **Rate limit window**: Per-minute counter; reset at minute boundary

### Resource Constraints

- **Memory**: Cache max 10,000 entries × avg 500 bytes = ~5MB
- **CPU**: Minimal overhead — cache lookup is O(1), provider call is external
- **Disk**: Persistent cache using arsY-ORM stored in WASM PGlite — same as other ORM data

## Backward Compatibility Requirements

### SDK Compatibility

- `mwClient.llm.run(request)` signature unchanged
- `mwClient.llm.stream(request)` signature unchanged
- No breaking changes to types in `@allah/sdk`
- Existing client code compiles without modifications

### Configuration Compatibility

- Existing `config/providers.json` (if present) must be migratable
- New fields have sensible defaults; no required fields for migration
- Backward-compatible addition of new providers (add to config, no code change)

### Data Compatibility

- No breaking changes to database schemas (uses existing arsY-ORM patterns)
- Health metrics stored using existing identity/audit patterns
- Cache does not alter existing data models

## Forbidden Patterns and Anti-Patterns

### Forbidden Patterns

1. **Hardcoding provider API keys** in source code or commit history
2. **Direct database queries** outside of `@allah/arsy-ORM` patterns
3. **Circular imports** between `addons/mw_llm_router` and `apps/*`
4. **Cache bypass** — never add code path that skips cache for "special" requests
5. **Provider preference based on cost alone** — use configured priority, not hardcoded values
6. **Sync HTTP calls** in an async/await project — always use async/await
7. **`any` types** in public interfaces or exported types
8. **Inline provider logic** in route handlers — always go through router module

### Anti-Patterns (discouraged but not banned)

1. **Over-engineering** — don't add caching/fallback if not needed for the use case
2. **Hardcoded fallback order** — prefer configuration-driven fallback chains
3. **Infinite fallback** — fallback chain must have a maximum depth and return graceful error if all fail
4. **No timeout** — always set reasonable timeouts on provider calls
5. **Cache as primary storage** — cache is transient; use arsY-ORM for persistent data

## Agent Execution Boundaries

### What This Agent Can Do

- Create, edit, and organize planning documents in `.plans/`
- Research codebase structure and existing implementations
- Design architecture specifications and type definitions
- Write unit test skeletons and integration test frameworks
- Propose code organization and dependency structures
- Identify quality gates and validation requirements

### What This Agent Cannot Do (Without Explicit User Authorization)

- Edit application source code in `apps/*`
- Modify existing production API routes beyond the `addons/mw_llm_router` package
- Install external dependencies (e.g., `npm install redis`)
- Modify `package.json` files or dependency configurations
- Deploy or publish any code
- Create GitHub Issues or Pull Requests
- Modify CI/CD workflow configurations
- Change authentication or authorization policies beyond the defined rules

### Git and Branch Workflow Requirements

- Feature branch naming: `feature/llm-router-advanced-{YYYYMMDD-HHMMSS}`
- All changes must be committed with descriptive messages
- Pre-commit: `pnpm docs:check` must pass
- Pre-push: `pnpm lint:arch` + `pnpm typecheck` must pass
- Merge to `dev` requires 2+ approvals from team members
- After merge: update `BACKLOG.md` with VERIFIED status for new capability
- Tag release: `v0.1.0-llm-router-advanced` after successful verification

## Validation Requirements Before Marking Tasks Complete

Before any task can be marked complete, the following must be verified:

1. **Code compiles**: `pnpm --filter @moonwitness/mw_llm_router typecheck` passes with 0 errors
2. **Architectural compliance**: `pnpm lint:arch` passes with 0 warnings
3. **Documentation compliance**: `pnpm docs:check` passes 100/100
4. **Unit tests pass**: All new unit tests pass (run with `pnpm --filter @moonwitness/mw_llm_router test:unit`)
5. **Integration tests pass**: All new integration tests pass (run with `pnpm --filter @moonwitness/mw_llm_router test:integration`)
6. **Performance verified**: Cache hit ratio ≥ 70% measured in test conditions
7. **Security reviewed**: No prompt data leakage, input sanitization verified
8. **End-to-end flow works**: Full request cycle from SDK call through router to provider and back
9. **Backward compatibility verified**: Existing SDK code compiles and runs without changes
10. **Acceptance criteria met**: All LR-* criteria checked and verified

### Classification Before Completion

- **READY**: All 10 validation requirements above met
- **CONDITIONALLY READY**: 7-9 requirements met; 1-2 minor open issues documented
- **NOT READY**: Fewer than 7 requirements met; essential architecture or testing unresolved