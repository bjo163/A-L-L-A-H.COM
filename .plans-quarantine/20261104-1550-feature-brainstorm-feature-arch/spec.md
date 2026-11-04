---
title: "New Feature Brainstorm - Feature Architecture Plan"
mode: "feature-architecture"
status: "proposed"
timestamp: "2026-11-04T15:50:00+07:00"
author: "Qoder Agent (Ultra Planner)"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
---

## 01. Product Vision & Feature Understanding

### Ecosystem Context
This project is A-L-L-A-H.COM, a MoonWitness ecosystem monorepo enforcing strict invariants:
- Default-deny authentication (only /health, /ready, onboarding, non-prod /docs are anonymous)
- SHA-256 content-addressed storage
- Parameterized SQL with column/sort allowlist
- Tenant isolation: company_id on every row, derived from principal
- ORM: Embedded PGlite via @allah/arsy-orm only
- Style: Tokens from `packages/ui/src/theme.css`, no Tailwind palette hues in apps
- UI: Mandatory @moonwitness/ui controls, no raw native controls in apps

### Feature Brainstorm Objective
Generate and evaluate new feature ideas that align with the project's architecture, add value without violating invariants, and are feasible within the existing technology stack. The brainstorm must produce concrete, actionable feature concepts suitable for further specification and implementation planning.

### Scope Boundary
- **In Scope**: Features that respect all invariants, use @moonwitness/ui components, maintain tenant isolation, and work within the PGlite/arsy-orm ecosystem
- **Out of Scope**: Features requiring raw SQL, direct DB changes, native HTML controls in apps, bypassing auth, or introducing new architecture layers without strong justification

## 02. Brainstorming Rules (Project-Adapted)

### 2.1 Core Rules
- No idea is too wild - all concepts welcome initially
- **Must respect project invariants** (especially auth, tenant isolation, content-addressed storage)
- Build on existing patterns (@moonwitness/ui components, shared packages)
- Consider SSRF implications for any new external integrations
- Must align with roadmap direction (AI Gateway foundation, Qorpus RAG, MCP, Agent Loop)

### 2.2 Voting Criteria (Adapted from Ultra Planner)
| Criteria | Weight | Description |
|----------|--------|-------------|
| **Security impact** | 30% | Does it introduce new attack surface? Violate default-deny? |
| **User value** | 25% | How many developers/users does this help? |
| **Implementation complexity** | 20% | Aligns with project simplicity preference? Reuses existing packages? |
| **Alignment with roadmap** | 15% | Complements Phase 1 (AI Gateway) or Phase 2 (Qorpus RAG)? |
| **Maintenance overhead** | 10% | Ongoing cost within ecosystem constraints |

### 2.3 Constraints
- Must be implementable within existing monorepo structure
- Must use @moonwitness/ui components (MANDATORY for UI)
- Must respect company_id tenant isolation
- Must not require raw DB calls or bypass auth guards

## 03. Feature Categories Under Consideration

### Category A: Developer Experience Enhancements
1. **Interactive codebase explorer** within Headquarter dashboard
   - Allows searching, browsing packages, components, and API routes
   - Uses @moonwitness/ui tables/lists for display
   - Integrates with existing knowledge base navigation
   
2. **Real-time collaboration indicators**
   - Shows which users are viewing/editing same resources
   - Minimal implementation using existing presence system
   - respects company_id scoping

3. **AI-powered code review suggestions**
   - Integrated into PR workflow via GitHub integration
   - Uses Gateway providers for code analysis
   - Outputs structured feedback following project conventions

### Category B: Platform Integration
1. **Vercel Analytics integration with custom dashboards**
   - Pulls metrics from Vercel API
   - Displays in Headquarter dashboard using @moonwitness/ui charts
   - respects data privacy and company_id boundaries

2. **GitHub Actions status badge generator for monorepo packages**
   - Generates badges for pnpm test/typecheck results
   - Displayable in README or package.json badges section
   - Uses existing badge generation patterns

3. **Multi-tenant isolation visualizer**
   - Visualizes company_id scoping across database rows
   - Uses @moonwitness/ui state panel component
   - Educational tool for new developers

### Category C: UI/UX Improvements
1. **Dark/light mode auto-detection with system preference**
   - respects color tokens in `packages/ui/src/theme.css`
   - No arbitrary Tailwind values in app CSS (STYLE_PURITY)
   
2. **Keyboard shortcuts navigator for power users**
   - Lists available shortcuts with descriptions
   - Uses @moonwitness/ui dialog for modal presentation
   - Accessibility-focused (keyboard navigation, focus-visible states)

3. **Component library search and discovery in Storybook**
   - Search across @moonwitness/ui component library
   - Filter by category, type, or usage pattern
   - Integrates with existing Storybook setup

### Category D: Performance & Observability
1. **Real-time query performance metrics for PGlite operations**
   - Monitors query latency, success rates
   - Uses existing telemetry from ai.usage_log
   - Displayed in Headquarter dashboard

2. **Token usage predictive analytics dashboard**
   - Predicts future token consumption based on patterns
   - Uses historical data from ai.usage_log
   - Helps with virtual key budget planning

3. **Bundle size regression detection in CI**
   - Compares bundle sizes across commits
   - Fails gate if regression detected beyond threshold
   - Integrates with existing `pnpm arsy:build` pipeline

## 04. Brainstorming Process & Voting

### 4.1 Idea Collection (Complete)
- [x] 9 feature ideas collected across 4 categories
- [x] Brainstorming rules documented
- [x] Voting criteria matrix established

### 4.2 Team Discussion
- [ ] Convene team meeting to review all 9 ideas
- [ ] Discuss security implications of each candidate (especially default-deny auth)
- [ ] Evaluate alignment with current sprint goals (AI Gateway Phase 1 completion)

### 4.3 Narrow Down to Top 3
Based on voting criteria, select exactly 3 top ideas:

| Idea ID | Category | Score (out of 5) | Primary Case |
|---------|----------|------------------|-------------|
| FX-001 | A3 | ? | AI code review suggestions |
| FX-002 | D3 | ? | Token usage predictive analytics |
| FX-003 | C2 | ? | Keyboard shortcuts navigator |

*(Voting to be conducted; top 3 will be selected based on weighted criteria)*

### 4.4 Feature Selection
- [ ] Vote on which 3 features to build in next sprint
- [ ] Document rationale for selections
- [ ] Create detailed spec.md for selected features using MODE 04 (Feature Architecture)

## 05. Next Steps (Post-Selection)

### 5.1 Spike Prototypes (Est. 1 week each)
- [ ] Create lightweight spike prototypes for top 3 candidates
- [ ] Assess implementation complexity for each
- [ ] Identify any invariant violations or architectural concerns

### 5.2 Detailed Specification
- [ ] Create spec.md for each selected feature using ultra-planner Feature Architecture mode
- [ ] Define user stories, business rules, API contracts where applicable
- [ ] Define acceptance criteria verifiable by implementation agent

### 5.3 Implementation Planning
- [ ] Create task.md with phased implementation sequence
- [ ] Identify dependencies and sequencing
- [ ] Define verification and testing strategy

### 5.4 Implementation & Verification
- [ ] Begin implementation following project conventions
- [ ] Run all gate checks: `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check`
- [ ] Verify acceptance criteria met

## 06. Rejected Ideas (Documented for Future)

Idees not selected in this round but documented for future consideration:

| Idea ID | Category | Reason for Not Selecting |
|---------|----------|--------------------------|
| FX-004 | A1 | Codebase explorer - higher maintenance overhead |
| FX-005 | B2 | Vercel Analytics - introduces external dependency |
| FX-006 | B3 | GitHub badge generator - low user value |
| FX-007 | C1 | Dark mode auto-detection - already covered by theme tokens |
| FX-008 | C3 | Storybook search - duplication of existing docs |
| FX-009 | D1 | Query performance metrics - overlaps with existing telemetry |
| FX-010 | D2 | Bundle size regression - CI already has some checks |

---