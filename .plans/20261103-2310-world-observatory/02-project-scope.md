---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-SCOPE"
version: "2.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Project Scope

## 2.1 Product Scope

### 2.1.1 In Scope (Current Phase - Phase 1)
| Scope Item | Description | Evidence |
|------------|-------------|----------|
| **APP-01** | Next.js 16 App Router foundation | `apps/jizz/` package exists |
| **APP-02** | Shared UI component integration | `@moonwitness/ui` dependencies configured |
| **APP-03** | Home page with identity band and engine credit | `apps/jizz/src/app/page.tsx` renders hero section |
| **APP-04** | Observation display component | Basic observation rendering implemented |
| **APP-05** | Perspective listing by actor | Basic perspective display in place |
| **APP-06** | Responsive layout foundation | Tailwind v4 with mobile-first breakpoints |
| **APP-07** | Boundary components (loading/error/not-found) | All three boundary files exist |
| **APP-08** | Root navigation and routing | EcosystemNavbar integration configured |
| **APP-08** | Documentation and task tracking | README.md, AGENTS.md, plan artifacts |

### 2.1.2 Out of Scope (Current Phase)
| Scope Item | Reason |
|------------|--------|
| **OUT-01** | User authentication system (public read-only) |
| **OUT-02** | Personalization and saved views |
| **OUT-03** | Content mutation of JIZZ canonical records |
| **OUT-04** | Prediction or forecasting capabilities |
| **OUT-05** | Truth ranking or "correct view" assignment |
| **OUT-06** | Event, Story, Person, Text, Law, or Relationship data |
| **OUT-06** | Production deployment (separate approval required) |
| **OUT-07** | Full-text article rendering (source references only) |
| **OUT-08** | Advanced analytics dashboard |
| **OUT-08** | Export or sharing functionality |
| **OUT-09** | JIZZ automatic research pipeline (separate repo) |

## 2.2 Feature Scope

### 2.2.1 Phase 1 Features (Current)
| Feature ID | Feature | Description | Acceptance |
|------------|---------|-------------|------------|
| **FR-001** | Home Page | Displays WORLD OBSERVATORY identity, engine credit, and core question | ✅ Implemented |
| **FR-002** | Observations List | Displays recent source-grounded observations with source attribution | ✅ Implemented |
| **FR-003** | Perspective Listing | Lists perspectives by actor with framing classification | ✅ Implemented |
| **FR-004** | Responsive Layout | Layout adapts between desktop, tablet, and mobile | ✅ Implemented |
| **FR-005** | Loading State | Shows loading indicator during data fetch | ✅ Implemented |
| **FR-006** | Error State | Shows error boundary on data failure | ✅ Implemented |
| **FR-007** | Not-Found State | Shows appropriate message for invalid routes | ✅ Implemented |
| **FR-008** | Engine Credit | Displays "Powered by ROCKSOUL JIZZ" attribution | ✅ Implemented |

### 2.2.2 Phase 2 Features (Planned)
| Feature ID | Feature | Description | Dependencies |
|------------|---------|-------------|------------|
| **FR-010** | JIZZ API Client | Custom client to consume JIZZ Node.js API (port 8787) | Phase 1 |
| **FR-011** | Phenomena Catalog | Searchable/filterable list of phenomena with counts and status | FR-010 |
| **FR-012** | Phenomenon Detail Page | Comprehensive view with overview, signals, perspectives, sources | FR-011 |
| **FR-013** | Perspective Comparison | Side-by-side comparison of actor framings | FR-011 |
| **FR-014** | Timeline Visualization | Chronological tracking of perspective and framing changes | FR-011 |
| **FR-015** | Signals Index | Index of meaningful signals/changes with methodology | FR-011 |
| **FR-016** | Sources Directory | Complete provenance chain for each observation | FR-011 |
| **FR-017** | Framings & Reactions | Display framings and reactions for each phenomenon | FR-011 |

### 2.2.3 Phase 3 Features (Future)
| Feature ID | Feature | Description | Dependencies |
|------------|---------|-------------|------------|
| **FR-020** | Saved Views | User-specific view persistence (requires auth) | Out of scope |
| **FR-021** | Perspective Alerts | Notification on significant perspective shifts | Requires auth |
| **FR-022** | Advanced Filtering | Multi-dimensional filtering (actor, geography, time) | FR-011 |
| **FR-023** | Export Functionality | Export observations/analysis to common formats | FR-011 |
| **FR-024** | Comparative Analytics Dashboard | Summary statistics and visualizations | Requires data aggregation |
| **FR-025** | JIZZ Research Pipeline View | Display automatic research candidates | Requires JIZZ API |

### 2.2.4 Out of Scope Features
| Feature ID | Feature | Reason |
|------------|---------|--------|
| **OUT-FR-001** | User authentication system | Public read-only initially; separate auth infrastructure required |
| **OUT-FR-002** | Personalized saved views | Requires auth and data model changes |
| **OUT-FR-003** | Content mutation capabilities | Violates read-only integration constraint |
| **OUT-FR-004** | Truth ranking engine | Violates "PERSPECTIVE ≠ TRUTH" constraint |
| **OUT-FR-005** | JIZZ canonical record writes | Violates engine ownership boundary |
| **OUT-FR-005** | JIZZ database ORM integration | Violates "single ORM" invariant |
| **OUT-FR-006** | Message broker / event system | No genuine need identified |
| **OUT-FR-007** | Message queuing system | Over-engineering for read-only consumption |
| **OUT-FR-008** | Real-time WebSocket updates | No API support, adds unnecessary complexity |

## 2.3 Non-Functional Requirements

### 2.3.1 Performance Requirements
| ID | Requirement | Evidence |
|----|-------------|----------|
| **NFR-001** | First Contentful Paint < 2 seconds on broadband | Server Components for initial render |
| **NFR-002** | Time to Interactive < 5 seconds on broadband | Minimal Client Component hydration |
| **NFR-003** | Largest Contentful Paint < 2.5 seconds | Server-render stable content |
| **NFR-004** | No unbounded list fetches | Pagination implemented where needed |
| **NFR-005** | Bundle size within acceptable limits | Use dynamic imports for heavy components |

### 2.3.2 Accessibility Requirements
| ID | Requirement | Evidence |
|----|-------------|----------|
| **NFR-006** | WCAG AA compliance | Semantic landmarks, keyboard focus, sufficient contrast |
| **NFR-007** | Visible focus indicators | All interactive elements have focus-visible styles |
| **NFR-008** | Reduced-motion support | Nonessential transitions disabled |
| **NFR-009** | Screen reader compatibility | Semantic HTML, aria labels where needed |
| **NFR-010** | Color not sole encoding | Color never sole means of conveying information |

### 2.3.3 Reliability Requirements
| ID | Requirement | Evidence |
|----|-------------|----------|
| **NFR-011** | Graceful API failure | Error boundary, fallback UI states |
| **NFR-012** | Partial data handling | Empty, partial, stale states displayed |
| **NFR-013** | Timeout and retry logic | Safe GET requests only, bounded retry |
| **NFR-014** | No memory leaks | Proper cleanup of subscriptions/effects |
| **NFR-014** | Client Component isolation | Server Components for read-only data |

### 2.3.4 Security Requirements
| ID | Requirement | Evidence |
|----|-------------|----------|
| **NFR-015** | Public read-only by default | No auth required initially |
| **NFR-016** | No secrets in client bundles | Server-only modules, no NEXT_PUBLIC secrets |
| **NFR-016** | SSRF prevention | Validate external links/URLs |
| **NFR-017** | Source content treated as untrusted | Runtime validation, no executable instructions |
| **NFR-018** | No personal data collection | Public consumption only |

### 2.3.5 Compatibility Requirements
| ID | Requirement | Evidence |
|----|-------------|----------|
| **NFR-020** | Desktop compatibility | Chrome, Firefox, Safari, Edge |
| **NFR-021** | Tablet compatibility | iPad, Android tablets |
| **NFR-022** | Mobile compatibility | iOS, Android browsers |
| **NFR-023** | Screen size ranges | 320px to 1920px+ supported |

### 2.3.6 Observability Requirements
| ID | Requirement | Evidence |
|----|-------------|----------|
| **NFR-024** | Error tracking | Console logging, error boundary metrics |
| **NFR-025** | Performance metrics | FCP, FCP, TTI measured |
| **NFR-026** | API response monitoring | Status codes, payload sizes tracked |

## 2.4 Data Model (Aligned with JIZZ Schema)

### 2.4.1 Canonical Records (from JIZZ API)
| Record | Type | Description | Source |
|--------|------|-------------|--------|
| **SOURCE** | object | Where an observation originates; freshness and retrieval state recorded | JIZZ API |
| **OBSERVATION** | object | Something observed from a source at a point in time; preserves source linkage, phenomenon linkage, actor/subject references, raw locator metadata, language, geography, provenance | JIZZ API |
| **PHENOMENON** | object | A clustering subject for observations and perspectives | JIZZ API |
| **PERSPECTIVE** | object | Core JIZZ record: actor + context + position + framing references + time + evidence trail | JIZZ API |
| **FRAMING** | object | The angle from which phenomenon is presented (economic, political, security, humanitarian, technological, scientific, cultural, religious, environmental, legal, social, ethical, historical, identity, local, global) | JIZZ API |
| **REACTION** | object | Observed response (support, criticism, rejection, amplification, satire, boycott, adoption, warning, correction, defense, questioning, silence) | JIZZ API |
| **SIGNAL** | object | Derived pattern (emergence, surge, decline, revival, divergence, convergence, mutation, spread, fragmentation, recurrence) with inputs, methodology, version, confidence, timestamp | JIZZ API |
| **CHANGE** | object | Derived comparison between temporal states (volume, velocity, geography, framing, position, actor/source/perspective diversity, disagreement, convergence) | JIZZ API |

### 2.4.2 Derived Records (from JIZZ API)
| Record | Type | Description | Source |
|--------|------|-------------|--------|
| **PERSPECTIVE_SNAPSHOT** | object | Captures state of perspective field at a time | JIZZ API |
| **TREND** | object | Interprets measured signal/change with derivation references | JIZZ API |
| **PATTERN** | object | Interprets measured signal/change with derivation references | JIZZ API |
| **INSIGHT** | object | Interprets measured signal/change with derivation references | JIZZ API |
| **FOREIGN_REFERENCE** | object | Qualified pointer to owning repository (RGBL, MFTL, LEGEND, SUPERHERO, AWS, CORRELATION) | JIZZ API |
| **CROSS_REPO_REFERENCE** | object | Attaches foreign pointer to JIZZ-local record | JIZZ API |

### 2.4.3 Provenance Records
| Record | Type | Description | Source |
|--------|------|-------------|--------|
| **PROVENANCE** | object | Lineage of records | JIZZ API |
| **RESEARCH_RUN** | object | Automated research execution metadata | JIZZ API |
| **METHODOLOGY** | object | Analytical methodology with version | JIZZ API |

### 2.4.4 Research Staging Records
| Record | Type | Description | Source |
|--------|------|-------------|--------|
| **DISCOVERY_CANDIDATE** | object | Staged research candidate (authority: discovery_only until source inspected) | JIZZ API |
| **RESEARCH_TOPICS** | object | Scout topic configuration | JIZZ API |
| **RESEARCH_INDEX** | object | Research index matching candidate count | JIZZ API |

### 2.4.5 Temporal Tracking
- All data entities include schema version and timestamp
- Published/retrieval/observation timestamps preserved separately
- Methodology version tracked
- Schema versions tracked and versioned
- Historical snapshots remain reconstructable

## 2.5 API Integration Contract (JIZZ Node.js API)

### 2.5.1 Integration Pattern
- **Pattern:** Server Components fetch data from JIZZ API (port 8787), pass to Client Components
- **Authentication:** Public read-only, no auth tokens initially
- **SSRF Prevention:** Validate all external URLs, whitelist protocols
- **Timeout:** Explicit timeout on all upstream fetches (5s default)
- **Retry:** Bounded retry (max 3 attempts), safe GET only
- **Cache:** Explicit freshness/invalidation policy
- **Paginate:** All list endpoints paginated, never unbounded
- **Error Mapping:** Upstream errors mapped to user-friendly states

### 2.5.2 JIZZ API Endpoints (from rocksoul-jizz)
| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /health` | Health check | None |
| `GET /phenomena` | List all phenomena | pagination, filters |
| `GET /phenomena/:id` | Phenomenon detail | id (e.g., PHEN-JIZZ-AI-WORKFORCE-TRANSITION-2026) |
| `GET /phenomena/:id/sources` | Sources for phenomenon | id |
| `GET /phenomena/:id/observations` | Observations for phenomenon | id, pagination |
| `GET /phenomena/:id/perspectives` | Perspectives for phenomenon | id, pagination |
| `GET /phenomena/:id/framings` | Framings for phenomenon | id, pagination |
| `GET /phenomena/:id/reactions` | Reactions for phenomenon | id, pagination |
| `GET /phenomena/:id/signals` | Signals for phenomenon | id, pagination |
| `GET /phenomena/:id/changes` | Changes for phenomenon | id, pagination |
| `GET /phenomena/:id/snapshots` | Perspective snapshots | id, pagination |
| `GET /phenomena/:id/insights` | Insights for phenomenon | id, pagination |
| `GET /phenomena/:id/foreign-references` | Cross-repo references | id |

### 2.5.3 Data Flow
```
Server Component → JIZZ API Client → JIZZ Node.js API (port 8787) → Runtime Validation → View Model → UI
           ↘
           Safe fallback → Error states
```

### 2.5.4 Integration Constraints
1. **No arbitrary URL overrides** from request parameters
2. **SSRF prevention** — validate all external URLs, whitelist http/https only
3. **Credentials server-only** — no secrets in NEXT_PUBLIC
4. **Runtime validation** — upstream payloads validated against JSON Schema Draft 2020-12
5. **Never guess unknown semantics** — preserve meaning and uncertainty
6. **Explicit timeout and bounded retry** — safe patterns only
7. **Bound and paginate lists** — never unbounded fetches
8. **Never silently substitute golden fixtures** when live data fails
8. **Preserve IDs, schema versions, source references** when present

---

**Related Documents:**
- [00-executive-overview.md](00-executive-overview.md)
- [01-product-vision.md](01-product-vision.md)
- [03-requirements.md](03-requirements.md)
- [05-target-architecture.md](05-target-architecture.md)