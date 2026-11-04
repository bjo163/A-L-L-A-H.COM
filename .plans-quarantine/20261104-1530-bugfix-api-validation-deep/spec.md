---
title: "API Validation Bug Fix - Deep Plan"
mode: "deep"
status: "proposed"
timestamp: "2026-11-04T15:30:00+07:00"
author: "Qoder Agent (Ultra Planner)"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
---

## 01. Problem Understanding

### Product Context
This project is A-L-L-A-H.COM, a MoonWitness ecosystem monorepo with packages across multiple apps (arsy, dock, gate, headquarter, id, jizz, sentinel) and shared packages (ui, sdk, types, lint, arsy-orm). The platform enforces strict invariants including default-deny auth, SHA-256 content-addressed storage, parameterized SQL, and tenant isolation via company_id.

### Current State Analysis
The API endpoints in `apps/gate/` and `apps/headquarter/` are accepting requests with invalid or missing required parameters, causing 500 errors instead of proper validation responses. This violates the project's default-deny auth principle (only explicit public allowlist is anonymous) and creates poor developer experience.

### Root Cause
Missing Zod schema validation on incoming request bodies. Some routes use minimal validation or none at all, allowing malformed requests to reach the business logic layer. This is a recurring pattern observed across multiple endpoint files.

### Verified Constraints
- All APIs must follow default-deny auth (only /health, /ready, onboarding, non-prod /docs are anonymous)
- Every model row must have company_id derived from principal, never from request body
- Validation errors should return 400, not 500
- Error format should be consistent: `{"error": "validation failed", "details": [...]}`
- All TypeScript must pass strict typecheck in packages/ui, dock, headquarter, id, jizz, gate

### Unknowns & Assumptions
- **UNKNOWN**: Exact number of endpoints missing validation
- **ASSUMED**: Zod is the validated schema library (consistent with project conventions)
- **ASSUMED**: Existing test infrastructure can be extended for validation coverage

## 02. Requirements Analysis

### Functional Requirements (FR)
- **FR-001**: All POST/PUT endpoints in apps/gate/ and apps/headquarter/ must use Zod schema validation
- **FR-002**: Invalid requests must return HTTP 400 with descriptive error messages (not 500)
- **FR-003**: Validation error format must be `{"error": "validation failed", "details": [...]}`
- **FR-004**: Valid requests proceed to business logic unchanged

### Non-Functional Requirements (NFR)
- **NFR-001**: Must not introduce TypeScript errors in strict mode (packages/ui, dock, headquarter, id, jizz, gate)
- **NFR-002**: Must not break `pnpm docs:check` (100/100 required)
- **NFR-003**: Must pass `pnpm lint:arch` (arch invariants)
- **NFR-004**: Must pass `pnpm gate:build`

### Out of Scope
- Changing authentication logic or authorization flows
- Modifying existing business logic beyond validation addition
- UI changes or design system updates

## 03. Current-State vs Target-State Gap Analysis

| ID | Current State | Target State | Gap | Impact | Recommended Action |
|----|---------------|--------------|-----|--------|-------------------|
| G-001 | Some endpoints lack Zod validation | All endpoints have Zod schemas | Missing schemas | Medium | Create Zod schemas for each endpoint |
| G-002 | Validation errors cause 500 errors | Validation errors return 400 | Error handling | High | Add validation middleware |
| G-003 | Inconsistent error formats | Uniform error format | Developer experience | Medium | Standardize error response format |

## 04. Technical Design

### 4.1 Schema Creation Approach
- Use Zod for schema validation (project-standard library)
- Schemas define required fields, types, and validation rules
- Schemas align with `@moonwitness/types` contracts where applicable
- Schemas are reusable as standalone types

### 4.2 Middleware Design
- Create unified validation middleware `validateRequest(schema)`
- Middleware runs before route handlers
- On validation failure: return 400 with structured error
- On success: attach validated body to `req.body` and call `next()`

### 4.3 Error Response Format
```typescript
// Consistent error format
{
  error: "validation failed",
  details: [
    "Field 'email' is required",
    "Field 'password' must be at least 8 characters"
  ]
}
```

### 4.4 Affected Endpoints (Initial Audit)
- `apps/gate/src/app/api/route.ts` - All POST/PUT routes
- `apps/headquarter/src/app/api/route.ts` - All POST/PUT routes
- Additional endpoints identified during audit

## 05. Implementation Sequence

### Phase 1: Codebase Audit (Est. 2 days)
- [ ] Audit all API routes in `apps/gate/` and `apps/headquarter/`
- [ ] Document endpoints missing Zod schema validation
- [ ] Identify shared validation patterns

### Phase 2: Schema Creation (Est. 3 days)
- [ ] Create Zod schemas for each endpoint's required parameters
- [ ] Ensure schemas align with `@moonwitness/types` contracts
- [ ] Export schemas as Typescript types where reusable

### Phase 3: Middleware Implementation (Est. 2 days)
- [ ] Add validation middleware that runs before route handlers
- [ ] Implement 400 error responses for validation failures
- [ ] Ensure consistent error format

### Phase 4: Testing & Verification (Est. 2 days)
- [ ] Update unit tests to cover validation scenarios
- [ ] Run `pnpm typecheck` - ensure no TypeScript errors
- [ ] Run `pnpm gate:build` - verify all build gates pass

### Phase 5: Documentation (Est. 1 day)
- [ ] Update API documentation if needed
- [ ] Ensure `pnpm docs:check` passes with 100/100 score

## 06. Acceptance Criteria

1. All POST/PUT endpoints in `apps/gate/` and `apps/headquarter/` use Zod schema validation
2. Invalid requests return 400 with descriptive error messages instead of 500
3. Validation errors follow the format: `{"error": "validation failed", "details": [...]}`
4. All existing tests pass with `pnpm typecheck`
5. No TypeScript errors introduced
6. `pnpm docs:check` validates documentation contracts with 100/100 score
7. `pnpm lint:arch` passes (arch invariants maintained)

## 07. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing working clients | Medium | High | Maintain backward compatibility; deprecation path documented |
| Missing edge cases in schemas | Medium | Medium | Comprehensive test coverage; schema reviews |
| Performance overhead from validation | Low | Low | Zod is performant; minimal overhead |
| Inconsistent error messages | Low | Medium | Centralized middleware ensures consistency |

## 08. Dependencies

- `@moonwitness/types` - for type contract alignment
- `zod` - schema validation library (already project-standard)
- Existing test infrastructure in `apps/gate/` and `apps/headquarter/`
- `pnpm` build gates: `gate:build`, `headquarter:build`, `dock:build`, `id:build`, `jizz:build`

## 09. Implementation Readiness Gate

**Status: CONDITIONALLY READY**

- Requirements are clear (✓)
- Scope is defined (✓)
- Architecture is coherent (✓)
- Component responsibilities are clear (✓)
- Dependencies are identified (✓)
- Interfaces defined where necessary (✓)
- Data contracts defined where necessary (✓)
- Security requirements addressed (✓) - validation is security-enabling
- Failure scenarios considered (✓)
- Migration constraints documented (✓) - gradual rollout
- Testing strategy exists (conditional - need to add validation tests)
- Acceptance criteria verifiable (✓)
- Risks identified (✓)
- Open questions visible (number of affected endpoints)
- Conflicting specifications resolved (N/A)
- Implementation sequencing sensible (✓)

**Classification: CONDITIONALLY READY** - pending final audit count of affected endpoints and test coverage plan.

## 010. Open Questions

1. How many unique endpoints require schema validation? (Need to complete audit)
2. Should we create a shared validation library across both apps, or per-app schemas?
3. Are there any endpoints that should remain public without validation (beyond the explicit allowlist)?
4. What is the rollout strategy - feature flag or immediate replacement?

---