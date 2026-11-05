---
contract: "DOCUMENTATION_CONTRACT.md"
id: "OBSERVABILITY_TELEMETRY_INFRASTRUCTURE_RULES"
version: "1.0.0"
owner: "platform"
status: "proposed"
---

# Rules: Observability & Telemetry Infrastructure

## Mandatory Architectural Invariants

These rules are non-negotiable and must be enforced throughout the entire implementation. Violation of any rule requires explicit approval from the platform team and documented justification.

### Logging Invariants

1. **JSON Format Mandatory**: All log entries must be serialized as structured JSON with exactly the following fields: `timestamp`, `level`, `message`, `service`, `environment`, `trace_id`. No custom log formats are permitted in production.

2. **Correlation ID Required**: Every log entry must include a `trace_id` field. Applications must not emit log entries without a correlation ID. The only exception is during system initialization before the observability system is ready (logged as `warn` with explanation).

3. **No Sensitive Data in Logs**: Log entries must not contain passwords, API keys, tokens, or PII. The logger must automatically redact known sensitive patterns (`password`, `token`, `secret`, `key` followed by `=`, `Bearer`, hex strings longer than 32 chars). Violation requires a explicit baseline exception documented in `.husky/pre-commit`.

4. **Log Level Hierarchy**: Log levels must follow `error > warn > info > debug`. In production, the default level must be `info`; `debug` must only be emitted when `NODE_ENV` is explicitly set to `development` or `local`.

5. **Service Identifier Required**: Every log entry must include a `service` field identifying the application name. The `service` value must come from the observability configuration, not be hardcoded per-log-call.

### Metrics Invariants

6. **Prometheus Exposition Format**: All metrics must be exposable in Prometheus text format via the `/metrics` endpoint. Custom metric formats are not permitted.

7. **Metric Label Whitelist**: Metric labels must only include whitelisted values: `service`, `environment`, `handler`, `method`, `status`. No arbitrary labels are permitted without explicit approval and documentation in the configuration.

8. **Counter Monotonicity**: Counters must be monotonically increasing. Resetting or decrementing counters in production is forbidden without an explicit migration plan documented and approved.

9. **Metric Buffer Bounded**: The internal metric buffer must have a maximum size (default: 1000 entries). When the buffer is full, oldest metrics may be dropped with a single warning log. No unbounded metric accumulation is permitted.

### Tracing Invariants

10. **UUID v4 Correlation IDs**: Correlation IDs must be UUID v4 format (36 characters, hyphens included). No custom ID formats are permitted in the `trace_id` field.

11. **Thread-Local Context Propagation**: Correlation IDs must be propagated via thread-local storage within a single process. For cross-process propagation, the ID must be transmitted via the `x-trace-id` HTTP header on all outgoing requests.

12. **Correlation ID Scope**: The correlation ID scope is per-HTTP-request. It must be set at the start of request handling and cleared at the end. No global or persistent correlation ID state is permitted.

### Package Boundary Invariants

13. **`@allah/observability` is the Single Source of Truth**: All applications must use the `@allah/observability` package for logging, metrics, and tracing. Direct use of winston, prom-client, or other observability libraries directly in application code is forbidden.

14. **No Circular Dependencies**: The `@allah/observability` package must not import from any application-specific code. It may only import from `@allah/types`, `@allah/sdk`, and Node.js standard library.

15. **Package Exports Stability**: The public API of `@allah/observability` must not change without a major version bump and migration guide. Semantic versioning must be strictly followed.

### Security and Privacy Invariants

16. **Redaction Before Log Entry**: Sensitive data must be redacted at the logger level, not at the application level. The logger must automatically strip known sensitive patterns before emitting log entries.

17. **No PII in Metrics**: Metric labels must not contain personally identifiable information (PII). Any required user-context metrics must use hashed or anonymized values.

18. **Health Endpoint Data Minimization**: The `/api/observability/health` endpoint must return only: `status`, `service`, `environment`, `version`, `dependencies`, `observability`. No internal system details, stack traces, or configuration values are permitted.

19. **Configuration via Environment Variables Only**: All observability configuration must be driven by environment variables. No hardcoded configuration values in source code are permitted.

20. **Secrets Never in Configuration**: The observability configuration must never contain secrets, keys, or tokens. Any required authentication must use separate secret management (Vault, KMS, etc.) with configuration referencing only names/IDs, not values.

### UI/UX and Design System Invariants

21. **PALETTE_PURITY**: Application CSS must not target Tailwind palette hues directly. All colors for observability-related UI (health endpoint responses, metrics displays) must come from design tokens or component variants.

22. **STYLE_PURITY**: No application CSS may target private `mw-*` class names. Observability-related styles must use `data-slot` attributes or public design-system components.

23. **ICON_PURITY**: Third-party icon libraries must only be imported by `packages/ui/src/components/icon.tsx`. Custom observability icons must use the design-system `Icon` component.

24. **Route State Parity**: Every app must ship `error.tsx`, `loading.tsx`, and `not-founded.tsx` built from `StatePanel`. Observability-related loading states must follow this pattern.

### Testing Invariants

25. **TypeScript Strict Mode**: All new code must pass `pnpm typecheck` in strict mode with 0 errors. No `// @ts-ignore` comments are permitted in new observability code.

26. **Unit Test Coverage**: All new functions in `@allah/observability` must have unit test coverage. Minimum 80% statement coverage per module.

27. **Architectural Invariant Lint**: `pnpm lint:arch` must pass with 0 warnings. Any new rule addition must be reviewed and approved.

28. **No Performance Regressions**: Logging and metrics operations must have < 1ms overhead. Performance regression tests must be included in the CI gate.

### Git and Branch Workflow Invariants

29. **Branch Naming**: All feature work must be on branches named `feat/observability-*` or `fix/observability-*`. No observability work on `main` or `dev` branches directly.

30. **Commit Scope**: Commits must only modify files within the scope of the observability feature. The commit message must start with `observability: ` followed by a concise description.

31. **Pre-commit Hooks**: `.husky/pre-commit` must run `pnpm lint:arch` and `pnpm typecheck` on staged observability files. Pre-commit must pass before any commit is allowed.

32. **No Production Docker Builds Locally**: Production Docker images must not be built locally for testing observability. Use the existing CI Docker builds.

### Agent Execution Boundaries

33. **Plan-Only Operation**: This plan is for architecture and task planning only. No production source code may be modified during the planning phase. Implementation is a separate execution task.

34. **Rule.md as Source of Truth**: The rules documented in this file are the source of truth for observability implementation. Any ambiguity or contradiction must be resolved with the platform team before implementation begins.

35. **Cross-Reference Accountability**: All cross-references between spec.md, design.md, task.md, and rule.md must be consistent. Contradictions between documents must be resolved before the plan is considered complete.

## Coding Conventions and Repository Standards

### TypeScript Conventions

- All new files must use TypeScript with strict mode enabled
- Interface names must use PascalCase (e.g., `ObservabilityConfig`, `Logger`, `Metrics`)
- Function names must use camelCase (e.g., `initObservability`, `getLogger`, `increment`)
- Type names must use PascalCase with descriptive suffix (e.g., `MetricType`, `LogLevel`)
- JSDoc documentation for all public functions and interfaces

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Package | `@allah/`-prefixed | `@allah/observability` |
| File | camelCase with `.ts` extension | `logger.ts`, `metrics.ts` |
| Interface | PascalCase | `ObservabilityConfig`, `CorrelationContext` |
| Type alias | PascalCase | `LogEntry`, `MetricLabel` |
| Function | camelCase | `initObservability`, `getLogger`, `captureError` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_BUFFER_SIZE`, `MAX_LOG_LEVEL` |
| Enum | PascalCase with `_` prefix if needed | `LogLevel`, `MetricType` |

### API Convention

- All public functions must have JSDoc documentation
- All interfaces must be exported from `packages/observability/src/index.ts`
- All type exports must be grouped under a `types` sub-path export
- Error objects must extend `Error` and include a `code` property

### Documentation Conventions

- All new functions must have JSDoc with: parameter descriptions, return value description, throws description
- All configuration options must be documented with defaults and environment variable mappings
- All acceptance criteria must be traceable to a requirement in spec.md
- All cross-document references must use the document ID (e.g., `[spec.md]`, `[design.md]`)

## API and Database Rules

### API Rules

1. **Request Lifecycle**: All HTTP requests must have a correlation ID set before any business logic executes. The middleware must be the first middleware in the chain.

2. **Error Response Format**: All API errors must return JSON with `error`, `message`, `path`, and `timestamp` fields. Observability-related errors must also include a `trace_id` field.

3. **Rate Limiting**: Metric emission must be rate-limited per service to prevent metric storms. Default rate: 1000 events/second per service, configurable via environment.

4. **Idempotency**: Metric operations must be idempotent. Incrementing a counter by 1 twice must yield the same result as incrementing by 2 once (within the buffering system).

### Database Rules (if applicable)

- No direct database schema changes required for this feature
- Any observability data storage must use the existing database connection patterns
- No new migrations required in the initial version

## UI/UX and Design-System Consistency

### Observability UI Patterns

1. **Health Endpoint Response**: The `/api/observability/health` endpoint must return a JSON response with consistent styling matching the application's design system. No custom CSS or arbitrary values.

2. **Metrics Display**: Any UI displaying metrics must use the design system's typography and color tokens. No hardcoded colors or font sizes.

3. **Loading States**: Observability-dependent UI components must follow the `StatePanel` pattern with `error.tsx`, `loading.tsx`, and `not-found.tsx`.

4. **Responsive Behavior**: Metrics dashboards and health displays must be responsive and work on mobile and desktop viewports.

### Design Token Usage

- Colors: Use tokens from `packages/ui/src/theme.css` or `packages/ui/src/tokens/`
- Typography: Use design-system type scale, not arbitrary `font-size` values
- Spacing: Use design-system spacing scale, not arbitrary `margin`/`padding` values
- Shadows: Use design-system shadow tokens, not arbitrary `box-shadow` values

## Performance Constraints

### Logging Performance

- **Per-entry overhead**: < 1ms in production (async write)
- **Batch operations**: < 5ms for batch of 100 entries
- **Format serialization**: < 0.5ms per log entry JSON serialization
- **No synchronous I/O**: All log writes must be non-blocking

### Metrics Performance

- **Per-operation overhead**: < 0.5ms for increment/decrement/gauge
- **Exposition generation**: < 2ms for full `/metrics` endpoint response
- **Buffer flush**: < 10ms per flush cycle
- **No blocking on exporter failure**: Failed transmissions must not block the event loop

### Tracing Performance

- **Correlation ID generation**: < 0.1ms (UUID v4)
- **Context storage/retrieval**: < 0.05ms (thread-local)
- **Middleware overhead**: < 2ms total per request (including all observability operations)
- **No CPU-intensive operations**: No synchronous work in request pipeline

## Backward Compatibility Requirements

### Migration Path for Existing Applications

1. **Gradual Adoption**: Applications can adopt `@allah/observability` incrementally. Old logging patterns remain functional alongside new ones during migration.

2. **Configuration Defaults**: Default configuration must work without any application code changes. Applications opt-in by calling `initObservability(config)`.

3. **Logger Interfaces**: The logger interface must remain backward-compatible. Existing `console.log`, `winston`, or `pino` usage must not break when the package is introduced.

4. **Versioned API**: Major version bumps (`@allah/observability@2.0.0`) may include breaking changes with a published migration guide. Minor/patch versions must be backward-compatible.

### Known Breaking Changes (Future)

- None identified for initial version (`1.0.0`)
- Breaking changes will be documented in `CHANGELOG.md` with migration instructions

## Forbidden Patterns and Anti-Patterns

### Forbidden Patterns

| Pattern | Reason | Alternative |
|---|---|---|
| `console.log()` with arbitrary objects | No structured format, no correlation ID, no redaction | Use `logger.info()` from `@allah/observability` |
| Direct `winston` import in app code | Breaks package boundary, duplicate configuration | Import from `@allah/observability`; configure via package |
| `prom-client` direct usage without facade | Inconsistent metric patterns, no standardization | Use `@allah/observability` metrics facade |
| Custom correlation ID formats | Inconsistent tracing, broken cross-service debugging | Use UUID v4 from `@allah/observability` |
| Hardcoded service names in logs | Inconsistent, cannot filter by service | Use configuration-driven `service` field |
| Arbitrary metric labels | Prometheus format violation, dashboard issues | Use whitelisted labels only |
| Sensitive data in log messages | Security vulnerability, data leak | Use logger redaction; redact before emission |
| Global correlation ID state | Request scoping violation, cross-request contamination | Use thread-local per-request scope |

### Anti-Patterns (Discouraged but Not Fully Forbidden)

| Pattern | Reason | Mitigation |
|---|---|---|
| OpenTelemetry integration (initial version) | Over-engineering for phase 1; can be added later | Defer to post-1.0.0; use correlation IDs for now |
| Synchronous log writes | Performance impact on request latency | Keep async; synchronous only for startup/logging |
| Unbounded metric buffering | Memory pressure, OOM risk | Bounded buffer with drop-oldest policy |
| Custom log formats per application | Inconsistent debugging, broken dashboards | Standardize on JSON format from package |

## Agent Execution Boundaries

### What This Plan Does NOT Authorize

- Editing application source code during planning phase
- Creating implementation files in target applications
- Modifying production configuration or deployment systems
- Running Docker builds or Docker compose locally
- Creating GitHub Issues, Projects, or milestones
- Modifying package.json files in applications
- Running `pnpm install` or modifying dependency trees
- Deploying applications to any environment
- Modifying CI/CD workflow files

### What This Plan DOES Authorize

- Creating planning artifacts in `.plans/` directory
- Designing architecture and specifications
- Defining rules and constraints
- Documenting acceptance criteria
- Creating task breakdowns for implementation
- Generating documentation and reports
- Verifying quality gates (read-only inspection)
- Providing guidance for implementation teams

### Validation Requirements Before Marking Tasks Complete

Before any task in `task.md` can be marked complete, the following must be verified:

1. **Code Review**: All new code has been reviewed for architectural compliance
2. **Type Check**: `pnpm typecheck` passes with 0 errors in strict mode
3. **Arch Lint**: `pnpm lint:arch` passes with 0 warnings
4. **Unit Tests**: All new functions have unit test coverage (min. 80% statement coverage)
5. **Integration Verification**: Application integration points verified manually or via test
6. **Performance Baseline**: Logging/metrics overhead measured and < 1ms confirmed
7. **Security Review**: No sensitive data paths identified; redaction verified
8. **Cross-Document Consistency**: All four documents (spec.md, design.md, task.md, rule.md) are synchronized
9. **Success Metrics**: Verified against acceptance criteria in spec.md
10. **Report Evidence**: report.md generated with verifiable evidence of all verifications

## Git and Branch Workflow Requirements

### Branch Strategy

1. **Feature Branches**: All observability work must be on branches named:
   - `feat/observability-core` - Core package development
   - `feat/observability-dock` - Dock application integration
   - `feat/observability-headquarter` - Headquarter application integration
   - `feat/observability-remaining` - Remaining apps integration

2. **Branch from**: Each feature branch must be created from `dev` branch.

3. **Branch Naming Format**: `feat/observability-<component>` where `<component>` is one of: `core`, `dock`, `headquarter`, `remaining`, `documentation`, `tests`.

### Commit Guidelines

1. **Commit Message Format**: `observability: <description>`
   - Example: `observability: add core logger with JSON format and correlation ID`

2. **Scope Limitation**: Commits must only modify files within the observability feature scope:
   - `packages/observability/` - Core package
   - `apps/*/src/` - Application source files (observability-related changes only)

3. **Pre-commit Verification**: Before committing, run:
   ```bash
   pnpm lint:arch
   pnpm typecheck --filter @allah/observability
   ```
   Both must pass with 0 errors/warnings.

4. **No Sweep Commit**: Do not use `git commit --no-verify` or `git commit -m "WIP"` messages that sweep in unrelated changes.

5. **Atomic Commits**: Each commit must address a single, well-defined task. Do not combine multiple logical changes in one commit.

### Pull Request Requirements

1. **PR Title**: Must start with `observability: ` followed by concise description.

2. **Description Must Include**:
   - Which documents are affected (spec.md, design.md, task.md, rule.md)
   - List of files modified
   - Quality gate verification results (typecheck, lint:arch, ui:contrast)
   - Any known trade-offs or open questions
   - Link to related issue (if applicable)

3. **Reviewers**: Must include at least one member from the platform team and one from the application team owning the modified code.

4. **Quality Gate Checks**: PR must pass:
   - `pnpm typecheck` across all affected packages
   - `pnpm lint:arch`
   - `pnpm ui:contrast` (if UI changes included)
   - Unit test coverage minimums met

5. **No Draft PRs for Breaking Changes**: Breaking API changes require formal review process and migration plan.

## Validation Requirements Before Marking Tasks Complete

### Pre-Completion Verification Checklist

Before marking any task in `task.md` as complete, verify all of the following:

- [ ] **Code Quality**: All new code follows repository conventions (TypeScript strict, lint:arch, naming conventions)
- [ ] **Test Coverage**: Unit tests pass with minimum 80% statement coverage for new modules
- [ ] **Type Safety**: `pnpm typecheck` passes with 0 errors across all affected packages
- [ ] **Architectural Compliance**: `pnpm lint:arch` passes with 0 warnings; all invariants respected
- [ ] **Performance**: Logging/metrics overhead measured and confirmed < 1ms per operation
- [ ] **Security**: No sensitive data paths; redaction verified working; health endpoint data minimization confirmed
- [ ] **Cross-Document Sync**: All four plan documents (spec.md, design.md, task.md, rule.md) are consistent and non-contradictory
- [ ] **Acceptance Criteria**: All acceptance criteria from spec.md verified for the completed work
- [ ] **Success Metrics**: Relevant success metrics from spec.md met or exceeded
- [ ] **Report Evidence**: report.md generated or updated with verifiable evidence of verification
- [ ] **Documentation**: API docs, configuration docs, and migration guides updated and published
- [ ] **Performance Baseline**: Pre/post performance comparison documented for key operations

### Task Completion Decision

A task can only be marked `completed` when ALL items above are verified. If any item is not applicable (e.g., performance measurement not possible in planning phase), document the exception in the task description and note the reason.

## Plan Consistency Requirements

### Cross-Document Reference Matrix

| Reference | Document | Key Content |
|---|---|---|
| FR-001 → AC-01 | spec.md | Structured JSON logging with required fields |
| FR-001 → R-01 | rules.md | JSON format mandatory invariant |
| FR-002 → TASK-02 | task.md | Core logging module implementation |
| FR-002 → R-02 | rules.md | Metrics invariants |
| ARCH-01 → R-13 | rules.md | Package boundary invariant |
| ARCH-01 → design.md | design.md | Package structure and responsibilities |
| US-001 → AC-01 | spec.md | User story traceability |
| US-001 → TASK-06 | task.md | Dock integration implementing user story |
| AC-01 → R-01 | rules.md | Acceptance criteria → architectural invariant |
| AC-05 → TASK-07 | task.md | Health endpoint implementation |
| PF-01 → TASK-01 | task.md | Package scaffolding foundation |
| PF-07 → task.md | task.md | Quality gate verification |

### Consistency Enforcement

- All FR (Functional Requirements) in spec.md must have corresponding implementation in task.md
- All AR (Architectural Requirements) in spec.md must have corresponding invariant in rules.md
- All US (User Stories) in spec.md must have corresponding task in task.md
- All AC (Acceptance Criteria) in spec.md must be verifiable through task completion and report.md evidence
- No document may contain information contradicting another document

### Resolution of Contradictions

If contradictions are found between documents during implementation:

1. Pause implementation
2. Identify the source of contradiction (requirements change, design decision, etc.)
3. Update the authoritative document (typically spec.md as it defines WHAT and WHY)
4. Propagate changes to dependent documents (design.md → task.md → rule.md)
5. Document the change rationale in a `decision.md` if the contradiction reveals a significant architectural decision
6. Resume implementation with updated documents

**Note**: This plan is architecture-only. Actual implementation decisions may reveal contradictions that require ADRs or design revisions.