---
contract: "SPEC_DRIVEN_PLAN"
---
# Advanced LLM Router Integration with Caching and Fallback

## Design Specification

### High-Level Architecture

The LLM router follows a **pipeline pattern** with distinct stages:

```
Request Entry → Parameter Validation → Cache Lookup → Provider Selection → Provider Call → Fallback → Response Caching → Metrics → Response
```

### Component and Module Structure

```
addons/mw_llm_router/
├── src/
│   ├── index.ts           # Public API exports
│   ├── router.ts          # Main routing pipeline orchestration
│   ├── cache/             # Cache layer (TTL-based, keyed storage)
│   │   ├── inmemory.ts    # Simple in-memory cache
│   │   └── persistent.ts  # Persistent cache using @allah/arsy-orm
│   ├── providers/         # Provider adapters
│   │   ├── base.ts        # Abstract base class for all providers
│   │   ├── openai.ts      # OpenAI provider implementation
│   │   ├── anthropic.ts   # Anthropic provider implementation
│   │   └── together.ts    # Together.ai provider implementation
│   ├── fallback/          # Fallback chain management
│   │   └── chain.ts       # Fallback chain configuration and execution
│   ├── metrics/           # Metrics collection and export
│   │   ├── collector.ts   # Metrics collection
│   │   └── exporter.ts    # Prometheus format exporter
│   └── types.ts           # TypeScript type definitions
├── config/
│   └── providers.json     # Provider configuration (API keys, priorities, rate limits)
└── tests/
    ├── unit/
    │   ├── router.test.ts
    │   ├── cache.test.ts
    │   └── fallback.test.ts
    └── integration/
        └── router.integration.test.ts
```

### Package Boundaries and Responsibilities

| Package | Responsibility |
|---|---|
| `addons/mw_llm_router` | LLM routing pipeline, caching, fallback chains, metrics |
| `@allah/sdk` | Client methods that call the router (`mwClient.llm.run()`, `mwClient.llm.stream()`) |
| `@allah/arsy-orm` | Persistent storage of provider health metrics |
| `@moonwitness/ui` | Any configuration UI components |

### Data Models and Relationships

#### Provider Health Entity

```typescript
interface ProviderHealth {
  provider: string;        // e.g., "openai", "anthropic"
  model: string;           // e.g., "gpt-4o", "claude-3-opus"
  success_rate: number;    // Ratio of successful requests (0-1)
  latency_p95: number;     // 95th percentile latency in ms
  error_rate: number;      // Ratio of errored requests (0-1)
  last_health_check: Date; // Timestamp of last health check
  total_requests: number;  // Total requests tracked
  successful_requests: number; // Successful requests count
  errored_requests: number; // Errored requests count
}
```

#### Cache Entry Entity

```typescript
interface CacheEntry {
  key: string;             // Hash key (model:promptHash:temperature)
  response: string;        // Cached response content
  createdAt: Date;         // When cached
  expiresAt: Date;         // When entry expires
  requestId: string;       // Original request identifier
}
```

### API Contracts and Interfaces

#### Router Entry Point

```typescript
// POST /v1/llm-router/run
// Request: { model: string, prompt: string, temperature?: number, fallback?: boolean }
// Response: { response: string, cached: boolean, provider: string, latency: number }

// POST /v1/llm-router/health
// Response: { providers: ProviderHealth[] }
```

#### SDK Integration

```typescript
// Client method: mwClient.llm.run(request)
// - request.model: string (e.g., "gpt-4o", "claude-3-opus")
// - request.prompt: string
// - request.temperature?: number (default: 0.7)
// - request.fallback?: boolean (default: true)
// Returns: { response: string, cached: boolean, provider: string, latency: number }
```

### Data Flow and System Interactions

1. **Request Reception**: Client sends LLM request to `/v1/llm-router/run`
2. **Parameter Validation**: Model must be registered; prompt must not be empty
3. **Cache Lookup**: Compute hash = hash(model + prompt + temperature); check cache
4. **Cache Hit**: If found and not expired, return cached response with `cached: true`
5. **Provider Selection**: Choose provider based on priority, availability, and rate limit status
6. **Provider Call**: Execute request against selected provider
7. **Success Path**: Cache the response (keyed, with TTL), update provider health metrics, return response with `cached: false`
8. **Failure Path**: If provider fails, attempt next provider in fallback chain
9. **Final Failure**: If all providers fail, return aggregated error with last error details
10. **Metrics Update**: Increment request counters, update latency, success/error rates

### Integration Architecture

- **Arsy Hub**: Router registers as a service with `/health` and `/ready` endpoints
- **SDK**: Client methods automatically use the router; no breaking changes
- **Observability**: All metrics funneled through existing Prometheus pipeline
- **Configuration**: Provider configs stored in `config/providers.json`, hot-reloadable

### Error Handling and Failure Scenarios

| Scenario | Handling |
|---|---|
| Provider timeout (≥ 30s) | Cancel request, attempt fallback |
| Provider API error (4xx/5xx) | Log error, update health metrics, attempt fallback |
| All providers fail | Return last error with correlation ID; do not cache failure |
| Cache corruption | Invalidate entry, retry provider call |
| Rate limit exhaustion | Pause provider for configured cooldown, attempt fallback |
| Invalid model name | Return 400 with list of registered models |

### Security and Performance Considerations

- **Cache never stores raw API keys** — only prompt hash and response
- **Prompt data purged after TTL** — configurable per provider (default 5 minutes)
- **Rate limiting per provider** — prevents quota exhaustion, configurable requests/minute
- **Input sanitization** — prompt truncated at 100k characters max
- **Response size limit** — cached responses max 1MB to prevent memory exhaustion
- **Correlation IDs** — every request gets a unique ID for tracing

### Observability Strategy

- **Metrics exported** in Prometheus format via existing `/metrics` endpoint
- **Key metrics**:
  - `llm_requests_total` - total requests by provider and outcome
  - `llm_cache_hits_total` - cache hit count
  - `llm_cache_misses_total` - cache miss count
  - `llm_fallback_attempts_total` - fallback attempt count
  - `llm_quota_exhaustions_total` - rate limit exhaustion count
  - `llm_provider_success_rate` - per provider success ratio
  - `llm_provider_latency_p95` - per provider 95th percentile latency
- **Logging** structured JSON with correlation_id, provider, model, outcome
- **Health endpoints** `/v1/llm-router/health` and `/health` (Arsy hub)

### Technical Decisions and Alternatives

| Decision | Alternatives Considered | Why This Option |
|---|---|---|
| **In-memory cache + arsY-ORM persistent** | Redis, Memcached only | Simplicity for deployment; arsY-ORM already available; no external dependency |
| **TTL-based cache expiration** | Event-driven invalidation | Simpler; sufficient for LLM use case; prompts don't need real-time invalidation |
| **Hash-based cache keys (model:promptHash:temp)** | Full prompt as key | Avoids key space issues; prompt hashing allows caching across different prompt phrasings |
| **Fixed fallback chain** | Dynamic fallback based on real-time health | Configuration is simpler and more predictable; health data can update priorities |
| **Prometheus metrics** | Custom metrics format | Leverages existing observability infrastructure; team familiar with Prometheus |

### MoonWitness Ecosystem Adaptation

- Uses existing `@allah/arsy-ORM` for persistent health metric storage (consistent with data layer)
- Follows Moon UI design system conventions for any configuration UI
- Maintains the six-DNA skin consistency model for any visual router configuration
- Respects the one-unique-skin-per-app lint rule — router config is app-agnostic
- Aligns with engineering preferences: modular, reusable, strongly typed, documented

### Git and Branch Workflow Requirements

- Feature branch: `feature/llm-router-advanced-{timestamp}`
- Must pass `pnpm lint:arch` and `pnpm typecheck` before merge
- Requires code review with at least 2 approvals
- Merge to `dev` only after all acceptance criteria met
- Update `BACKLOG.md` with new capability entry

### Validation Requirements Before Marking Tasks Complete

1. Run `pnpm --filter @moonwitness/jizz build` — must succeed
2. Run `pnpm --filter @moonwitness/types build` — must succeed
3. Run `pnpm --filter @moonwitness/ui build` — must succeed
4. Run `pnpm lint:arch` — must pass with 0 warnings
5. Run `pnpm typecheck` — must pass strictly
6. Run unit tests: `pnpm --filter @moonwitness/jizz test`
7. Run integration tests: verify caching, fallback, and metrics
8. Verify `/v1/llm-router/health` endpoint returns expected structure
9. Verify cache hit ratio ≥ 70% in unit tests
10. Verify fallback chain activates on provider failure