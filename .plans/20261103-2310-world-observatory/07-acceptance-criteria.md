---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-AC"
version: "1.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Acceptance Criteria

## 7.1 Phase 1 Acceptance Criteria (AC-001 through AC-010)

### AC-001: App Builds Independently
- **Criteria:** `pnpm jizz:build` command succeeds, creates `.next/` directory
- **Verification:** 
  - Run `pnpm jizz:build` from repository root
  - Verify `.next/` directory exists at `apps/jizz/.next/`
  - Verify no build errors in console output
- **Evidence:** Command output, `.next/` directory listing

### AC-002: Passes Architectural Lint
- **Criteria:** `pnpm lint:arch` returns 100% compliance, zero violations
- **Verification:**
  - Run `pnpm lint:arch` from repository root
  - Verify output shows ✅ All Architectural Invariants PASSED
  - Verify no violations in `packages/lint/src/check-architecture.mjs` output
- **Evidence:** Lint run output, violation count = 0

### AC-003: TypeScript Typecheck Passes
- **Criteria:** `pnpm --filter @moonwitness/jizz typecheck` completes with exit code 0
- **Verification:**
  - Run `pnpm --filter @moonwitness/jizz typecheck` from repository root
  - Verify no TypeScript compilation errors
  - Verify `.tsbuildinfo` not created (or handled)
- **Evidence:** Typecheck exit code 0, no error messages

### AC-004: Documentation Contract Passes
- **Criteria:** `pnpm docs:check` score ≥ 95/100, no critical errors
- **Verification:**
  - Run `pnpm docs:check` from repository root
  - Verify frontmatter on all required docs (README.md, AGENTS.md, spec.md, etc.)
  - Verify no broken relative links
  - Verify no antislop patterns (lorem ipsum, TODO: write placeholder, etc.)
- **Evidence:** Docs check score, list of errors/warnings (if any)

### AC-005: Home Page Renders Correctly
- **Criteria:** Home page (`/`) renders without JavaScript errors, core question visible
- **Verification:**
  - Run `pnpm jizz:dev`
  - Navigate to `http://localhost:3004`
  - Verify hero section renders
  - Verify "HOW IS THE WORLD SEEING IT?" headline present
  - Verify "Powered by ROCKSOUL JIZZ" badge present
  - Open DevTools console, verify no errors
- **Evidence:** Screenshot, console output, manual inspection

### AC-005: Observations Display
- **Criteria:** Observations grid renders with source attribution and coverage indicators
- **Verification:**
  - Run `pnpm jizz:dev`
  - Verify observations grid present on home page
  - Verify each observation has: title, source name, published date, coverage badge
  - Verify no "Cannot read properties of undefined" errors
- **Evidence:** Screenshot, console output, manual inspection

### AC-005: Perspectives Display
- **Criteria:** Perspectives list renders with actor names and framing classifications
- **Verification:**
  - Run `ppn jizz:dev`
  - Verify perspectives section present on home page
  - Verify each perspective has: actor name, framing badge (e.g., "supportive", "concerned")
  - Verify no errors in console
- **Evidence:** Screenshot, console output, manual inspection

### AC-005: Responsive Layout
- **Criteria:** Layout adapts between mobile (1 column), tablet (2 columns), desktop (3+ columns)
- **Verification:**
  - Run `pnpm jizz:dev`
  - Resize browser viewport to 320px → single column layout
  - Resize to 768px → two column layout
  - Resize to 1440px → three+ column grid
  - Verify touch targets are reasonable size on mobile
- **Evidence:** Browser resize screenshots, Tailwind responsive utilities visible

### AC-005: Loading State
- **Criteria:** `loading.tsx` renders as overlay during initial data fetch
- **Verification:**
  - Run `pnpm jizz:dev` (cold start)
  - Verify spinner with "Loading WORLD OBSERVATORY data..." appears
  - Verify loading state dismisses when data arrives
  - Verify no content flash between loading and loaded state
- **Evidence:** Screenshots at loading and loaded states

### AC-005: Error State
- **Criteria:** `error.tsx` renders on failed fetch, retry button functional
- **Verification:**
  - Run `pnpm jizz:dev`
  - Simulate fetch failure (e.g., disconnect network, modify API URL)
  - Verify error boundary renders with message
  - Verify "Try Again" button functional (re-attempts fetch)
  - Verify retry returns to loaded state on success
- **Evidence:** Screenshots at error and loaded states, console trace

### AC-005: Not-Found State
- **Criteria:** `not-found.tsx` renders on invalid route, home link works
- **Verification:**
  - Run `pnpm jizz:dev`
  - Navigate to invalid route (e.g., `/random-path`)
  - Verify "Page not found" message renders
  - Verify home link returns to `/`
  - Verify navbar remains persistent
- **Evidence:** Screenshots at not-found state and after home link click

### AC-006: Engine Credit Attribution
- **Criteria:** "Powered by ROCKSOUL JIZZ" gold badge visible on all pages
- **Verification:**
  - Run `pnpm jizz:dev`
  - Verify badge present on home page (`/`)
  - Verify badge present on other routes (if applicable)
  - Verify badge links to appropriate credit/acknowledgment
- **Evidence:** Screenshot of badge, HTML source verification

### AC-007: Ecosystem Navigation
- **Criteria:** Navbar links to Dock (port 3001), Headquarter (port 3002), ID (port 3003)
- **Verification:**
  - Run `pnpm jizz:dev`
  - Hover over each navbar link
  - Verify correct href/to values:
    - Dock: `http://localhost:3001` or `/`
    - Headquarter: `http://localhost:3002` or `/`
    - ID: `http://localhost:3003/account` or `/account`
  - Verify clicks navigate correctly (or open in new tab)
- **Evidence:** Screenshot of navbar, href values verified

### AC-008: No Raw HTML Controls
- **Criteria:** No raw `<button>` or `<input type="text|password|email">` in `apps/jizz/src/`
- **Verification:**
  - Run `pnpm lint:arch`
  - Verify UI_PURITY rule: 0 violations
  - Grep app source files for `<button ` (not `<Button` or `//` comments)
  - Grep for `<input ` with `type=` matching text/password/email (not `<Input>`)
- **Evidence:** Lint output, grep results showing 0 matches for violations

### AC-009: SDK Usage (if applicable)
- **Criteria:** Any hub communication routes through `@allah/sdk`, not raw fetch
- **Verification:**
  - Review `src/lib/api.ts` or equivalent
  - Verify `import { mwClient } from '@allah/sdk'` present
  - Verify no `fetch('/v1/...')` or `fetch('/api/...')` without SDK wrapper
  - Verify SDK methods used: `mwClient.auth.getCurrentUser()`, etc.
- **Evidence:** Source code review, import statements verified

### AC-010: Accessibility Baseline
- **Criteria:** Manual WCAG AA checks pass
- **Verification:**
  - Keyboard-only tab-through: All functionality reachable
  - Contrast ratio: Minimum 4.5:1 for normal text (use DevTools Color Contrast Analyzer)
  - Focus indicators: Visible focus-visible outlines on all interactive elements
  - Reduced-motion: Test with browser `prefers-reduced-motion: reduce`, nonessential transitions disabled
  - Screen reader: Basic semantic HTML check (`html>head>body>header>main>nav>section>footer` structure)
  - Color not sole encoding: No color-conveys-only information
- **Evidence:** Accessibility checklist, tool outputs, manual testing notes

---

## 7.2 Phase 2 Acceptance Criteria (AC-011 through AC-020)

### AC-011: Typecheck Passes
- **Criteria:** `pnpm --filter @moonwitness/jizz typecheck` 0 TypeScript errors
- **Verification:** Run typecheck, capture exit code and error list (should be empty)

### AC-012: Observations Component
- **Criteria:** Observations grid renders with source attribution and coverage badge
- **Verification:** Manual inspection on `http://localhost:3004`, check each observation card has title/source/published/coverage

### AC-013: Perspectives Component
- **Criteria:** Perspective list renders with actor names and framing badges
- **Verification:** Manual inspection, verify actor names visible, framing classifications present (e.g., "supportive", "concerned", "neutral")

### AC-014: Responsive Layout
- **Criteria:** Layout functions at 320px (1 col), 768px (2 col), 1440px+ (3+ col)
- **Verification:** Browser resize test at three breakpoints, screenshots

### AC-015: Loading State
- **Criteria:** Loading state visible during fetch, dismissed on data arrival
- **Verification:** Cold start inspection, verify spinner appears, dismisses when data loads

### AC-016: Error State
- **Criteria:** Error state renders on fetch failure, retry button works
- **Verification:** Simulate failure, verify error boundary + retry, test retry success path

### AC-017: Not-Found State
- **Criteria:** Not-found renders on invalid route, home link returns to `/`
- **Verification:** Navigate to invalid route, verify message + home link functionality

### AC-018: No Raw HTML Controls
- **Criteria:** Lint UI_PURITY rule: 0 violations (same as AC-008, ongoing)
- **Verification:** Same as AC-008, run lint after Phase 2 changes

### AC-019: Full Quality Gates
- **Criteria:** All three pass: `pnpm lint:arch`, `pnpm --filter @moonwitness/jizz typecheck`, `pnpm docs:check`
- **Verification:** Run all three commands, verify all pass

### AC-020: API Client Operational
- **Criteria:** `api.ts` (or equivalent) fetches data, runtime validation works
- **Verification:** Inspect API client code, verify fetch works, verify validation runs

---

## 7.3 Phase 3 Acceptance Criteria (AC-021 through AC-030)

### AC-021: Phenomena Catalog
- **Criteria:** Searchable/filterable list renders with counts and status indicators
- **Verification:** Inspect `/phenomena` route, verify search works, filters apply, counts visible

### AC-022: Phenomenon Detail
- **Criteria:** Comprehensive detail page renders with all sections
- **Verification:** Inspect `/phenomena/[id]`, verify overview, signals, perspectives, sources sections present

### AC-023: Perspective Comparison, Signals, Sources, Timeline, Methodology
- **Criteria:** Each feature renders as specified in roadmap
- **Verification:** Inspect each route, verify feature-specific UI present and functional

### AC-024: Typecheck Still Passes
- **Criteria:** No TypeScript regressions from Phase 2
- **Verification:** Run `pnpm --filter @moonwitness/jizz typecheck`, 0 new errors

### AC-025: Lint Still Passes
- **Criteria:** No new UI purity violations from Phase 2 additions
- **Verification:** Run `pnpm lint:arch`, 0 violations

### AC-026: Documentation Contract
- **Criteria:** `pnpm docs:check` passes or close to 100/100
- **Verification:** Run docs check, capture score, review errors

### AC-027: Performance within Bounds
- **Criteria:** Lighthouse FCP < 2s, TTI < 5s (if applicable)
- **Verification:** Run Lighthouse audit, capture scores

### AC-027: Accessibility within Bounds
- **Criteria:** axe-core AA compliance or documented gaps
- **Verification:** Run axe-core audit, capture score, review any violations

---

## 7.4 Phase 4 Acceptance Criteria (AC-031 through AC-040)

### AC-031: Performance Audit Passed
- **Criteria:** Lighthouse FCP < 2s, TTI < 5s
- **Verification:** Run Lighthouse, capture FCP and TTI scores

### AC-032: Accessibility Audit Passed
- **Criteria:** WCAG AA compliance or documented gaps with remediation plan
- **Verification:** Run axe-core, capture score, document any AA-level violations with mitigation plan

### AC-033: Responsive QA Complete
- **Criteria:** Layout works at 320px, 768px, 1440px+, on mobile devices
- **Verification:** Manual testing at breakpoints, screenshots, test on actual mobile devices if available

### AC-034: Security Review Complete
- **Criteria:** No critical SSRF, secrets, or input sanitization findings
- **Verification:** Security review output, critical findings count = 0

### AC-035: Cross-Browser Testing Complete
- **Criteria:** Chrome, Firefox, Safari, Edge: no critical issues
- **Verification:** Test on each browser, capture issues, 0 critical

### AC-036: No Regressions
- **Criteria:** Prior phases' criteria still met (AC-001 through AC-030)
- **Verification:** Re-run prior acceptance criteria, verify all still pass

### AC-037: Accessibility Retrofits
- **Criteria:** Any gaps from Phase 3 addressed
- **Verification:** Review Phase 3 axe violations, verify remediated

### AC-038: Performance Optimizations
- **Criteria:** Improvements from Phase 3 analysis implemented
- **Verification:** Compare Lighthouse scores Phase 3 vs Phase 4, verify improvements

### AC-039: Cross-Browser Compatibility
- **Criteria:** All major browsers tested, no critical issues
- **Verification:** Same as AC-035, document any browser-specific notes

### AC-039: Hardening Phase Complete
- **Criteria:** All T-4001–T-4006 complete, all quality gates pass
- **Verification:** Checklist T-4001–T-4006 complete, gate run outputs

---

## 7.5 Phase 5 Acceptance Criteria (AC-041 through AC-050)

### AC-041: Production Build Successful
- **Criteria:** `pnpm jizz:build` creates `.next/` directory
- **Verification:** Run build, verify `.next/` exists, check build output

### AC-042: Staging Deployment Verified
- **Criteria:** Staging environment serves correctly on assigned port
- **Verification:** Deploy to staging, verify URL responds, core features functional

### AC-043: Release Checklist 100%
- **Criteria:** All items from roadmap T-5003 complete and verified
- **Verification:** Checklist review, each item verified with evidence

### AC-044: Deployment Approval Granted
- **Criteria:** Separate approval for DNS/secrets/production obtained
- **Verification:** Approval email/record, stakeholder sign-off

### AC-045: No Critical Post-Release Issues
- **Criteria:** 48h monitoring, no critical bugs logged
- **Verification:** Monitoring log, issue tracker, 48 hours post-deploy

### AC-045: All Prior Phase Criteria Met
- **Criteria:** AC-001 through AC-040 still pass after deployment
- **Verification:** Re-run prior acceptance criteria post-deploy

### AC-046: All Quality Gates Green
- **Criteria:** `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check` all pass
- **Verification:** Run all three, capture outputs, verify all pass

### AC-047: Monitoring in Place
- **Criteria:** 48h observation period configured
- **Verification:** Monitoring setup documented, log retention configured

### AC-048: Rollback Plan Documented
- **Criteria:** Procedure documented if deployment issues arise
- **Verification:** Rollback procedure documented, communicated to team

### AC-048: Post-Launch Communications
- **Criteria:** Team informed of new app, port, responsibilities
- **Verification:** Communication sent, team acknowledgment recorded

### AC-049: Team Onboarding Complete
- **Criteria:** Team members can `pnpm jizz:dev`, run quality gates
- **Verification:** Each team member runs `pnpm jizz:dev`, passes lint/typecheck/docs

### AC-050: WORLD OBSERVATORY Live
- **Criteria:** App running on port 3004, accessible to public
- **Verification:** `http://localhost:3004` accessible, core features functional

---

## 7.6 Final Readiness Classification

| Classification | Criteria | Required Action |
|----------------|----------|-----------------|
| **READY** | All AC-001 through AC-050 complete | ✅ Deploy to production |
| **CONDITIONALLY READY** | AC-001 through AC-045 complete, AC-046–AC-050 pending | ⬅️ Address pending items (typically AC-046–AC-050), re-evaluate |
| **NOT READY** | Essential criteria unmet (AC-001 through AC-020) | ⬅️ Complete foundation work (Phase 1) first |

### READY Classification Checklist

| ✅ | Criteria |
|----|----------|
| ☐ | AC-001: App builds independently |
| ☐ | AC-002: Lint passes 100% |
| ☐ | AC-003: Typecheck passes |
| ☐ | AC-004: Docs check ≥ 95/100 |
| ☐ | AC-005: Home page + observations + perspectives + responsive + loading + error + not-found all functional |
| ☐ | AC-006: Engine credit visible |
| ☐ | AC-007: Ecosystem navigation |
| ☐ | AC-008: No raw HTML controls |
| ☐ | AC-009: SDK usage (if applicable) |
| ☐ | AC-010: Accessibility baseline |
| ☐ | AC-011: Typecheck passes |
| ☐ | AC-012: Observations component |
| ☐ | AC-013: Perspectives component |
| ☐ | AC-014: Responsive layout |
| ☐ | AC-015: Loading state |
| ☐ | AC-016: Error state |
| ☐ | AC-017: Not-found state |
| ☐ | AC-018: No raw HTML controls ( ongoing) |
| ☐ | AC-019: Full quality gates |
| ☐ | AC-020: API client operational |
| ☐ | AC-021: Phenomena catalog |
| ☐ | AC-022: Phenomenon detail |
| ☐ | AC-023: Perspective comparison, signals, sources, timeline, methodology |
| ☐ | AC-024: Typecheck still passes |
| ☐ | AC-025: Lint still passes |
| ☐ | AC-026: Docs contract |
| ☐ | AC-027: Performance + accessibility within bounds |
| ☐ | AC-031: Performance audit passed |
| ☐ | AC-032: Accessibility audit passed |
| ☐ | AC-033: Responsive QA complete |
| ☐ | AC-034: Security review complete |
| ☐ | AC-035: Cross-browser testing complete |
| ☐ | AC-036: No regressions |
| ☐ | AC-037: Accessibility retrofits |
| ☐ | AC-038: Performance optimizations |
| ☐ | AC-039: Cross-browser compatibility |
| ☐ | AC-039: Hardening phase complete |
| ☐ | AC-041: Production build successful |
| ☐ | AC-042: Staging deployment verified |
| ☐ | AC-043: Release checklist 100% |
| ☐ | AC-044: Deployment approval granted |
| ☐ | AC-045: No critical post-release issues (48h) |
| ☐ | AC-046: All prior criteria still pass |
| ☐ | AC-047: Monitoring in place |
| ☐ | AC-048: Rollback plan documented |
| ☐ | AC-049: Team onboarding complete |
| ☐ | AC-050: WORLD OBSERVATORY live on port 3004 |

---

## 7.7 Traceability Matrix

| Requirement | AC-IDs | Satisfied By |
|-------------|--------|--------------|
| **Product Vision** | AC-005 (home page core question), AC-006 (engine credit), AC-010 (accessibility) | Home page implementation, design docs |
| **Product Scope** | AC-005 (observations/perspectives fit scope), AC-012–AC-023 (Phase 2–3 features fit scope) | Feature implementations |
| **Non-Functional Requirements** | AC-010 (accessibility WCAG AA), AC-027 (performance + accessibility), AC-031–AC-035 (quality attributes) | Accessibility audit, Lighthouse, cross-browser test |
| **Data Architecture** | AC-012 (observations data), AC-023 (signals/sources provenance), AC-023 (temporal tracking) | Data fetching, view models, provenance chain |
| **API Integration** | AC-020 (API client operational), AC-023 (API data for features), AC-027 (performance with API data) | API client, runtime validation, view models |
| **Security Architecture** | AC-034 (security review), AC-039 (cross-browser no critical issues), AC-018 (no raw HTML controls) | Security review, lint gate, browser testing |
| **UI/UX Architecture** | AC-014 (responsive), AC-027 (accessibility), AC-033 (responsive QA), AC-032 (accessibility audit) | Responsive design, axe audit, breakpoints tests |
| **Implementation Roadmap** | All AC-IDs cascade from roadmap milestones M-01 through M-05 | Roadmap tasks T-1001–T-5003 → AC-IDs |
| **Acceptance Criteria** | AC-001 through AC-050 are the acceptance criteria themselves | This document |

---

## 7.8 Glossary

| Term | Definition |
|------|------------|
| **AC** | Acceptance Criteria — verifiable conditions that must be met for a phase or the overall project to be considered complete |
| **Lighthouse** | Google's open-source tool for auditing web page quality (performance, accessibility, SEO, best practices) |
| **axe-core** | Open-source accessibility testing library for automated WCAG compliance testing |
| **Linter** | Static code analysis tool that flags programming errors, bugs, stylistic inconsistencies, and suspicious constructs |
| **Typecheck** | Compilation step that verifies TypeScript type correctness across the codebase |
| **Docs Check** | Documentation contract validation script (`tsx scripts/check-doc-contracts.ts`) |
| **UI Purity** | Architectural invariant enforcing that all interactive elements in `apps/` are imported from `@moonwitness/ui` |
| **EPERM** | Error Permission — operational error in this sandbox environment (typically related to esbuild service worker spawning), not a code quality issue |

---

**Related Documents:**
- [00-executive-overview.md](00-executive-overview.md)
- [01-product-vision.md](01-product-vision.md)
- [02-project-scope.md](02-project-scope.md)
- [03-requirements.md](03-requirements.md)
- [04-current-state.md](04-current-state.md)
- [05-target-architecture.md](05-target-architecture.md)
- [06-implementation-roadmap.md](06-implementation-roadmap.md)