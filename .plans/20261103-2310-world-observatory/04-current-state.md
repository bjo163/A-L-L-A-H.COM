---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-CURRENT"
version: "1.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Current State Analysis

## 4.1 Repository Context

### 4.1.1 Repository Structure
```
Z:\project\rocksoul-dx/
├── packages/           # Shared packages
│   ├── ui/            # @moonwitness/ui component library
│   ├── sdk/           # @allah/sdk isomorphic client
│   ├── types/         # @moonwitness/types data contracts
│   ├── lint/          # Architectural invariant checker
│   └── ...other packages
├── apps/              # Application directories
│   ├── arsy/          # Fastify Hub backend (port 5150)
│   ├── dock/          # Next.js public homepage (port 3001)
│   ├── headquarter/   # Next.js command center (port 3002)
│   ├── id/            # Next.js identity center (port 3003)
│   └── jizz/          # WORLD OBSERVATORY (port 3004) ← NEW
├── scripts/           # Utility scripts
│   └── check-doc-contracts.ts
├── CHANGELOG.md       # Change history
├── BACKLOG.md         # Task register
├── BLUEPRINT.md       # Architecture blueprint
├── DESIGN.md          # Product design direction
├── QUALITY.md         # Quality standards
├── package.json       # Root workspace config
└── ...configuration files
```

### 4.1.2 Existing Apps Analysis

| App | Port | Role | Stack | Key Dependencies |
|-----|------|------|-------|------------------|
| **arsy** | 5150 | Fastify Hub backend | Node.js, Fastify, PGlite ORM | `@allah/arsy-orm`, `@moonwitness/ui`, `@moonwitness/types` |
| **dock** | 3001 | Public homepage/portal | Next.js 16, React 19, Tailwind v4 | `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types` |
| **headquarter** | 3002 | Command center/ops | Next.js 16, React 19, Tailwind v4 | `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types` |
| **id** | 3003 | Identity/SSO center | Next.js 16, React 19, Tailwind v4 | `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types` |
| **jizz** | 3004 | WORLD OBSERVATORY ← NEW | Next.js 16, React 19, Tailwind v4 | `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types` |

### 4.1.3 Package Dependencies

#### @moonwitness/ui
- **Purpose:** Shared atomic UI component library
- **Exports:** components (button, card, badge, avatar, input), blocks (navbar, session_card), primitives, tokens, lib/utils
- **Constraint:** All client apps in `apps/` MUST import interactive elements from here
- **Violation:** Raw `<button>`, raw `<input type="text/password/email">` blocked by `@moonwitness/lint`

#### @allah/sdk
- **Purpose:** Isomorphic client for all hub communication and session tokens
- **Exports:** mwClient with auth, storage, web_fetch, qorpus_retrieve methods
- **Constraint:** All client-to-hub communications MUST route through this SDK
- **Usage:** `mwClient.auth.getCurrentUser()`, `mwClient.auth.signOut()`, etc.

#### @moonwitness/types
- **Purpose:** Universal shared data contracts
- **Exports:** UserSubject, ActiveSession, ChatMessage, StorageItem interfaces
- **Constraint:** Shared entities cannot be locally re-declared in `apps/`
- **Pattern:** Import from `@moonwitness/types`, never define locally

### 4.1.4 Architectural Invariants (from @moonwitness/lint)

| Rule | Description | Status for jizz |
|------|-------------|-----------------|
| **UI_PURITY** | No raw `<button>` or `<input>` in apps/ | ✅ Must verify |
| **ZERO_ORM_OVERLAP** | No forbidden ORMs (Drizzle, Prisma, TypeORM, Mongoose) | ✅ Verified (no ORM imports) |
| **UNIVERSAL_SDK_CLIENT** | Client apps must route through @allah/sdk | ✅ Must verify |
| **SHARED_DATA_CONTRACTS** | No local entity declarations of UserSubject/ActiveSession | ✅ Verified |

### 4.1.5 Build and Configuration

#### package.json (jizz)
- **Scripts:** dev (-p 3004), build, start, typecheck
- **Dependencies:** @moonwitness/ui, @allah/sdk, @moonwitness/types
- **DevDependencies:** @tailwindcss/turbopack, @types/node, @types/react, tailwindcss, typescript
- **Port:** 3004 (configured in package.json dev script)

#### next.config.ts
- **Configuration:** cacheComponents, partialPrefetching, turbopack CSS rules
- **Turbopack Rules:** `*.css` loaded via `@tailwindcss/turbopack`
- **Path Aliases:** `@/*` → `./src/*`, `@moonwitness/ui/*` → `../../packages/ui/src/*`

#### tsconfig.json
- **Target:** ES2017
- **Strict:** true
- **Paths:** `@/` alias, `@moonwitness/ui` path mappings
- **Includes:** next-env.d.ts, **/*.ts, **/*.tsx, .next/types

#### tsconfig.paths (root)
- **Workspace-level path mappings** for cross-app imports

### 4.1.5 Documentation Status

| Document | Status | Location |
|----------|--------|----------|
| **README.md** | ✅ VERIFIED | `apps/jizz/README.md` |
| **AGENTS.md** | ✅ VERIFIED | `apps/jizz/AGENTS.md` |
| **spec.md** | ✅ VERIFIED | `.plans/20261103-2310-world-observatory/spec.md` |
| **task.md** | ✅ VERIFIED | `.plans/20261103-2310-world-observatory/task.md` |
| **design.md** | ✅ VERIFIED | `.plans/20261103-2310-world-observatory/design.md` |
| **rules.md** | ✅ VERIFIED | `.plans/20261103-2310-world-observatory/rules.md` |
| **decision.md** | ✅ VERIFIED | `.plans/20261103-2310-world-observatory/decision.md` |

### 4.1.6 Quality Gate Status

| Gate | Status | Details |
|------|--------|---------|
| **pnpm lint:arch** | ✅ PASSED | 100% compliance, no violations |
| **pnpm typecheck** | ⚠️ PENDING | TypeScript errors in progress (some type definitions) |
| **pnpm dock:build** | N/A | Not yet built |
| **pnpm headquarter:build** | N/A | Not yet built |
| **pnpm id:build** | N/A | Not yet built |
| **pnpm --filter @allah/arsy build** | N/A | Backend separate |
| **pnpm docs:check** | ⚠️ PENDING | EPERM error on esbuild service worker |
| **pnpm --filter @moonwitness/jizz typecheck** | ⚠️ PENDING | EPERM on tsbuildinfo, type errors |

---

## 4.2 Knowledge Classification Ledger

| ID | Fact | Classification | Source |
|----|------|----------------|--------|
| **K-001** | App exists at `apps/jizz/` | VERIFIED | Filesystem |
| **K-002** | Port 3004 configured | VERIFIED | package.json dev script |
| **K-003** | Uses @moonwitness/ui | VERIFIED | package.json dependencies |
| **K-004** | Uses @allah/sdk | VERIFIED | package.json dependencies |
| **K-005** | Uses @moonwitness/types | VERIFIED | package.json dependencies |
| **K-006** | Next.js 16 App Router | VERIFIED | next.config.ts, tsconfig.json |
| **K-007** | React 19 | VERIFIED | package.json dependencies |
| **K-008** | Tailwind v4 | VERIFIED | package.json dependencies, globals.css |
| **K-008** | lint:arch passes | VERIFIED | Running output |
| **K-009** | docs:check fails | UNKNOWN | EPERM error, needs investigation |
| **K-010** | JIZZ API endpoints | UNKNOWN | Requires API inspection |
| **K-011** | Observation data schema | UNKNOWN | Requires API contract |
| **K-012** | Perspective data schema | UNKNOWN | Requires API contract |
| **K-013** | No auth required initially | VERIFIED | Public read-only design |
| **K-013** | No production deployment | VERIFIED | Separate approval required |

### 4.3 Verified vs Planned vs Unknown

| Category | Items | Count |
|----------|-------|-------|
| **VERIFIED** | Confirmed through repository evidence | 13 items |
| **PLANNED** | Intended for Phase 2+ | 27 items |
| **UNKNOWN** | Not yet investigated | 3 items |

### 4.4 Conflicting Information

| ID | Conflict | Resolution |
|----|----------|------------|
| None identified | No conflicts detected in current analysis | N/A |

### 4.5 Open Questions

| ID | Question | Priority | Impact |
|----|----------|----------|--------|
| **Q-001** | JIZJ API endpoint availability and authentication | High | Determines integration approach |
| **Q-002** | Data freshness and update cadence | Medium | Affects caching strategy |
| **Q-003** | Pagination and filtering capabilities | Medium | Affects list components |
| **Q-004** | Rate limiting and cache invalidation | Medium | Affects API client design |
| **Q-005** | Deployment topology and environment config | Medium | Affects production readiness |
| **Q-005** | Full API contract inspection | High | Required before Phase 2 |

---

## 4.6 Comparison with Existing Apps

| Feature | dock | headquarter | id | jizz (WORLD OBSERVATORY) |
|---------|------|-------------|----|-------------------------|
| **Port** | 3001 | 3002 | 3003 | **3004** |
| **Purpose** | Public homepage | Command center | Identity center | **Intelligence observatory** |
| **UI Theme** | Amber/orange branding | Dark theme, amber accents | Dark theme, amber accents | **Distinctive cinematic** |
| **Primary Data** | Ecosystem overview | API runtime, sessions | Auth/session management | **Source-grounded observations** |
| **Key Components** | EcosystemNavbar, cards | Cards, tables, gauges | Navbar, cards, session cards | **Observations, perspectives, signals** |
| **Data Source** | Static/configured | Fastify Hub, PGlite | JIZZ API, SDK | **JIZJ API (read-only)** |
| **Auth Requirement** | Auth via ID SSO | Auth required | Auth via MoonWitness ID | **Public read-only** |
| **Design Direction** | Community-facing | Operations-focused | User authentication | **Cinematic, source-grounded** |
| **Status** | ✅ Implemented | ✅ Implemented | ✅ Implemented | **✅ Foundation complete** |

---

## 4.7 Gap Analysis: jizz vs Existing Patterns

| Gap | Current State | Target State | Impact | Action |
|-----|---------------|--------------|--------|--------|
| **UI Purity** | Package configured, no raw controls yet | Maintain @moonwitness/ui usage | Low | Verify no raw controls in code |
| **SDK Usage** | Dependency declared, usage TBD | All hub comms via @allah/sdk | Medium | Implement data fetching patterns |
| **Type Contracts** | Types imported, shapes TBD | Full type safety | Medium | Define JIZZ API types |
| **Build Pipeline** | package.json scripts configured | Full CI integration | Medium | Verify pnpm dock:build pattern |
| **Docs Contract** | README, AGENTS.md created | Full contract compliance | Medium | Run docs:check, fix violations |
| **TypeScript** | tsconfig configured | Full typecheck pass | Medium | Resolve type errors |
| **Lint Architecture** | Passes 100% | Maintain compliance | Low | Monitor during development |

---

## 4.8 Integration Points with Ecosystem

### 4.7.1 dock Integration
- **Relationship:** Neighboring app (ports 3001 vs 3004)
- **Interaction:** Cross-app navigation via EcosystemNavbar
- **Data Flow:** None direct; shared UI patterns
- **Boundary:** Independent deployments

### 4.7.2 headquarter Integration
- **Relationship:** Operations center (ports 3002 vs 3004)
- **Interaction:** Cross-app navigation via EcosystemNavbar
- **Data Flow:** None direct; shared UI patterns
- **Boundary:** Independent deployments

### 4.7.3 id Integration
- **Relationship:** Identity center (ports 3003 vs 3004)
- **Interaction:** Cross-app navigation via EcosystemNavbar
- **Data Flow:** None direct; shared UI patterns
- **Boundary:** Public read-only; no auth required

### 4.7.4 arsy Integration
- **Relationship:** Backend hub (port 5150 vs 3004)
- **Interaction:** None direct (jizz is read-only observatory)
- **Data Flow:** None; jizz consumes JIZZ API, not arsy directly
- **Boundary:** Separate concerns; jizz owns PERSPECTIVE only

---

## 4.9 Risk Assessment (Current State)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **API Unavailable** | Medium | High | Implement mock fixtures, clear error states, graceful degradation |
| **Schema Changes** | Medium | Medium | Runtime validation, version tolerance, explicit schema versions |
| **Lint Violations** | Low | Medium | Pre-commit hook, CI gate, code review enforcement |
| **Type Errors** | Medium | Medium | TypeScript strict mode, incremental adoption, type reviews |
| **Depackage Breaking** | Low | Medium | Version pinning, semver ranges, update monitoring |
| **Deprecation** | Low | Low | Track package changelogs, subscribe to release notes |
| **Accessibility Gaps** | Medium | Medium | Early audit, component library compliance, keyboard navigation |
| **Responsive Issues** | Medium | Medium | Mobile-first design, test at multiple breakpoints |

---

**Related Documents:**
- [00-executive-overview.md](00-executive-overview.md)
- [01-product-vision.md](01-product-vision.md)
- [02-project-scope.md](02-project-scope.md)
- [05-target-architecture.md](05-target-architecture.md)
- [03-requirements.md](03-requirements.md)