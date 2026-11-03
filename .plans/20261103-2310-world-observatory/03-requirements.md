---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-REQ"
version: "2.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Requirements Specification

## 3.1 Functional Requirements (FR-XXX)

### FR-001: Home Page Rendering
- **Description:** Render the WORLD OBSERVATORY home page with identity band, engine credit, core question, and primary navigation
- **Inputs:** None (initial page load)
- **Outputs:** HTML markup with hero section, observations grid, perspectives section
- **Acceptance:** Page renders without errors, engine credit visible, core question displayed
- **Evidence:** `apps/jizz/src/app/page.tsx` home section renders correctly

### FR-002: Observations List Display
- **Description:** Display recent source-grounded observations with source attribution and coverage indicator
- **Inputs:** Observations data array from JIZZ API (`/phenomena/:id/observations`)
- **Outputs:** Grid of observation cards with title, source, published date, coverage badge
- **Acceptance:** Observations render without errors, source names visible, coverage indicators present
- **Evidence:** Observations data structure populated from JIZZ API

### FR-003: Perspective Listing
- **Description:** List perspectives by actor with framing classification and source count
- **Inputs:** Perspectives data array from JIZZ API (`/phenomena/:id/perspectives`)
- **Outputs:** List of perspective items with actor name, framing badge, source count
- **Acceptance:** Perspectives render without errors, actor names visible, framing classifications present
- **Evidence:** `apps/jizz/src/app/page.tsx` perspective section renders correctly

### FR-004: Responsive Layout
- **Description:** Layout adapts between desktop (3+ columns), tablet (2 columns), and mobile (1 column)
- **Inputs:** Viewport width changes
- **Outputs:** Grid reflows appropriately at breakpoints
- **Acceptance:** Layout functions at 320px, 768px, and 1440px viewport widths
- **Evidence:** Tailwind v4 responsive utilities applied

### FR-005: Loading State
- **Description:** Display loading indicator during data fetch
- **Inputs:** Loading flag state
- **Outputs:** Spinner with "Loading WORLD OBSERVATORY data..." text
- **Acceptance:** Loading state visible during initial mount, dismissed when data arrives
- **Evidence:** `apps/jizz/src/app/loading.tsx` renders as overlay

### FR-006: Error State
- **Description:** Display error boundary on data fetch failure
- **Inputs:** Error object from failed fetch
- **Outputs:** Error message with "Try Again" button
- **Acceptance:** Error state renders on fetch failure, retry button functional
- **Evidence:** `apps/jizz/src/app/error.tsx` renders error handling UI

### FR-007: Not-Found State
- **Description:** Display appropriate message for invalid routes
- **Inputs:** Navigation to non-existent route
- **Outputs:** "Page not found" message with home link
- **Acceptance:** Not-found renders on invalid route navigation, home link works
- **Evidence:** `apps/jizz/src/app/not-found.tsx` renders appropriate UI

### FR-008: Engine Credit Attribution
- **Description:** Display "Powered by ROCKSOUL JIZZ" badge
- **Inputs:** None (static attribution)
- **Outputs:** Gold badge with "Powered by ROCKSOUL JIZZ" text
- **Acceptance:** Badge visible on all pages, links to appropriate credit
- **Evidence:** Home page badge renders correctly

### FR-009: Ecosystem Navigation
- **Description:** Provide navigation links to Dock, Headquarter, and MoonWitness ID apps
- **Inputs:** User navigates between ecosystem apps
- **Outputs:** Persistent navbar with cross-app links
- **Acceptance:** Navbar visible on all routes, links point to correct ports
- **Evidence:** JizzNavbar wrapper configured with cross-app links

### FR-010: JIZZ API Client
- **Description:** Custom client to consume JIZZ Node.js API at port 8787
- **Inputs:** Phenomenon IDs, pagination params, filter params
- **Outputs:** Typed responses for phenomena, observations, perspectives, framings, reactions, signals, changes, snapshots, insights, foreign-references
- **Acceptance:** Client fetches data from `http://127.0.0.1:8787`, runtime validates against JSON Schema, handles pagination
- **Dependencies:** JIZZ Node.js API running on port 8787

### FR-011: Phenomena Catalog
- **Description:** Searchable/filterable list of phenomena with counts and status
- **Inputs:** Query params (search, filters, pagination)
- **Outputs:** List of phenomena with id, title, status, coverage, observation count, perspective count
- **Acceptance:** Catalog renders, search works, filters apply, pagination functional

### FR-012: Phenomenon Detail Page
- **Description:** Comprehensive detail page with overview, signals, perspectives, sources
- **Inputs:** Phenomenon ID from route param
- **Outputs:** Phenomenon overview, grounded summary, evidence counts, perspectives by actor, framings, reactions, signals, timeline, sources, foreign references
- **Acceptance:** Detail page renders, all sections present, data sourced from JIZZ API

### FR-013: Perspective Comparison
- **Description:** Side-by-side comparison of actor framings
- **Inputs:** Multiple perspective records for same phenomenon
- **Outputs:** Comparison view with actor, framing, position, source count, evidence trail
- **Acceptance:** Comparison renders, actors visible, framings displayed side-by-side

### FR-014: Timeline Visualization
- **Description:** Chronological tracking of perspective and framing changes
- **Inputs:** Signals, changes, snapshots data for phenomenon
- **Outputs:** Interactive timeline with signal/change events, perspective snapshots over time
- **Acceptance:** Timeline renders, navigation works, temporal navigation functional

### FR-015: Signals Index
- **Description:** Index of meaningful signals/changes with methodology
- **Inputs:** Signals data from JIZZ API
- **Outputs:** Signal list with type, description, observation IDs, methodology version, confidence, timestamp
- **Acceptance:** Signals render with methodology, observable changes tracked

### FR-016: Sources Directory
- **Description:** Complete provenance chain for each observation
- **Inputs:** Sources data from JIZZ API
- **Outputs:** Source list with URL/identity, publication/retrieval timestamps, authority level, observation linkages
- **Acceptance:** Sources render with URLs/identities, provenance chain intact

### FR-017: Framings & Reactions Display
- **Description:** Display framings and reactions for each phenomenon
- **Inputs:** Framings and reactions data from JIZZ API
- **Outputs:** Framing list with dimension (economic, political, security, etc.), reaction list with type (support, criticism, rejection, etc.)
- **Acceptance:** Framings and reactions render with proper classifications

## 3.2 Non-Functional Requirements (NFR-XXX)

### NFR-001: First Contentful Paint
- **Requirement:** FCP < 2 seconds on broadband connection
- **Implementation:** Server Components render stable initial content
- **Verification:** Lighthouse audit, Chrome DevTools

### NFR-002: Time to Interactive
- **Requirement:** TTI < 5 seconds on broadband connection
- **Implementation:** Minimal Client Component hydration, progressive enhancement
- **Verification:** Lighthouse audit, performance monitoring

### NFR-003: Largest Contentful Paint
- **Requirement:** LCP < 2.5 seconds
- **Implementation:** Server-rendered stable content above the fold
- **Verification:** Lighthouse audit

### NFR-004: Accessibility — WCAG AA
- **Requirement:** AA compliance for all visible content
- **Implementation:** Semantic landmarks, keyboard focus, sufficient contrast ratios
- **Verification:** axe-core audit, manual keyboard navigation

### NFR-005: Visible Focus Indicators
- **Requirement:** All interactive elements have focus-visible styles
- **Implementation:** Tailwind focus-visible outlines, no outline-none without replacement
- **Verification:** Manual keyboard tab-through

### NFR-006: Reduced-Motion Support
- **Requirement:** Nonessential transitions disabled in reduced-motion preference
- **Implementation:** `@media (prefers-reduced-motion: reduce)` queries
- **Verification:** Browser developer tools reduced-motion toggle

### NFR-007: Color Not Sole Encoding
- **Requirement:** Color never sole means of conveying information
- **Implementation:** Supplementary indicators (text, icons, patterns) alongside color
- **Verification:** Manual review of all color-coded information

### NFR-008: Graceful API Failure
- **Requirement:** Error boundaries handle upstream API failures
- **Implementation:** try/catch in data fetching, error state rendering
- **Verification:** Test failed API responses, verify error UI

### NFR-009: Partial Data Handling
- **Requirement:** Empty, partial, stale, and unavailable states displayed
- **Implementation:** Conditional rendering based on data completeness
- **Verification:** Test various data completeness levels

### NFR-010: Timeout and Retry
- **Requirement:** Bounded retry on transient failures, safe GET only
- **Implementation:** Explicit timeout, max retry count, idempotent requests
- **Verification:** Test network failures, verify retry behavior

### NFR-011: SSRF Prevention
- **Requirement:** Validate all external URLs and links
- **Implementation:** URL protocol validation, host whitelisting
- **Verification:** Test arbitrary URL parameters, verify validation blocks

### NFR-012: Accessibility — Keyboard Navigation
- **Requirement:** All functionality operable via keyboard alone
- **Implementation:** Focus management, logical tab order, skip links
- **Verification:** Full keyboard tab-through, no keyboard traps

### NFR-013: Cross-Browser Compatibility
- **Requirement:** Chrome, Firefox, Safari, Edge compatibility
- **Implementation:** Standard CSS/JS, no browser-specific hacks
- **Verification:** Test on each browser, address inconsistencies

### NFR-014: Mobile Responsiveness
- **Requirement:** Excellent experience on 320px to 1920px+ ranges
- **Implementation:** Tailwind v4 mobile-first breakpoints
- **Verification:** Resize browser, test on actual devices

### NFR-015: Observability
- **Requirement:** Error tracking and performance metrics
- **Implementation:** Console logging, Lighthouse audits
- **Verification:** Audit logs, performance reports

### NFR-016: JIZZ API Version Tolerance
- **Requirement:** Handle schema version differences gracefully
- **Implementation:** Explicit schema version tracking, runtime validation against JSON Schema Draft 2020-12
- **Verification:** Test with different schema versions, verify graceful degradation

### NFR-017: Research Pipeline Awareness
- **Requirement:** Display research pipeline status (candidates, staging, steward review)
- **Implementation:** Optional view of `data/candidates/`, research index, steward status
- **Verification:** Research pipeline view renders when JIZZ API exposes it

## 3.3 Out of Scope Requirements

| ID | Requirement | Reason |
|----|-------------|--------|
| **OUT-NFR-001** | User authentication system | Public read-only initially; separate auth infrastructure required |
| **OUT-NFR-002** | Personalized saved views | Requires auth and data model changes |
| **OUT-NFR-003** | Truth ranking engine | Violates "PERSPECTIVE ≠ TRUTH" constraint |
| **OUT-NFR-003** | JIZZ canonical record writes | Violates engine ownership boundary |
| **OUT-NFR-004** | Message broker / event system | No genuine need for read-only consumption |
| **OUT-NFR-005** | Real-time WebSocket updates | No API support, adds unnecessary complexity |
| **OUT-NFR-006** | Production deployment | Separate approval process required |
| **OUT-NFR-007** | Message queuing system | Over-engineering for read-only app |
| **OUT-NFR-008** | User account management | Separate auth system |

## 3.4 Assumptions

| ID | Assumption | Classification | Evidence/Source |
|----|------------|----------------|-----------------|
| **A-001** | JIZZ Node.js API will be available at `http://127.0.0.1:8787` | ASSUMED | rocksoul-jizz package.json, docs/API.md |
| **A-002** | @moonwitness/ui package exports will remain compatible | ASSUMED | Package version lock, semver range |
| **A-003** | @allah/sdk exports will remain compatible | ASSUMED | Package version lock, semver range |
| **A-003** | @moonwitness/types exports will remain compatible | ASSUMED | Package version lock, semver range |
| **A-004** | Tailwind CSS v4 conventions will apply | ASSUMED | Verified against dock/headquarter/id apps |
| **A-005** | Next.js 16 App Router APIs will remain stable | ASSUMED | Verified against existing apps |
| **A-006** | React 19 will have no breaking changes in pnpm workspace | ASSUMED | Version pinning, compatibility checks |
| **A-007** | JIZZ API schema versions will be explicit and backward compatible | ASSUMED | SCHEMA.md version policy |
| **A-008** | No conflicting JIZZ API versions | UNKNOWN | Requires API inspection |
| **A-009** | No new architectural invariants added before implementation | UNKNOWN | Requires monitoring |
| **A-010** | All team members familiar with Next.js 16 conventions | UNKNOWN | Requires team onboarding |
| **A-011** | JIZZ API pagination/filtering capabilities match rocksoul-jizz docs | ASSUMED | docs/API.md |
| **A-012** | Daily research pipeline runs at 09:17 Asia/Jakarta | ASSUMED | README.md |

## 3.5 Dependencies

### 3.4.1 Internal Dependencies
| Dependency | Type | Owner | Impact if Changed |
|------------|------|-------|-------------------|
| **@moonwitness/ui** | Shared UI package | frontend | UI consistency, lint gate |
| **@allah/sdk** | SDK for hub communication | backend | API client integrity (if used for hub comms) |
| **@moonwitness/types** | Shared type contracts | architecture | Type safety, lint gate |
| **apps/dock** | Reference implementation | frontend | Navigation patterns, UI reference |
| **apps/headquarter** | Reference implementation | frontend | Data display patterns |
| **apps/id** | Reference implementation | frontend | Auth-free read-only patterns |

### 3.4.2 External Dependencies
| Dependency | Version | Source | Impact if Changed |
|------------|---------|--------|-------------------|
| **next** | 16.4.3 | pnpm lockfile | App router, build pipeline |
| **react** | 19.3.0 | pnpm lockfile | Component model, hooks |
| **react-dom** | 19.3.0 | pnpm lockfile | DOM rendering |
| **tailwindcss** | ^4 | pnpm lockfile | Styling, theming |
| **@tailwindcss/turbopack** | ^4 | pnpm lockfile | CSS processing in Turbopack |
| **ajv** | ^8.17.1 | (JIZZ dep) | JSON Schema validation |
| **ajv-formats** | ^3.0.1 | (JIZZ dep) | JSON Schema format validation |

### 3.4.3 JIZZ Integration Dependencies
| Dependency | Type | Source | Impact |
|------------|------|--------|--------|
| **rocksoul-jizz** | External API | bjo163/rocksoul-jizz repo | Data source, API contract |
| **JIZZ Node.js API** | Service | `npm run start` on port 8787 | Runtime dependency |
| **JIZZ JSON Schema** | Contract | `docs/SCHEMA.md`, schema files | Type generation, validation |
| **JIZZ Live Data** | Data | `data/live/*.json` | Content source |
| **JIZZ Research Pipeline** | Process | `scripts/research-*.mjs` | Optional research pipeline data |

### 3.4.4 Build and CI Dependencies
| Dependency | Command | Purpose |
|------------|---------|---------|
| **pnpm jizz:dev** | `next dev -p 3004` | Local development server |
| **pnpm jizz:build** | `next build` | Production build |
| **pnpm --filter @moonwitness/jizz typecheck** | `tsc --noEmit` | Type checking |
| **pnpm lint:arch** | `node packages/lint/src/check-architecture.mjs` | Architectural invariant gate |
| **pnpm docs:check** | `tsx scripts/check-doc-contracts.ts` | Documentation contract validation |
| **pnpm --filter @moonwitness/jizz build** | Full build pipeline | End-to-end validation |

---

**Related Documents:**
- [00-executive-overview.md](00-executive-overview.md)
- [01-product-vision.md](01-product-vision.md)
- [02-project-scope.md](02-project-scope.md)
- [04-current-state.md](04-current-state.md)
- [05-target-architecture.md](05-target-architecture.md)