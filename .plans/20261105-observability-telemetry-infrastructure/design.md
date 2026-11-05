---
contract: "DOCUMENTATION_CONTRACT.md"
id: "OBSERVABILITY_TELEMETRY_INFRASTRUCTURE_DESIGN"
version: "1.0.0"
owner: "platform"
status: "proposed"
---

# Design: Observability & Telemetry Infrastructure

## High-Level Architecture

The observability infrastructure follows a **provider-abstraction pattern** with a core `@allah/observability` package that defines interfaces and default implementations, allowing applications to swap providers without code changes.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   dock (app)    │  │  headquarter    │  │   id (app)      │ │
│  └───────▲─────────┘  └───────▲─────────┘  └───────▲─────────┘ │
│          │                  │                  │               │
│  import  │                  │ import          │ import        │
│  @allah/ │                  │ @allah/         │ @allah/       │
│  observability            observability      observability │
│          │                  │                  │               │
└──────────┼──────────────────┼──────────────────┼───────────────┘
           │                  │                  │               │
┌────────────▼─────────────┼────────────▼─────────────▼─────────────┐
│                    Shared Package Layer                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    @allah/observability                     │ │
│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │
│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  │  │                                                       │ │ │
│  │  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │ │
│  │  │   │  Logging  │  │  Metrics    │  │  Tracing    │ │ │ │
│  │  │   │           │  │             │  │             │ │ │ │
│  │  │   └─────────────┘  └─────────────┘  └─────────────┘ │ │ │
│  │  │       ▲               ▲               ▲           │ │ │
│  │  │       │               │               │           │ │ │
│  │  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │ │
│  │  │   │Provider:    │  │Provider:    │  │Provider:    │ │ │ │
│  │  │   │Winston/     │  │Prometheus/  │  │OpenTelemetry│ │ │ │
│  │  │   │Bunyan       │  │Exposition   │  │Exporter     │ │ │ │
│  │  │   └─────────────┘  └─────────────┘  └─────────────┘ │ │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │ │
└─────────────────────────────────────────────────────────────────┘
```

## Component and Module Structure

### `packages/observability/`

```
packages/observability/
├── src/
│   ├── index.ts                    # Public API exports
│   ├── logging/
│   │   ├── logger.ts              # Core logger implementation
│   │   ├── formatters.ts          # JSON format serialization
│   │   └── providers/
│   │       ├── winston.provider.ts  # Winston-based transport
│   │       └── bunyan.provider.ts   # Bunyan transport
│   ├── metrics/
│   │   ├── metrics.ts             # Metrics facade implementation
│   │   ├── types.ts               # Metric type definitions
│   │   └── exporters/
│   │       └── prometheus.exporter.ts # Prometheus exposition format
│   └── tracing/
│       ├── correlation-id.ts      # Correlation ID generation/middleware
│       ├── context.ts             # Context management (thread-local storage)
│       └── middleware/
│           └── express.middleware.ts # Express request correlation
├── types/
│   ├── logger.types.ts            # Logger TypeScript types
│   ├── metric.types.ts            # Metric TypeScript types
│   └── tracing.types.ts           # Tracing TypeScript types
├── config/
│   ├── observability.config.ts    # Configuration interface
│   └── defaults.ts                # Default configuration values
└── tests/
    ├── unit/
    │   ├── logger.unit.test.ts
    │   ├── metrics.unit.test.ts
    │   └── tracing.unit.test.ts
    └── integration/
        └── end-to-end.test.ts
```

### Key Interfaces

#### Logger Interface

```typescript
interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  child(context: Record<string, unknown>): Logger; // Logger child with context
}
```

#### Metrics Interface

```typescript
interface Metrics {
  increment(label: string, value?: number): void;
  decrement(label: string, value?: number): void;
  gauge(label: string, value: number): void;
  histogram(label: string, value: number, timestamps?: number[]): void;
  meter(name: string): MetricMeter; // For compound metrics
}
```

#### Tracing / Correlation ID Interface

```typescript
interface CorrelationContext {
  traceId: string;      // UUID v4
  spanId: string;       // UUID v4 (partial)
  parentSpanId?: string;
  startedAt: number;    // Timestamp
}

function getCorrelationId(): string;      // Get current request's trace ID
function setCorrelationId(id: string): void; // Set for testing/context propagation
function withCorrelationId<T>(id: string, fn: () => T): T; // Context manager
```

## Package Boundaries and Responsibilities

### `@allah/observability` (Core Package)

**Responsibilities:**
- Define core interfaces (Logger, Metrics, CorrelationContext)
- Provide default implementations with sensible defaults
- Abstract away provider-specific details (Winston, Prometheus, OpenTelemetry)
- Export TypeScript types for application consumption
- Configuration validation and default application
- Health endpoint metadata provision

**Responsibilities NOT included:**
- Actual transport configuration (Winston transports, Prometheus endpoints)
- Dashboard or visualization building
- APM vendor integration specifics
- Business metric definitions

### Application-Specific Integration

Each application integrates `@allah/observability` via:

```typescript
// Minimal integration example
import { initObservability, getLogger, getMetrics, getCorrelationId } from '@allah/observability';

initObservability({
  serviceName: 'dock',
  environment: process.env.NODE_ENV,
  // Optional: customize providers
  logger: {
    transport: new Winston transports.ConsoleTransport(),
  },
  metrics: {
    exporter: new PrometheusExporter({ port: 9464 }),
  },
});

const logger = getLogger();
const metrics = getMetrics();

// All requests automatically get correlation IDs via middleware
```

## Data Models and Relationships

### Log Entry Structure

```json
{
  "timestamp": "2026-11-05T14:30:00.123Z",
  "level": "info",
  "message": "HTTP request completed",
  "service": "dock",
  "environment": "production",
  "trace_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "request_id": "req-123456",
  "module": "pages/index.tsx",
  "duration_ms": 45
}
```

### Metric Data Structure

```
Metric Types:
  - Counter: monotonically increasing, +1 or +N
  - Gauge: current value at a point in time
  - Histogram: distribution observation (count, sum, bucket boundaries)
  - Summary: similar to histogram, quantile-focused

Metric Label Structure:
  - service: application name
  - environment: development/production/staging
  - handler: API endpoint or route handler
  - method: HTTP method
  - status: HTTP status code category
```

### Correlation Context Structure

```typescript
interface CorrelationContext {
  traceId: string;       // Unique per request (UUID v4)
  spanId: string;        // Per-segment identifier (UUID v4)
  parentSpanId?: string; // Parent segment, if nested
  startedAt: number;     // monotonically increasing timestamp
  labels?: Record<string, string>; // Custom key-value pairs
}
```

## API Contracts and Interfaces

### Public API Exports (`packages/observability/src/index.ts`)

```typescript
// Logging
export { initObservability, getLogger, Logger } from './logging';
export type { Logger, LogContext, LogEntry } from './types/logger';

// Metrics
export { initMetrics, getMetrics, Metrics } from './metrics';
export type { Metrics, Metric, MetricLabel } from './types/metric';

// Tracing
export {
  getCorrelationId,
  setCorrelationId,
  withCorrelationId,
  CorrelationContext
} from './tracing';
export type { CorrelationContext } from './types/tracing';
}

// Configuration
export { ObservabilityConfig, defaultConfig } from './config';
export type { ObservabilityConfig } from './config/types';
```

### Key Functions

| Function | Description |
|---|---|
| `initObservability(config)` | Initialize the observability system with configuration |
| `getLogger()` | Get the default logger instance |
| `getMetrics()` | Get the default metrics instance |
| `getCorrelationId()` | Get the current request's correlation ID |
| `withCorrelationId(id, fn)` | Execute fn with correlation ID context |
| `captureError(error, context)` | Capture error with stack and context |
| `isHealthy()` | Check if observability system is healthy |

## Data Flow and System Interactions

### Request Flow with Observability

```
1. HTTP Request arrives at application
2. Express/Next.js middleware injects correlation ID
3. Correlation ID stored in thread-local context
4. All subsequent logging automatically includes trace_id
5. All metrics tagged with current trace_id (if available)
6. Downstream HTTP calls propagate correlation ID via custom header
7. Response includes timing info tagged with correlation ID
8. Error handling captures stack + correlation context
9. Final response sent with observability data attached
```

### Metric Reporting Flow

```
Application code → metrics.increment('requests.total') →
Metrics facade → Provider → Buffer → Exporter →
Prometheus endpoint (/metrics) → HTTP GET → Scraping
```

### Error Capture Flow

```
Error thrown → captureError(error, { context, severity }) →
⟹ Stack trace captured ⟹
⟹ Correlation ID attached ⟹
⟹ Error sent to central collector ⟹
⟹ Visible in unified error dashboard
```

## Integration Architecture

### Next.js Middleware Integration

```typescript
// next-middlewares/observability.ts
import { withCorrelationId, getCorrelationId } from '@allah/observability';
import type { NextResponse } from 'next/server';

export function observabilityMiddleware(req: Request, next: (req: Request) => NextResponse) {
  const traceId = crypto.randomUUID();
  setCorrelationId(traceId);

  const response = next(req);

  // Add trace ID to response headers for client propagation
  response.headers.set('x-trace-id', traceId);

  return response;
}
```

### Express Integration

```typescript
// express middleware
import { withCorrelationId, getCorrelationId } from '@allah/observability';

app.use((req, res, next) => {
  const traceId = crypto.randomUUID();
  setCorrelationId(traceId);
  next();
});
```

### Provider Pattern

Applications can swap the default logging/metrics provider:

```typescript
// Custom Winston transport
import { createLogger, WinstonTransport } from '@allah/observability';

const logger = createLogger({
  transports: [
    new Winston.transports.Console({ format: Winston.format.json() }),
    new MyCustomTransport({ endpoint: 'https://logs.mycompany.com' })
  ]
});
```

## Error Handling and Failure Scenarios

### Logging Failures

| Scenario | Handling |
|---|---|
| Transport connection failure | Best-effort: log to stderr as fallback, do not throw |
| Format serialization error | Best-effort: serialize minimal data, continue |
| Configuration missing | Use defaults, warn once during initialization |

### Metrics Failures

| Scenario | Handling |
|---|---|
| Exporter connection failure | Best-effort: keep buffered metrics, retry on next cycle |
| Label validation error | Skip metric, warn, continue operation |
| Buffer overflow | Drop oldest metrics, warn, continue |

### Tracing Failures

| Scenario | Handling |
|---|---|
| Correlation ID generation failure | Generate best-effort UUID, continue |
| Context propagation failure | Continue without correlation ID, warn |
| Downstream propagation failure | Best-effort: add header, do not block request |

### Graceful Degradation

- If observability system fails, application continues running normally
- Failed transmissions are buffered and retried asynchronously
- No observability data = application still functional (degraded mode)
- Health endpoint reports `observability: degraded` status

## Security and Performance Considerations

### Security

- **No sensitive data in logs**: Automatic redaction of passwords, tokens, PII
- **Correlation ID length**: UUID v4 (36 chars) - no information leakage
- **Metric labels**: Validate and sanitize all label values; reject embedded newlines
- **Health endpoint**: Does not expose internal system details, only status flags
- **Configuration**: Environment variables only; no hardcoded secrets

### Performance

- **Logging overhead**: < 1ms per log operation (async write)
- **Metric collection**: < 0.5ms per increment/gauge operation
- **Correlation ID**: Generated once per request, stored in thread-local (negligible)
- **Memory impact**: Bounded buffer size for metrics (default: 1000 entries)
- **GC pressure**: Minimal - string allocations limited to log entries and metric labels

### Observability Overhead Budget

| Operation | Target Overhead | Actual (target) |
|---|---|---|
| `logger.info()` | < 1ms | ~0.3ms |
| `metrics.increment()` | < 0.5ms | ~0.15ms |
| `getCorrelationId()` | < 0.1ms | ~0.05ms |
| `captureError()` | < 2ms | ~1ms (includes stack capture) |
| Middleware per request | < 2ms total | ~1ms |

## Technical Decisions and Alternatives

### Decision: Provider Abstraction Over Direct Vendor Integration

**Alternative considered**: Direct Winston/Prometheus/OpenTelemetry integration in each application.

**Why rejected**: Duplicate configuration, inconsistent patterns, harder to maintain, vendor lock-in.

**Decision**: Single abstraction layer with default providers; applications can swap providers via configuration.

### Decision: Thread-Local Context Over Distributed Tracing (Initial Version)

**Alternative considered**: Full OpenTelemetry collector/provider infrastructure from the start.

**Why rejected**: Higher complexity, more dependencies, longer time-to-value; can be added later.

**Decision**: Start with thread-local correlation IDs for simplicity; OpenTelemetry can be layered on top later.

### Decision: Prometheus Exposition Format Over OpenTelemetry Metrics (Initial Version)

**Alternative considered**: OpenTelemetry Protocol (OTLP) for metric export.

**Why rejected**: Simpler format, wider Prometheus ecosystem support, lower initial complexity.

**Decision**: Prometheus exposition format for now; OTLP can be added as alternative exporter later.

### Decision: JSON Log Format Over Custom Binary Format

**Alternative considered**: Custom binary log format for performance.

**Why rejected**: Human readability, ecosystem tooling (Elasticsearch, Splunk, Logstash), easier debugging.

**Decision**: JSON format for balance of readability and structure.

### Decision: Async Best-Effort Over Synchronous Guarantees

**Alternative considered**: Synchronous log/metric writes with acknowledgment.

**Why rejected**: Request latency impact, single point of failure, complex error handling.

**Decision**: Async best-effort with buffering; reliability comes from retries and retries, not synchronous guarantees.

## Observability Strategy

### Logging Strategy

- **Structured JSON**: All logs emit as JSON with consistent schema
- **Correlation ID**: Every log entry includes trace_id from current request context
- **Log Levels**: `error > warn > info > debug` with environment-sensitive defaults
- **Destination**: Configurable per environment (console, file, remote collector)
- **Redaction**: Automatic redaction of known sensitive patterns

### Metrics Strategy

- **Prometheus Exposition**: Standard format for scraping
- **Metric Buckets**: Well-defined label set (service, environment, handler, method, status)
- **Rate Limiting**: Configurable per-service to prevent metric storms
- **Histogram Buckets**: Pre-defined percentiles (50th, 90th, 95th, 99th)
- **Counter Reset**: Not supported in production; counters are monotonically increasing

### Tracing Strategy

- **Correlation IDs**: UUID v4 per HTTP request
- **Propagation**: Via `x-trace-id` header on outgoing HTTP calls
- **Span Context**: Minimal (trace_id + span_id), can be extended to OpenTelemetry later
- **Trace Search**: Enable searching by trace_id in log aggregation system

### Health Check Strategy

- **Endpoints**: `/health` (basic) and `/api/observability/health` (detailed)
- **Components**: Service status, dependency health, observability system health
- **Observability Metadata**: Version, environment, configuration summary
- **Degraded Mode**: Reports partial functionality without failing

## Design Summary

The observability infrastructure provides a shared `@allah/observability` package with:

1. **Structured JSON logging** with correlation IDs and consistent format
2. **Metrics facade** with Prometheus exposition format
3. **Correlation ID propagation** via thread-local context and HTTP headers
4. **Error capture** with stack traces and context attachment
5. **Health endpoints** with observability metadata
6. **Provider abstraction** for flexible vendor integration
7. **Full TypeScript typings** with strict mode compatibility
8. **Performance-conscious design** (< 1ms overhead per operation)
9. **Security-first approach** (redaction, no sensitive data in logs)
10. **Roadmap alignment** (Stages 3-4 support)

The design minimizes unnecessary complexity while providing the foundation for cross-application observability, unified dashboards, and improved production debugging capabilities.