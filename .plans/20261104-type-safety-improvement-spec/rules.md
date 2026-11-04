# Architecture Rules — Type Safety & API Contract Consistency

## Mandatory Repository Architecture Guidelines

### 1. **Zero `as any` and `Record<string, any>` Patterns**
- **Prohibited**: `as any`, `as unknown as any`, `Record<string, any>`, `object` (without constraints)
- **Required**: Strict typing with `unknown` + validation, specific interfaces, generics with constraints
- **Enforcement**: `@moonwitness/lint` rules `no-as-any` and `no-record-any` fail on violations

### 2. **Package Boundary Validation**
- **SDK ↔ Hub**: Zod schemas validate all request/response bodies
- **Auth Plugin ↔ Apps**: Principal typed via `FastifyWithAuth` interface
- **ORM ↔ Apps**: Repository methods return strongly typed `T[]` with `T extends { id: number }`
- **LLM Gateway ↔ Adapters**: Each adapter has its own response schema (Zod-validated)
- **Cache ↔ Gateway**: `CacheEntry` interface enforces structure

### 3. **Runtime Validation at Boundaries**
- All `JSON.parse()` in LLM adapters wrapped in Zod validation
- MCP responses parsed with `zod.safeParse()` before casting
- Incoming request bodies validated before processing
- Database row validation against expected shape before translation

### 4. **TypeScript Configuration Enforcement**
- `strict: true` in all `tsconfig.json` files
- `noImplicitAny: true`, `strictNullChecks: true`
- `exactOptionalPropertyTypes: true` where applicable
- `forceConsistentCasingInFileNames: true`

### 5. **Build Gate Compliance**
- `pnpm typecheck` must pass with zero errors
- `pnpm lint:arch` must pass (architectural lint rules)
- `pnpm test` must pass for affected packages
- `pnpm --filter @allah/arsy-orm... run build` passes

---

## MoonWitness Ecosystem Invariants (Enforced)

### Security & Tenant Isolation
- **Default-deny**: Every hub route needs a verified principal
- **Tenant isolation**: `company_id` derived from principal, never from request body
- **SSRF protection**: Validate `base_url` before request, re-check resolved IP
- **Auth bypass prevention**: Principal casting to `any` removed — Fastify instance properly typed

### Data Integrity
- **Storage**: SHA-256 content-addressed, write-once, `data/storage/<digest>`
- **SQL**: Parameterized values only, column/sort identifier allowlist
- **Audit**: Every model insert/update/delete writes append-only event in same transaction
- **Global admin**: Server-authorized per admin route, requires reason, records target tenant

### Style & Component Purity
- **Palette purity**: App JSX never paints with Tailwind palette hue
- **Style source**: `packages/ui/src/theme.css` maps Tailwind utilities onto skin tokens
- **Component library**: `packages/ui` owns `Select`, `Table`, `Dialog`, `Form`/`FormField`, `Link`, `Button asChild`
- **Composition blocks**: Use blocks from `packages/ui/src/blocks/` (Hero, kicker, section heading, etc.)

---

## Strict TypeScript Safety Requirements

### 1. **Shared Contracts (`@moonwitness/types`)**
- `SDUINode.props`: `Record<string, unknown>` with validation (never `any`)
- `ToolResult.output`: `unknown` (strict) + validation schema
- `AgentToolResultEvent.result`: `unknown` + validation
- `McpToolCallResult`: Strict `unknown` fields with Zod validation
- `Principal`, `AuthRow`, `UserSubject`: Fully typed interfaces

### 2. **ORM Layer (`@allah/arsy-orm`)**
- `BaseRepository<T extends { id: number }>`: Generic with row shape constraint
- `find()` returns `T[]` with proper row typing
- Translation logic uses `T extends { id: number }` constraints
- No `row as any` — type guards validate row shapes

### 3. **Auth Plugin (`@allah/arsy-plugin-auth`)**
- `FastifyWithAuth` interface extending `FastifyInstance`
- `resolvePrincipal: (request: FastifyRequest) => Promise<Principal | null>`
- `authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<Principal | null>`
- No `fastify as any` casts

### 4. **SDK Layer (`@allah/sdk`)**
- MCP response validation with Zod schemas
- `request<T>()` generic with strict type parameter
- `getProviders()`, `getUsage()` return specific typed arrays
- No `as any` on response parsing

### 5. **LLM Gateway (`@allah/arsy-plugin-llm-gateway`)**
- Provider-specific response schemas (OpenAI, Anthropic, etc.)
- Zod validation before any property access
- Cache entries typed with `CacheEntry` interface
- SSRF options typed with `SSRFOptions` interface

---

## API Validation Rules

### SDK Client-Server Contract
```ts
// Before: return this.request<{ data: any }>(...)
24125f0. After: return this.request<{ data: T }>(...) with Zod validation on parse
```

### Auth Plugin Contract
```ts
// Before: request.principal: any and request.user: any
// After: request.principal: Principal and request.user: UserContext
```

### LLM Gateway Contract
```ts
// Before: as any on LLM API responses
// After: Zod-validated parsed responses with strict schemas
```

### MCP Protocol
```ts
// Before: ((res as any)?.result ?? { content: [], isError: true }) as McpToolCallResult
// After: mcpResponseSchema.parse(res) with strict validation
```

---

## Package Boundary Restrictions

| Boundary | Allowed | Prohibited |
|----------|---------|------------|
| **Apps → Packages** | Import shared types, SDK, UI | Direct DB calls, raw SQL, raw Fastify |
| **SDK → Hub** | JSON-RPC requests, Zod validation | Raw fetch without validation |
| **Auth → Apps** | `FastifyWithAuth` interface | `fastify as any` casting |
| **ORM → Apps** | `BaseRepository<T>`, typed queries | `row as any`, untyped rows |
| **LLM Gateway → Adapters** | Provider-specific schemas | `response.body.json() as any` |
| **Cache → Gateway** | `CacheEntry` interface | `as any` on cache rows |

---

## Dependency Management Rules

### 1. **Version Pinning**
- All internal packages use `workspace:*` versions
- External dependencies pinned in `pnpm-lock.yaml`
- No floating versions (`^`, `~`, `latest`)

### 2. **Cross-Package Imports**
- `@moonwitness/types` — shared contracts only
- `@allah/sdk` — client↔hub communication
- `@moonwitness/ui` — design system components
- `@allah/arsy-orm` — PGlite ORM layer
- `@allah/arsy-plugin-auth` — Fastify auth plugin
- `@allah/arsy-plugin-llm-gateway` — LLM adapter layer

### 3. **No Circular Dependencies**
- `packages/types` imports nothing from other packages
- `packages/sdk` imports `@moonwitness/types` only
- Apps import packages only (no cross-app imports)

---

## Error Handling Requirements

### 1. **Fail-Fast Validation**
```ts
function parseWithSchema<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Invalid schema', { errors: err.errors });
      throw new APIError('VALIDATION_ERROR', { details: err.errors });
    }
    throw err;
  }
}
```

### 2. **Strict JSON Parsing**
- All `JSON.parse()` in LLM adapters wrapped in validation
- No silent failures on malformed LLM responses

### 3. **Database Row Validation**
- ORM query results validated against expected shape before translation
- `as any` replaced with `assertRowHasId(row)` type guard

### 4. **SSRF Protection**
- `base_url` validated before request
- Resolved IP checked against private/loopback ranges
- Fail-closed on invalid endpoints

---

## Testing Requirements

### Unit Tests
- **Type safety tests**: `tsc --noEmit` for all type definition changes
- **Schema validation tests**: Zod schemas tested with valid/invalid data
- **Runtime tests**: `pnpm test` continues to pass

### Integration Tests
- **SDK ↔ Hub**: End-to-end tests validate request/response typing
- **Auth flow**: Principal resolution verified end-to-end
- **LLM adapters**: Mocked responses validate schema parsing

### Regression Prevention
- **Architecture lint**: `no-as-any` and `no-any` rules added to `@moonwitness/lint`
- **Pre-commit**: `pnpm lint:arch` blocks new `as any` patterns
- **Typecheck**: `pnpm typecheck` must pass with zero errors

---

## Backward Compatibility Rules

### Zero Breaking Changes
- **Exported types unchanged**: `Principal`, `AuthRow`, `McpToolCallResult` — same shape
- **API contracts preserved**: All endpoints return same JSON structure
- **Consumer code unaffected**: `app.ts` imports continue to work
- **Test compatibility**: All existing tests pass without modification

### Migration Path
- **Incremental**: Fix one file per PR, run `pnpm typecheck` after each
- **Test-first**: Ensure tests pass before and after each change
- **Lint-first**: New `as any` patterns rejected by architecture lint rules

---

## Prohibited Shortcuts

| Prohibited | Alternative |
|------------|-------------|
| `as any` | Specific interface + validation |
| `Record<string, any>` | `Record<string, unknown>` + Zod schema |
| `object` | `{ [key: string]: unknown }` with constraints |
| Raw SQL queries | Parameterized values + column allowlist |
| `JSON.parse()` without try/catch | `zod.parse()` with validation |
| `fastify as any` | `FastifyWithAuth` interface |
| `row as any` | `T extends { id: number }` generics |

---

## Git Workflow

### Branch Naming
- `feat/type-safety/<package-name>` for package-specific fixes
- `feat/type-safety/shared` for shared types
- `feat/type-safety/lint-rules` for lint rule additions

### Commit Messages
- **feat**: `feat(type-safety): define FastifyWithAuth interface`
- **fix**: `fix(type-safety): replace row as any with typed repository`
- **chore**: `chore(lint): add no-as-any and no-record-any rules`
- **test**: `test(type-safety): validate Zod schemas for MCP responses`

### PR Requirements
- `pnpm typecheck` passes
- `pnpm lint:arch` passes
- `pnpm test` passes for affected package
- Documentation updated if API contracts change

---

## Agent Execution Boundaries

### Autonomous Mode
- **Safe tasks**: TypeScript type additions, interface definitions, Zod schema creation
- **Unsafe tasks**: Database schema changes, API contract breaking changes, auth logic modifications
- **Always**: Run `pnpm typecheck` before and after changes
- **Always**: Run `pnpm lint:arch` to enforce architectural invariants

### Human Review Required
- Changes to `@moonwitness/types` exported interfaces
- Changes to Fastify plugin behavior
- Changes to MCP protocol handling
- Changes to LLM adapter response schemas
- Changes to ORM query signatures

### Verification Gates
1. `pnpm typecheck` passes
2. `pnpm lint:arch` passes
3. `pnpm test` passes for affected package
4. `pnpm --filter @allah/arsy-orm... run build` passes
5. Manual verification of type safety improvements

---

## Success Criteria

| Metric | Target |
|--------|--------|
| `as any` occurrences | 0 (across all packages) |
| `Record<string, any>` occurrences | 0 (replaced with specific types) |
| TypeScript strict mode | Enabled in all packages |
| Architecture lint rules | `no-as-any`, `no-record-any` enforced |
| Build gates | All pass with zero warnings |
| Test coverage | Maintained or improved |
| Build time | No significant increase |