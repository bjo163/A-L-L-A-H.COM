---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MCP-TOOL-REGISTRY-UI-REPORT"
version: "1.0.0"
owner: "product-engineering"
status: "completed"
last_verified: "2026-11-04"
---

# MCP Tool Registry & Execution UI — Feature Architecture Report

## 1. Autonomously Selected Focus Area

**Selected Feature:** MCP Tool Registry & Execution UI in Headquarter

**Location:** `apps/headquarter/src/app/tools/page.tsx` (existing page, to be enhanced)

**Plan Directory:** `.plans/20261104-mcp-tool-registry-ui/`

## 2. Why This Feature Was Selected

### Discovery Process
During repository exploration, the following observations were made:

1. **Existing Infrastructure:**
   - Arsy has MCP tool registration via `packages/arsy-plugin-llm-gateway`
   - SDK has `mcp.listTools()`, `mcp.callTool()`, `mcp.getAuditLog()` methods
   - Headquarter has `/tools` page showing static tool list
   - Audit event system is fully functional

2. **Missing Consumer:**
   - No UI for executing tools without writing code
   - No visual schema documentation for tool parameters
   - No audit log viewer for tool executions
   - No sandbox for safe tool experimentation

3. **Strategic Alignment:**
   - Headquarter's role is "Command Center" — tool registry fits perfectly
   - Leverages existing backend investment (no new API endpoints needed)
   - Showcases MCP protocol capabilities to operators
   - Provides transparency into AI agent tool usage

4. **Unexplored Area:**
   - Unlike auth, swarm, agent loop (which have UI), MCP tools had no consumer
   - No duplicate functionality exists
   - Clear gap between backend capability and frontend accessibility

### Selection Rationale
This feature was selected because it:
- **Delivers immediate value:** Operators can test tools without code
- **Leverages existing work:** No backend changes required
- **Fills a clear gap:** Backend has tools, frontend has nothing
- **Aligns with mission:** Headquarter = Command Center
- **Is implementation-ready:** Clear scope, well-defined interfaces
- **Has measurable outcomes:** Tool execution count, audit log completeness

## 3. Repository Discoveries

### Monorepo Structure
```
apps/
├── arsy/          — Fastify Hub (port 5150)
├── gate/          — Public entrance (port 3000)
├── dock/          — Dashboard (port 3001)
├── headquarter/   — Command center (port 3002) ← Feature location
├── id/            — Auth center (port 3003)
├── jizz/          — World Observatory (port 3004)
├── sentinel/      — RADIUS daemon
├── moonsky/       — Scaffold (unimplemented)
└── server/        — Empty

packages/
├── ui/            — Design system (6 skins, components, blocks)
├── sdk/           — Client SDK (all API methods)
├── types/         — Shared contracts (MCP types)
├── arsy-orm/      — PGlite ORM
└── arsy-plugin-llm-gateway/ — MCP tool registration
```

### Key Findings

**Mature Areas:**
- ✅ Arsy API with full auth, audit, rate limiting
- ✅ UI design system with 6 skins, component library
- ✅ SDK with typed client methods
- ✅ Audit event system
- ✅ Headquarter with 5 operational modules

**Scaffolds/Unimplemented:**
- ⚠️ apps/moonsky (Next.js config only)
- ⚠️ apps/server (empty directory)
- ⚠️ MCP tool execution UI (static list only) ← **Selected feature**

### Existing Capabilities Inventory

| Capability | Status | Location |
|------------|--------|----------|
| MCP tool registration | ✅ VERIFIED | `packages/arsy-plugin-llm-gateway` |
| MCP SDK client | ✅ VERIFIED | `packages/sdk/src/mcp.ts` |
| MCP endpoint | ✅ VERIFIED | `apps/arsy/src/routes/mcp.ts` |
| Audit events | ✅ VERIFIED | `apps/arsy/src/routes/admin.ts` |
| Tool list UI | ⚠️ PARTIAL | `apps/headquarter/src/app/tools/page.tsx` (static) |
| Tool execution UI | ❌ MISSING | — |
| Audit log viewer | ❌ MISSING | — |

## 4. Existing Implementation and Overlap Analysis

### No Overlap Detected
The feature does not duplicate any existing functionality:
- No other app provides tool execution UI
- No other component renders JSON Schema forms
- No audit log viewer exists anywhere in the ecosystem

### Adjacent Features (Not Overlapping)
| Feature | Relationship |
|---------|--------------|
| Agent Studio (`/agent`) | Uses agent loop, not direct tool execution |
| Swarm Ops (`/swarm`) | Multi-agent coordination, not tool-focused |
| AI Gateway (`/ai-gateway`) | Model routing, not tool registry |
| Knowledge (`/knowledge`) | Qorpus search, not tool execution |

### Integration Points
The feature integrates with (but does not duplicate):
- Existing MCP tool registry (backend)
- Existing SDK methods (client)
- Existing audit system (backend)
- Existing Headquarter layout (UI)

## 5. Generated Plan Directory

**Location:** `Z:\project\rocksoul-dx\.plans\20261104-mcp-tool-registry-ui\`

**Documents Created:**
| File | Purpose | Lines |
|------|---------|-------|
| `spec.md` | Feature specification (WHAT/WHY) | ~350 |
| `design.md` | Technical design (HOW/ARCHITECTURE) | ~650 |
| `task.md` | Implementation tasks (STEPS) | ~800 |
| `rule.md` | Implementation rules (CONSTRAINTS) | ~500 |
| `report.md` | This summary report | ~200 |

**Total:** ~2,500 lines of planning documentation

## 6. Summary of All Four Documents

### spec.md — Feature Specification
**Purpose:** Define WHAT the feature is and WHY it's needed

**Key Sections:**
- Vision: Transform `/tools` from static list to execution sandbox
- 8 Functional Requirements (FR-001 to FR-008)
- 6 Non-Functional Requirements (NFR-001 to NFR-006)
- Scope and Out-of-Scope (clear boundaries)
- 8 User Stories (US-001 to US-008)
- 9 Acceptance Criteria (AC-001 to AC-009)
- Success Metrics (tool discoverability, execution success rate, etc.)

**Highlights:**
- Tool Registry Browser with search/filter
- Tool Execution Sandbox with form validation
- Result Visualization with pretty-printing
- Audit Log Viewer with filtering/export
- Tenant isolation and security guards

### design.md — Technical Design
**Purpose:** Define HOW to architect and implement the feature

**Key Sections:**
- High-level architecture diagram
- Component structure (6 new UI components)
- Data models (MCP types, audit events)
- API contracts (MCP endpoint, SDK methods)
- Data flow diagrams (discovery, execution, audit)
- UI/UX flows (page layout, state panels)
- Error handling strategy (6 error types)
- Security guards (auth, tenant, SSRF, rate limiting)
- Observability strategy (telemetry, audit, metrics)
- Testing strategy (unit, integration, E2E)

**Highlights:**
- 6 new components in `packages/ui/src/components/`
- Dynamic form generation from JSON Schema
- Pretty-printed JSON result viewer
- Polling-based audit log (30s interval)
- WCAG AA accessibility compliance

### task.md — Implementation Tasks
**Purpose:** Define IMPLEMENTATION STEPS with dependencies

**Structure:**
- 5 Phases (Foundation, Execution, Audit, Polish, Verification)
- 23 Tasks (T-001 to T-023)
- Each task has: dependencies, subtasks, acceptance criteria, files to create/modify

**Phases:**
1. **Phase 1 (Tasks 1.1–1.4):** Tool Registry Browser — 4 sessions
2. **Phase 2 (Tasks 2.1–2.5):** Tool Execution Sandbox — 7 sessions
3. **Phase 3 (Tasks 3.1–3.4):** Audit Log Viewer — 6 sessions
4. **Phase 4 (Tasks 4.1–4.6):** Polish & Testing — 7 sessions
5. **Phase 5 (Tasks 5.1–5.3):** Verification — 3 sessions

**Total:** ~28 sessions (≈56–112 hours at 2–4 hours/session)

**Critical Path:**
```
T-001 → T-002 → T-003 → T-004 → T-010 → T-011 → T-012 → T-013 → T-020 → T-021 → T-023
                ↓
              T-005 → T-006 → T-007 → T-008 → T-009 ↗
```

### rule.md — Implementation Rules
**Purpose:** Define CONSTRAINTS and NON-NEGOTIABLE RULES

**Structure:**
- 15 Sections with 55 Rules (R-001 to R-055)

**Key Sections:**
1. Mandatory Architectural Invariants (5 rules)
2. Coding Conventions (5 rules)
3. Package Boundaries (4 rules)
4. Reusability Requirements (3 rules)
5. Naming Conventions (2 rules)
6. API/Database Rules (3 rules)
7. UI/UX Consistency (4 rules)
8. Security Requirements (4 rules)
9. Testing Requirements (4 rules)
10. Performance Constraints (3 rules)
11. Backward Compatibility (2 rules)
12. Forbidden Patterns (5 rules)
13. Agent Execution Boundaries (4 rules)
14. Git Workflow (4 rules)
15. Validation Requirements (3 rules)

**Highlights:**
- R-001 to R-003: UI purity, style purity, tenant isolation
- R-024: WCAG AA accessibility
- R-027 to R-030: Security (XSS, SSRF, rate limiting)
- R-040 to R-044: Anti-patterns (no premature abstraction, no AI-slop comments)
- R-053 to R-055: Verification before completion

## 7. Architecture and Expected Benefits

### Architecture Summary
```
┌─────────────────────────────────────────┐
│         Headquarter /tools page         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │ Tool List    │  │ Tool Execution  │  │
│  │ (cards)      │  │ (form + result) │  │
│  └──────────────┘  └─────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │       Audit Log Viewer            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓ uses @allah/sdk
┌─────────────────────────────────────────┐
│         Arsy /v1/mcp/message            │
│  ┌───────────────────────────────────┐  │
│  │  MCP Router (list/call tools)     │  │
│  └───────────────────────────────────┘  │
│              ↓ writes                   │
│  ┌───────────────────────────────────┐  │
│  │  arsy.audit.event (PGlite)        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Expected Benefits

| Benefit | Impact | Measurement |
|---------|--------|-------------|
| **Operator Empowerment** | Test tools without code | Tool execution count |
| **Transparency** | See all tool executions | Audit log completeness |
| **Discoverability** | Find tools by search/filter | Tool list usage |
| **Compliance** | Audit trail for tool usage | Audit events per execution |
| **Safety** | Validation prevents errors | Validation error rate |
| **Accessibility** | WCAG AA compliance | axe-core score |
| **Consistency** | Moon UI design system | UI_PURITY lint pass |

## 8. Dependencies and Implementation Priorities

### External Dependencies (All VERIFIED)
| Dependency | Provider | Status |
|------------|----------|--------|
| MCP tool registry | `packages/arsy-plugin-llm-gateway` | ✅ VERIFIED |
| SDK client methods | `packages/sdk` | ✅ VERIFIED |
| MCP endpoint | `apps/arsy` | ✅ VERIFIED |
| Audit event system | `apps/arsy` | ✅ VERIFIED |
| UI component library | `packages/ui` | ✅ VERIFIED |
| Type contracts | `packages/types` | ✅ VERIFIED |

### Implementation Priorities

**P0 (Phase 1):** Foundation
- Tool list browser
- Component library foundation
- **Priority:** Highest — enables all other phases

**P1 (Phase 2):** Execution
- Tool execution sandbox
- Form validation
- Result visualization
- **Priority:** High — core value proposition

**P2 (Phase 3):** Audit
- Audit log viewer
- Filtering and export
- **Priority:** Medium — compliance requirement

**P3 (Phase 4):** Polish
- Accessibility
- Responsive design
- Performance
- Documentation
- **Priority:** Required for production

**P4 (Phase 5):** Verification
- Quality gates
- Manual testing
- Security audit
- **Priority:** Required for completion

## 9. Recommended Next Steps

### Immediate (Before Implementation)
1. **Review this plan** — Ensure alignment with product vision
2. **Authorize implementation** — Explicit approval to proceed
3. **Prioritize phases** — Decide if all phases are needed or if MVP (Phase 1+2) suffices

### Short-Term (If Authorized)
1. **Create feature branch:** `feat/mcp-tool-registry-ui`
2. **Start with Task T-001:** Audit existing tool registry
3. **Follow task.md sequence:** Respect dependencies
4. **Adhere to rule.md:** All 55 rules are mandatory
5. **Update BACKLOG.md:** Add entry with status `READY` → `IN_PROGRESS` → `IMPLEMENTED` → `VERIFIED`

### Long-Term (Future Enhancements)
1. **Tool versioning** — Support multiple versions per tool
2. **Tool presets** — Save parameter configurations
3. **Scheduled execution** — Cron-like tool scheduling
4. **Collaborative execution** — Multiple users executing same tool
5. **Custom renderers** — Specialized views for common result types
6. **Real-time updates** — WebSocket for live audit log
7. **Tool marketplace** — Community-contributed tools

---

## 10. Plan Completeness Assessment

### Implementation Readiness: **READY**

| Criterion | Status |
|-----------|--------|
| Requirements clear | ✅ Yes (spec.md) |
| Scope defined | ✅ Yes (in-scope, out-of-scope) |
| Architecture coherent | ✅ Yes (design.md) |
| Component responsibilities clear | ✅ Yes (6 components defined) |
| Dependencies identified | ✅ Yes (all external deps VERIFIED) |
| Interfaces defined | ✅ Yes (SDK methods, API contracts) |
| Data contracts defined | ✅ Yes (MCP types from @moonwitness/types) |
| Security addressed | ✅ Yes (rule.md §8, SSRF, auth, tenant) |
| Failure scenarios considered | ✅ Yes (design.md §8, 6 error types) |
| Testing strategy exists | ✅ Yes (design.md §12, task.md Phase 4) |
| Acceptance criteria verifiable | ✅ Yes (spec.md §7, 9 criteria) |
| Risks identified | ✅ Yes (spec.md §9, open questions) |
| Implementation sequencing sensible | ✅ Yes (task.md, 5 phases, 23 tasks) |
| Open questions visible | ✅ Yes (spec.md §9, 3 questions) |

### Classification: **READY FOR IMPLEMENTATION**

No critical blockers identified. All four documents are consistent and complete.

---

**Plan Generated:** 2026-11-04  
**Plan Directory:** `.plans/20261104-mcp-tool-registry-ui/`  
**Status:** `proposed` (awaiting user approval)  
**Next Action:** User review and authorization to proceed

---

**Cross-References:**
- [spec.md](./spec.md) — Full specification
- [design.md](./design.md) — Full technical design
- [task.md](./task.md) — Full implementation tasks
- [rule.md](./rule.md) — Full implementation rules
- [BACKLOG.md](../../BACKLOG.md) — Add entry upon approval
- [BLUEPRINT.md](../../BLUEPRINT.md) — Headquarter role alignment