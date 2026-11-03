---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-ARCH"
version: "2.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Target Architecture Specification

## 5.1 System Architecture

### 5.1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      WORLD OBSERVATORY                           │
│  (apps/jizz/, port 3004)                                          │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────────┐  ┌─────────────┐ │
│  │ Server          │  │ Client            │  │ Boundary    │ │
│  │ Components      │  │ Components        │  │ Components  │ │
│  │ (App Router)    │  │ (use client)      │  │ (loading,    │ │
│  └─────────────────┘  └─────────────────────┘  │ error,     │ │
│                                        │ not-found) │ │
└─────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA FLOW                                    │
│                                                                   │
│  Server Component:                                                 │
│    JIZZ API Client → JIZZ Node.js API (port 8787)                  │
│    → Runtime Validation (JSON Schema) → View Model → UI           │
│                                                                   │
│  Client Component:                                                 │
│    Interactive controls, state management, local interactions     │
│                                                                   │
│  Boundary:                                                         │
│    Loading, Error, Not-Found states                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.1.2 Component Hierarchy

```
apps/jizz/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout with JizzNavbar
│   │   ├── page.tsx                # Home page (Server Component)
│   │   ├── globals.css             # Custom theme tokens
│   │   ├── loading.tsx             # Loading boundary
│   │   ├── error.tsx               # Error boundary
│   │   └── not-found.tsx           # Not-found boundary
│   ├── components/                 # JIZZ-specific components
│   │   ├── navbar.tsx              # JizzNavbar wrapper
│   │   ├── observation-card.tsx    # Observation display component
│   │   ├── perspective-list.tsx    # Perspective listing component
│   │   ├── phenomenon-detail.tsx   # Phenomenon detail view
│   │   ├── framing-reaction.tsx    # Framings & reactions display
│   │   ├── signal-change.tsx       # Signals & changes display
│   │   ├── timeline.tsx            # Timeline visualization
│   │   └── sources-directory.tsx   # Sources directory
│   ├── lib/                        # Utility modules
│   │   ├── jizz-api.ts             # JIZZ API client (port 8787)
│   │   ├── validation.ts           # JSON Schema validation
│   │   └── types.ts                # TypeScript type definitions
│   └── styles/                     # Styles and tokens
│       └── globals.css             # Tailwind v4 base + theme
├── package.json                    # Dependencies and scripts
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── next-env.d.ts                   # Type environment
```

### 5.1.3 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    JIZZ API INTEGRATION                           │
│                                                                   │
│  ┌─────────────┐    ┌─────────────────────┐    ┌───────────────┐ │
│  │ Server       │    │ Runtime            │    │ View           │ │
│  │ Component    │    │ Validation Layer    │    │ Model          │ │
│  │ (fetch)      │    │ (JSON Schema)       │    │ (transformation)│ │
│  └─────────────┘    └─────────────────────┘    └───────────────┘ │
│           │              │                      │                │
│           │              │                      │                │
│           ▼              ▼                      ▼                ▼
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │ Phenomenon   │  │ Observation         │  │ Perspective     │ │
│  │ Data         │  │ Data                │  │ Data            │ │
│  └─────────────┘  └─────────────────────┘  └─────────────────┘ │
│           │              │                      │                │
│           ▼              ▼                      ▼                ▼
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │ Framing      │  │ Reaction            │  │ Signal          │ │
│  │ Data         │  │ Data                │  │ Data            │ │
│  └─────────────┘  └─────────────────────┘  └─────────────────┘ │
│           │              │                      │                │
│           ▼              ▼                      ▼                ▼
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │ Change       │  │ Snapshot            │  │ Insight         │ │
│  │ Data         │  │ Data                │  │ Data            │ │
│  └─────────────┘  └─────────────────────┘  └─────────────────┘ │
│                                                                   │
│  Flow: Server Component → JIZZ API Client → JIZZ Node.js API →   │
│        Runtime Validation → View Model → UI                      │
│                                                                   │
│  Constraints:                                                       │
│  • No arbitrary URL overrides from request params                   │
│  • SSRF prevention: validate all external URLs                      │
│  • Credentials server-only, no secrets in client                    │
│  • Explicit timeout, bounded retry (max 3), safe GET only          │
│  • Never silently substitute fixtures when live data fails          │
│  • Preserve IDs, schema versions, source references                 │
│  • Runtime validation against JSON Schema Draft 2020-12             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.1.4 State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT-SIDE STATE                                │
│                                                                   │
│  ┌─────────────┐  ┌─────────────────────┐  ┌───────────────┐ │
│  │ useState    │  │ useEffect           │  │ useReducer    │ │
│  │ (phenomena) │  │ (data fetch)       │  │ (complex)     │ │
│  └─────────────┘  └─────────────────────┘  └───────────────┘ │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ useLoading        │  │ useError            │              │
│  │ (boolean)         │  │ (error | null)      │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ useSignal         │  │ useTimeline         │              │
│  │ (signal data)     │  │ (timeline items)    │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                   │
│  Pattern:                                                           │
│  • Server Components for read-only data                            │
│  • Client Components only for genuine interaction                  │
│  • useEffect for data fetching in Client Components                │
│  • Separation: server-state vs client-state                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 5.2 Package & Module Architecture

### 5.2.1 Package Responsibilities

| Package | Responsibility | Owner | Boundaries |
|---------|---------------|-------|------------|
| **@moonwitness/ui** | Shared UI components, tokens, primitives | frontend | All apps must import interactive elements from here |
| **@allah/sdk** | SDK for hub communication, session management | backend | All client-to-hub comms MUST route through here (if applicable) |
| **@moonwitness/types** | Shared data contracts, type definitions | architecture | Cannot locally re-declare shared entities |
| **apps/jizz** | WORLD OBSERVATORY observatory app | frontend | Read-only JIZZ PERSPECTIVE integration |
| **rocksoul-jizz** | JIZZ Node.js API (external) | bjo163 | PERSPECTIVE data source, port 8787 |

### 5.2.2 Module Structure (apps/jizz)

```
Module: apps/jizz/src/app/
├── layout.tsx          # Root layout, JizzNavbar, semantic landmarks
├── page.tsx            # Home page, main entry point
├── globals.css         # Theme tokens, Tailwind v4 base
├── loading.tsx         # Loading boundary component
├── error.tsx           # Error boundary component
└── not-found.tsx       # Not-found boundary component

Module: apps/jizz/src/components/
├── navbar.tsx          # JizzNavbar wrapper with ecosystem links
├── observation-card.tsx # Single observation display
├── perspective-list.tsx # Perspectives by actor
├── phenomenon-detail.tsx # Phenomenon comprehensive view
├── framing-reaction.tsx # Framings & reactions display
├── signal-change.tsx   # Signals & changes display
├── timeline.tsx        # Timeline visualization
└── sources-directory.tsx # Sources directory with provenance

Module: apps/jizz/src/lib/
├── jizz-api.ts         # JIZZ API client (port 8787)
├── validation.ts       # JSON Schema validation (AJV)
└── types.ts            # TypeScript type definitions from JIZZ schema

Module: apps/jizz/src/styles/
└── globals.css         # Custom theme tokens extending Moon UI
```

### 5.2.3 Dependency Direction

```
apps/jizz  ←  @moonwitness/ui  (import interactive elements)
apps/jizz  ←  @moonwitness/types (import shared data contracts)
apps/jizz  ←  rocksoul-jizz API (consume JIZZ data, port 8787)
                              ↑
                              ←  apps/arsy, dock, headquarter, id
                              (shared packages, mutual dependency)
```

### 5.2.4 Import Restrictions

| Allowed | Not Allowed |
|---------|-------------|
| `import { Button } from '@moonwitness/ui'` | `import { Button } from ...` (raw HTML) |
| `import { mwClient } from '@allah/sdk'` | `fetch('/v1/...')` without SDK routing (if hub comms) |
| `import { UserSubject } from '@moonwitness/types'` | `interface UserSubject { ... }` local declaration |
| `import { JizzApiClient } from '@/lib/jizz-api'` | Direct fetch to JIZZ API without client wrapper |
| `import cn from '@/lib/utils'` | `import cn from '...'` (non-utils modules) |
| Dynamic imports for heavy components | Unnecessary framework migrations |

### 5.2.5 Cross-Package Communication

- **jizz → @moonwitness/ui:** Import components, blocks, primitives, tokens
- **jizz → @moonwitness/types:** Import UserSubject, ActiveSession, etc.
- **jizz → rocksoul-jizz:** Consume JIZZ API via custom client
- **jizz ← @moonwitness/ui:** Components used by jizz pages
- **jizz ← @moonwitness/types:** Type definitions consumed by jizz
- **jizz ← rocksoul-jizz:** Data consumed from JIZZ API

No circular dependencies allowed. jizz does not mutate shared packages or JIZZ canonical records.

## 5.3 Data Architecture

### 5.3.1 Data Ownership

| Data Domain | Owner | Source | Mutability |
|-------------|-------|--------|------------|
| **Observations** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Perspectives** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Framings** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Reactions** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Signals** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Changes** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Snapshots** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Insights** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Foreign References** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **Sources** | ROCKSOUL JIZZ | JIZZ API (read-only) | Read-only (consumed) |
| **UI State** | Local component state | Client-side | Mutable (transient) |
| **User Session** | MoonWitness ID SSO | @allah/sdk / existing auth | Mutable (if auth required) |

### 5.3.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORLD OBSERVATORY DATA FLOW                    │
│                                                                   │
│  JIZZ Node.js API (read-only, port 8787)                          │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────┐                                           │
│  │ Runtime Validation  │                                           │
│  │ (JSON Schema)       │                                           │
│  └─────────────────────┘                                           │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────┐                                           │
│  │ View Model         │ ← Transformation layer                     │
│  │ (JIZZ → JIZZ app)  │                                           │
│  └─────────────────────┘                                           │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────┐                                           │
│  │ UI State           │ ← Client-side, transient                   │
│  │ (loading, error,   │                                           │
│  │  filters, search)  │                                           │
│  └─────────────────────┘                                           │
│                                                                   │
│  Path: JIZZ API → Validation → View Model → UI State → Rendering │
│                                                                   │
│  Constraints:                                                       │
│  • All upstream data treated as untrusted input                    │
│  • Runtime validation against JSON Schema Draft 2020-12             │
│  • Preserve provenance (URL, identity, timestamps)                 │
│  • Never invent dates, geography, actors, positions                │
│  • Absent data marked UNKNOWN/NOT PROVIDED                        │
│  • Synthetic fixtures visibly labeled, never as live data          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3.3 Temporal Data Handling

| Field | Treatment | Reason |
|-------|-----------|--------|
| `createdAt` | Preserve timestamp | Original observation creation time |
| `publishedAt` | Preserve timestamp | Original publication date |
| `retrievedAt` | Add retrieval timestamp | When data was fetched from API |
| `schemaVersion` | Preserve version | API contract version |
| `metadata` | Preserve as-is | Source-provided metadata |
| `uncertainty` | Preserve explicitly | If provided by API |

### 5.3.4 Provenance Chain

```
Observation → Source URL → Source Identity → Publication Date → 
Retrieval Date → Schema Version → Methodology Version → Uncertainty
```

Every observation must retain:
- Source reference (URL/identity)
- Publication/retrieval/observation timestamps
- Provenance when provided
- No invented dates, geography, actor types, positions

## 5.4 API Integration Architecture (JIZZ Node.js API)

### 5.4.1 Integration Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    JIZZ API INTEGRATION                           │
│                                                                   │
│  Pattern: Server Components fetch data from JIZZ API (port 8787), │
│           pass to Client Components                               │
│                                                                   │
│  Authentication: Public read-only, no auth tokens initially        │
│  SSRF Prevention: Validate all external URLs, whitelist protocols   │
│  Timeout: Explicit timeout on all upstream fetches (5s default)    │
│  Retry: Bounded retry (max 3 attempts), safe GET only            │
│  Cache: Explicit freshness/invalidation policy                    │
│  Paginate: All list endpoints paginated, never unbounded          │
│  Error Mapping: Upstream errors → user-friendly states            │
│  Validation: JSON Schema Draft 2020-12 with AJV                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4.2 JIZZ API Client (src/lib/jizz-api.ts)

```typescript
// JIZZ API Client - Server Components only
// Base URL: http://127.0.0.1:8787
// Patterns:
// - Use getPhenomena(), getPhenomenon(id), getPerspectives(), etc.
// - Runtime validate all upstream payloads against JSON Schema
// - Never accept arbitrary URL overrides
// - SSRF: validate external links, protocols
// - Timeout: explicit, bounded (5s default)
// - Retry: max 3, safe GET only, idempotent
// - Cache: explicit freshness/invalidation
// - Paginate: all lists, never unbounded

// Example:
// const phenomena = await jizzClient.getPhenomena({
//   page: 1,
//   limit: 50,
//   filters: {/* validated filters */}
// })
//
// const phenomenon = await jizzClient.getPhenomenon('PHEN-JIZZ-AI-WORKFORCE-TRANSITION-2026')
// const observations = await jizzClient.getObservations(phenomenonId, { page: 1, limit: 20 })
// const perspectives = await jizzClient.getPerspectives(phenomenonId, { page: 1, limit: 20 })
// const framings = await jizzClient.getFramings(phenomenonId)
// const reactions = await jizzClient.getReactions(phenomenonId)
// const signals = await jizzClient.getSignals(phenomenonId)
// const changes = await jizzClient.getChanges(phenomenonId)
// const snapshots = await jizzClient.getSnapshots(phenomenonId)
// const insights = await jizzClient.getInsights(phenomenonId)
// const foreignRefs = await jizzClient.getForeignReferences(phenomenonId)
```

### 5.4.3 API Endpoint Constraints

| Constraint | Description | Enforcement |
|------------|-------------|-------------|
| **No arbitrary URL overrides** | Request parameters cannot modify base URL | Code review, CI gate |
| **SSRF prevention** | Validate all external URLs/links | URL protocol validation, host whitelisting |
| **No secrets in client** | No NEXT_PUBLIC variables with secrets | Code review, CI gate |
| **Runtime validation** | Upstream payloads validated against JSON Schema | AJV validator |
| **Explicit timeout** | All fetches have timeout (5s default) | AbortController, timeout ms |
| **Bounded retry** | Max 3 attempts, idempotent only | Retry logic with exponential backoff |
| **Never guess semantics** | Preserve meaning and uncertainty | Documentation, type system |
| **No silent fixture substitution** | Live data failure → error state | Testing, error boundaries |

### 5.4.4 Data Transformation

```
JIZZ API Payload → JSON Schema Validation → View Model → UI State → Rendering
```

**Transformation Steps:**
1. **Schema Validation** — Validate against JSON Schema Draft 2020-12 using AJV
2. **Provenance Extraction** — Extract URL, identity, timestamps
3. **Uncertainty Preservation** — Keep uncertainty fields as-is
4. **Schema Version Tagging** — Add schema version to view model
5. **Methodology Version Tagging** — Add methodology version to view model
6. **Uncertainty Normalization** — Standardize uncertainty presentation
7. **Synthetic Labeling** — If using fixtures, visibly label as synthetic/test
8. **Fallback Mapping** → Map to UI state (loading, error, empty, etc.)

### 5.4.5 Error Mapping

| Upstream Error | User-Friendly State | Description |
|----------------|--------------------|-------------|
| **404 Not Found** | Not-found boundary | Resource doesn't exist |
| **429 Too Many Requests** | Error state + retry | Rate limited, retry after backoff |
| **500 Server Error** | Error state + retry | Temporary server issue |
| **Network Failure** | Error state + retry | Connectivity issue |
| **Timeout** | Error state + retry | Request timed out |
| **Validation Failure** | Error state + retry | Payload schema mismatch |
| **Partial Data** | Partial state | Some data available, some missing |
| **No Data** | Empty state | Legitimate empty result set |

## 5.5 Security Architecture

### 5.5.1 Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORLD OBSERVATORY TRUST BOUNDARIES           │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────────┐  ┌─────────────┐ │
│  │ Public Internet │  │  WORLD OBSERVATORY    │  │ Client      │ │
│  │ (untrusted)     │  │ (read-only,         │  │ (browser)   │ │
│  └─────────────────┘  │  untrusted input)    │  └─────────────┘ │
│                       └─────────────────────┘                       │
│                                                                   │
│  Data Flow:                                                       │
│  • Internet → JIZZ API → Validation → View Model → UI             │
│  • All upstream data treated as untrusted                       │
│  • Runtime validation against JSON Schema before any use          │
│  • No executable instructions from source content               │
│                                                                   │
│  Security Principles:                                             │
│  • Least privilege: public read-only by default                  │
│  • Explicit authorization: if auth required, use SSO              │
│  • Data integrity: runtime validation of all payloads            │
│  • No secrets in client bundles                                  │
│  • SSRF prevention on all external URLs                         │
│  • Source content as untrusted input, never executable           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5.2 Authentication & Authorization

| Scenario | Auth Required | Implementation |
|----------|---------------|----------------|
| **Public read-only** | ❌ No | Initial phase; no auth required |
| **SSO via MoonWitness ID** | ✅ Optional | Use @allah/sdk if/when required |
| **Custom auth system** | ❌ No | Not in current scope |
| **Session management** | ❌ No | Not in current scope |

**If auth becomes necessary:**
- Use existing MoonWitness ID/SSO via @allah/sdk
- Never implement local password/session/auth storage
- Encode output; redact logs
- No unnecessary personal data or profiling

### 5.5.3 SSRF Prevention

**URL Validation Rules:**
1. **Protocol whitelist:** Only allow `http:` and `https:` protocols
2. **Host validation:** Whitelist approved hosts/patterns
3. **No arbitrary overrides:** Request parameters cannot modify base URL
4. **Link validation in UI:** All displayed links validated before rendering
5. **Console logging:** Never log raw source payloads containing URLs

**Implementation:**
```typescript
// URL validation utility
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
```

### 5.5.4 Secret Handling

| Secret Type | Storage | Reason |
|-------------|---------|--------|
| **API keys** | Server-only, never in client bundle | Prevent exposure |
| **Authentication tokens** | Server-only, via @allah/sdk | Prevent client-side storage |
| **Database credentials** | Not applicable (read-only) | No database in current scope |
| **NEXT_PUBLIC variables** | ❌ Never | Violates security principle |
| **Session cookies** | HttpOnly, SameSite if auth required | Standard practice |

**Implementation:**
- No `NEXT_PUBLIC` environment variables with secrets
- All credentials loaded from `.env.local` (server-side only)
- Client components cannot import server-only modules

### 5.5.5 Input/Output Sanitization

**Input (Upstream Data):**
1. Runtime validate against JSON Schema before any use
2. Never trust source content as executable instructions
3. Treat source content as untrusted data
4. Preserve uncertainty and disagreement
5. Encode output to prevent XSS

**Output (Rendered UI):**
1. Encode all user-displayed content
2. Use textContent over innerHTML when possible
3. Sanitize any HTML if innerHTML required
4. Never inject raw source data into DOM without encoding
5. Validate all URLs before rendering as links

## 5.6 UI/UX Architecture

### 5.6.1 Information Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORLD OBSERVATORY IA                            │
│                                                                   │
│  Home ─────► Phenomena Catalog ─────► Phenomenon Detail           │
│         │                        │                               │
│         ▼                        ▼                               │
│  Signals Index ────► Signal Detail ────► Timeline                 │
│         │                        │                               │
│         ▼                        ▼                               │
│  Sources Directory ────► Source Detail ────► Methodology          │
│                                                                   │
│  Global navigation: EcosystemNavbar (Dock, Headquarter, ID)      │
│  Footer: Provenance, methodology, uncertainty, contact          │
│                                                                   │
│  Hierarchy:                                                       │
│  1. Home (global overview)                                      │
│  2. Phenomena (catalog of topics)                               │
│  3. Phenomenon Detail (comprehensive view)                      │
│  4. Perspectives (actor framings)                               │
│  5. Framings & Reactions (angle/response)                       │
│  6. Signals (meaningful changes)                                │
│  7. Timeline (evolution over time)                              │
│  8. Sources (provenance chain)                                  │
│  9. Methodology (analytical methods)                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6.2 Screen/Page Structure

| Page/Route | Component | Purpose |
|------------|-----------|---------|
| `/` | HomePage | Identity band, engine core question, observations grid, perspectives |
| `/phenomena` | PhenomenaCatalog | Searchable/filterable list with counts and status |
| `/phenomena/[id]` | PhenomenonDetail | Comprehensive view with overview, signals, perspectives, sources, framings, reactions |
| `/signals` | SignalsIndex | Index of meaningful signals/changes |
| `/signals/[id]` | SignalDetail | Individual signal with methodology |
| `/sources` | SourcesDirectory | Complete provenance chain |
| `/methodology` | MethodologyPage | Ontology, formulas, uncertainty documentation |
| `/` (catch-all) | NotFound | Invalid route handling |

### 5.6.3 Component Hierarchy

```
Root Layout
│
├── EcosystemNavbar (persistent)
│   ├── Dock link (port 3001)
│   ├── Headquarter link (port 3002)
│   ├── ID link (port 3003)
│   └── WORLD OBSERVATORY badge
│
├── Hero Section (home only)
│   ├── Identity band
│   ├── Engine credit: "Powered by ROCKSOUL JIZZ"
│   ├── Core question: "HOW IS THE WORLD SEEING IT?"
│   └── Tagline: "THE WORLD, FROM EVERY ANGLE."
│
├── Main Content Area
│   ├── Observations Grid (home only)
│   ├── Phenomena Catalog
│   ├── Perspective Comparison
│   ├── Framings & Reactions
│   ├── Signals Index
│   ├── Timeline Visualization
│   └── Sources Directory
│
├── Loading Boundary (overlay)
│   ├── Spinner animate-spin text-amber-400
│   └── Text: "Loading WORLD OBSERVATORY data..."
│
├── Error Boundary
│   ├── Error message
│   └── Try Again button
│
└── Not-Found Boundary
    ├── "Page not found" message
    └── Home link
```

### 5.6.4 States for Each Data Component

Every data component handles these states:

| State | Description | Implementation |
|-------|-------------|----------------|
| **loading** | Data fetch in progress | Spinner + text, disable interactions |
| **loaded** | Data available | Render main content |
| **empty** | No data available | Empty state illustration + message |
| **filtered-empty** | Data filtered out | Empty state with filter summary |
| **partial** | Some data, some missing | Mix of loaded + empty states |
| **stale** | Data older than threshold | Warning indicator + refreshed data |
| **unavailable** | Temporarily unavailable | Retry button + timeout info |
| **timeout** | Request timed out | Timeout message + retry |
| **error** | Fetch failed | Error message + retry |
| **invalid ID** | Non-existent resource | Not-found boundary |

### 5.6.5 Accessibility Architecture

| Feature | Implementation | WCAG Reference |
|---------|---------------|----------------|
| **Semantic landmarks** | `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>` | ARL AAA 1.3.1 |
| **Keyboard focus** | Visible focus-visible outlines | AA 2.4.7 |
| **Focus order** | Logical tab order, skip links | AA 2.4.3 |
| **Contrast ratios** | Minimum 4.5:1 for normal text | AA 1.4.3 |
| **Reduced motion** | `@media (prefers-reduced-motion)` | AA 2.3.3 |
| **Screen readers** | Semantic HTML, aria labels where needed | AA 1.3.1 |
| **Color not sole encoding** | Supplementary indicators alongside color | AA 1.4.1 |
| **Responsive layout** | Tailwind v4 mobile-first breakpoints | AA 1.4.10 |
| **Text resize** | Content up to 200% without loss of function | AA 1.4.4 |

### 5.6.6 Responsive Behavior

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **mobile** | 320px - 767px | Single column, stacked content, full-width touch targets |
| **tablet** | 768px - 1023px | Two-column layout, compressed but readable |
| **desktop** | 1024px+ | Three+ column grid, dense information architecture |

### 5.6.7 Visual Design Direction

**Principle:** Premium, cinematic, source-grounded intelligence observatory
- **Distinct from:** Dock (community portal), Headquarter (operations), ID (auth)
- **Visual language:** Monumental composition, controlled illumination, atmospheric depth, celestial geometry
- **No generic SaaS dashboard patterns:** No repetitive card grids, fake HUD, fake counters
- **Motion purpose:** Transitions communicate state changes, respect reduced-motion
- **Accessibility:** Color never sole encoding, charts/maps need text alternatives

### 5.6.8 Design Token Strategy

**Moon UI Tokens (reused first):**
- Color palette from `@moonwitness/ui` theme
- Typography tokens (font sizes, line heights, weights)
- Spacing scale (4px increment scale)
- Radius scale (from `@moonwitness/ui` configuration)
- Shadow tokens
- Elevation tokens

**WORLD OBSERVATORY Extensions (where Moon UI doesn't fit):**
- **Color roles:** Extended from Moon UI tokens, not replacements
- **Typography hierarchy:** Consistent with product voice
- **Spatial composition:** Cinematic, intentional margins/padding
- **Motion behavior:** Purposeful transitions, reduced-motion support

**Never:**
- Create competing color system
- Duplicate typography scale
- Introduce second icon system
- Add second chart/map type system without documented need

---

## 5.7 Infrastructure & Deployment Architecture

### 5.7.1 Development Environment

| Component | Configuration | Tooling |
|-----------|--------------|---------|
| **Local dev server** | `pnpm jizz:dev` → port 3004 | Next.js development server |
| **Turbopack** | CSS via `@tailwindcss/turbopack` | Next.js Turbopack |
| **Type checking** | `pnpm --filter @moonwitness/jizz typecheck` | tsc --noEmit |
| **Linting** | `pnpm lint:arch` | @moonwitness/lint check-architecture.mjs |
| **Docs check** | `pnpm docs:check` | tsx scripts/check-doc-contracts.ts |
| **Build** | `pnpm jizz:build` | next build |
| **Format** | `prettier` or project formatter | Code style |
| **JIZZ API** | `npm run start` (rocksoul-jizz) → port 8787 | Node.js 22+ |

### 5.7.2 Production Build

| Step | Command | Purpose |
|------|---------|---------|
| **1.** | `pnpm jizz:build` | Create production build |
| **2.** | Verify `.next/` directory | Production artifacts |
| **3.** | Serve with `next start -p 3004` | Production server |
| **4.** | Analyze bundle size | Optimization opportunities |

### 5.7.3 Deployment Architecture

| Environment | Purpose | Deployment |
|-------------|---------|------------|
| **Development** | Local development, testing | `pnpm jizz:dev` |
| **Staging** | Pre-production verification | Separate approval |
| **Production** | Live deployment | Separate DNS/secrets approval |

**Deployment Constraints (per AGENTS.md & DOCUMENTATION_CONTRACT):**
- No production deployment in this plan phase
- DNS, secrets, DNS changes require separate explicit approval
- GitHub Actions publishes images to GHCR on main push
- Coolify deployment triggered by GHCR images
- IMAGE_PREFIX and IMAGE_TAG control production image selection

### 5.7.4 CI/CD Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI PIPELINE FOR jizz                           │
│                                                                   │
│  push → dev branch → pnpm dev → pnpm lint:arch → pnpm typecheck  │
│       │                                   │                       │
│       └───────────────✓ PASSED──────────┘                       │
│                                                                   │
│  push → main branch → pnpm dock:build, pnpm headquarter:build,    │
│       pnpm --filter @allah/arsy build → GHCR publish → Coolify     │
│       │                                   │                       │
│       └───────────────✓ PASSED──────────────────────────────────┘
│                                                                   │
│  Quality Gates (must pass 100%):                                  │
│  1. pnpm docs:check (Documentation Contract Score 100/100)        │
│  2. pnpm lint:arch (Monorepo Architectural Invariant Gate)         │
│  3. pnpm typecheck (Strict TypeScript Compilation Gate)            │
│  4. pnpm dock:build                                               │
│  5. pnpm headquarter:build                                        │
│  6. pnpm id:build                                                 │
│  7. pnpm --filter @allah/arsy build                              │
│                                                                   │
│  CI promotes dev → main only after 100% pass                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.7.5 Observability Architecture

| Metric | Collection | Purpose |
|--------|------------|---------|
| **FCP, LCP, TTI** | Lighthouse audit | Performance baseline |
| **Error counts** | Console logging + error boundary metrics | Failure tracking |
| **API response codes** | Frontend logging | API health monitoring |
| **Bundle size** | Next.js analysis | Optimization tracking |
| **Accessibility score** | axe-core audit | AA compliance tracking |

---

## 5.8 Phasing & Implementation Roadmap

### 5.8.1 Phase 1: Foundation (Current)

| Objective | Deliverables | Dependencies | Risks | Exit Criteria |
|-----------|-------------|--------------|-------|---------------|
| **App scaffold** | `apps/jizz/` with all config files | None (greenfield) | None | `pnpm jizz:dev` runs, build passes |
| **Root layout** | `layout.tsx` with JizzNavbar | Package deps | None | Navbar renders, cross-app links work |
| **Home page** | `page.tsx` with hero, observations, perspectives | Layout, UI comps | API unavailable | Home renders without errors |
| **Boundary files** | `loading.tsx`, `error.tsx`, `not-found.tsx` | None | None | All three render correctly |
| **Quality gates** | `pnpm lint:arch` passes | Package deps | None | 100% compliance |
| **Documentation** | `README.md`, `AGENTS.md` | None | None | Files exist, frontmatter valid |

**Phase 1 Exit:** All above criteria met, app can develop independently.

### 5.8.2 Phase 2: JIZZ API Integration

| Objective | Deliverables | Dependencies | Risks | Exit Criteria |
|-----------|-------------|--------------|-------|---------------|
| **JIZZ API Client** | `src/lib/jizz-api.ts` with all endpoint methods | Phase 1, JIZZ API running | API unavailable | Client fetches data, validates against schema |
| **JSON Schema Validation** | AJV setup, schema files, runtime validation | Phase 2, JIZZ schema | Schema changes | Validation passes for all payloads |
| **Phenomena Catalog** | Searchable/filterable list with counts | Phase 2, JIZZ API | API data | Catalog renders, filters work |
| **Phenomenon Detail** | Comprehensive detail with all sections | Phase 2, JIZZ API | API data | Detail page renders, all sections present |
| **Perspective Comparison** | Side-by-side actor framing comparison | Phase 2, JIZZ API | API data | Comparison renders, actors visible |
| **Framings & Reactions** | Display framings and reactions | Phase 2, JIZZ API | API data | Framings/reactions render with classifications |
| **Signals & Changes** | Display signals and changes with methodology | Phase 2, JIZZ API | API data | Signals/changes render with methodology |
| **Typecheck** | `pnpm --filter @moonwitness/jizz typecheck` passes | Phase 2, type deps | Type errors | No TypeScript errors |

**Phase 2 Exit:** All core features operational, typecheck passes.

### 5.8.3 Phase 3: Feature Integration

| Objective | Deliverables | Dependencies | Risks | Exit Criteria |
|-----------|-------------|--------------|-------|---------------|
| **Timeline Visualization** | Chronological tracking of perspectives | Phase 2, API data | API support | Timeline renders, navigation works |
| **Sources Directory** | Complete provenance chain | Phase 2, API data | API support | Sources render with URLs |
| **Methodology Documentation** | Ontology, formulas, uncertainty | Phase 2, API data | API support | Methodology renders, clear |
| **Research Pipeline View** | Display research candidates (optional) | Phase 2, JIZZ API | API support | Research pipeline renders if exposed |
| **Quality Gates** | `pnpm docs:check` passes | Doc deps | Doc violations | 100/100 score or close |

**Phase 3 Exit:** All Phase 2+3 features operational, docs contract passes.

### 5.8.4 Phase 4: Hardening

| Objective | Deliverables | Dependencies | Risks | Exit Criteria |
|-----------|-------------|--------------|-------|---------------|
| **Performance Audit** | FCP < 2s, TTI < 5s | Phase 3, build config | Performance | Lighthouse scores meet targets |
| **Accessibility Audit** | WCAG AA compliance | Phase 3, comps | Accessibility | axe-core score AA or close |
| **Responsive QA** | Desktop/tablet/mobile | Phase 3, CSS | Responsive | Layout works at 320px-1920px+ |
| **Security Review** | SSRF, secrets, input validation | Phase 3, code | Security | No critical findings |
| **Quality Gates** | All gates green | All prior phases | Any fail | All quality gates pass |

**Phase 4 Exit:** All non-functional requirements verified, security review passed.

### 5.8.5 Phase 5: Release Preparation

| Objective | Deliverables | Dependencies | Risks | Exit Criteria |
|-----------|-------------|--------------|-------|---------------|
| **Production Build** | `pnpm jizz:build` outputs | Phase 4, config | Build errors | Build creates .next/ directory |
| **Staging Deployment** | Verified on staging env | Phase 4, ops | Deploy issues | Staging serves correctly |
| **Release Checklist** | All criteria met | All prior phases | Missing items | Checklist 100% complete |
| **Quality Gates** | All gates pass + deployment prep | All prior | Any fail | Ready for deployment approval |

**Phase 5 Exit:** Ready for deployment approval (separate process).

### 5.8.6 Summary Roadmap

| Phase | Name | Key Deliverables | Duration |
|-------|------|-----------------|----------|
| **1** | Foundation | App scaffold, layout, home, boundaries, quality gates | ✅ In progress |
| **2** | JIZZ API Integration | API client, validation, phenomena catalog, detail, perspectives, framings, reactions, signals, changes, typecheck | Pending |
| **3** | Feature Integration | Timeline, sources, methodology, research pipeline (optional), docs contract | Pending |
| **4** | Hardening | Performance, accessibility, responsive, security | Pending |
| **5** | Release | Production build, staging, checklist | Pending |

### 5.8.7 Parallelization Opportunities

| Workstream | Can Run Parallel With | Reason |
|------------|----------------------|--------|
| **UI Components** | JIZZ API integration | Components don't depend on API data |
| **Documentation** | Code development | Docs can be written from spec |
| **Quality Gates** | Feature development | Gates run on stable builds |
| **TypeScript Types** | API types | Types defined from API contracts |

### 5.8.8 Dependency Summary

| Dependency | Phase Required | Critical Path |
|------------|----------------|---------------|
| **JIZZ API availability** | Phase 2 (start), critical for Phase 2+ | 🔴 Critical |
| **@moonwitness/ui compatibility** | Phase 1+ | 🟡 Important |
| **@moonwitness/types compatibility** | Phase 1+ | 🟡 Important |
| **TypeScript strict mode** | Phase 1+ | 🟡 Important |
| **Lint architecture gate** | Phase 1+ | 🟢 Maintain |
| **Documentation contract** | Phase 3+ | 🟢 Maintain |

---

## 5.9 Acceptance Criteria Summary

| Criteria | Description | Verification |
|----------|-------------|--------------|
| **AC-001** | App builds independently | `pnpm jizz:build` succeeds |
| **AC-002** | Passes architectural lint | `pnpm lint:arch` 100% compliance |
| **AC-003** | TypeScript typecheck passes | `pnpm --filter @moonwitness/jizz typecheck` |
| **AC-004** | Documentation contract passes | `pnpm docs:check` 100/100 |
| **AC-005** | Home page renders correctly | Visual inspection + automated test |
| **AC-005** | Observations display | Observations grid renders without errors |
| **AC-005** | Perspectives display | Perspective list renders without errors |
| **AC-005** | Responsive layout | Layout functions at mobile/tablet/desktop |
| **AC-005** | Loading state | `loading.tsx` renders during data fetch |
| **AC-005** | Error state | `error.tsx` renders on fetch failure |
| **AC-005** | Not-found state | `not-found.tsx` renders on invalid route |
| **AC-006** | Engine credit visible | "Powered by ROCKSOUL JIZZ" badge present |
| **AC-007** | Ecosystem navigation | Navbar links to dock (3001), headquarter (3002), id (3003) |
| **AC-008** | No raw HTML controls | No raw `<button>` or `<input>` in app code |
| **AC-009** | JIZZ API client operational | `jizz-api.ts` fetches data, validates against schema |
| **AC-010** | Accessibility baseline | WCAG AA audit passed |
| **AC-011** | No production deployment claim | Plan marks as separate approval |

---

**Related Documents:**
- [00-executive-overview.md](00-executive-overview.md)
- [01-product-vision.md](01-product-vision.md)
- [02-project-scope.md](02-project-scope.md)
- [03-requirements.md](03-requirements.md)
- [04-current-state.md](04-current-state.md)
- [06-implementation-roadmap.md] (planned)
- [07-acceptance-criteria.md] (planned)
- [08-risk-register.md] (planned)