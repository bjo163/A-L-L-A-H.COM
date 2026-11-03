---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY-EXECUTIVE"
version: "2.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Executive Overview

## Product Summary

**Product:** WORLD OBSERVATORY  
**Category:** Global multi-perspective intelligence observatory  
**Engine:** ROCKSOUL JIZZ (read-only PERSPECTIVE data via Node.js API)  
**Primary Question:** HOW IS THE WORLD SEEING IT?  
**Tagline:** THE WORLD, FROM EVERY ANGLE.  
**App Directory:** `apps/jizz/`  
**Port:** 3004  
**Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4 (consumes JIZZ Node.js API at port 8787)

## Business Purpose

WORLD OBSERVATORY provides source-grounded observations about public phenomena, compares perspectives and framings across different actors, tracks changes over time, and exposes explainable analytical outputs. It serves researchers, analysts, and informed citizens who need to understand how different entities perceive and frame the same phenomena.

## Key Capabilities

1. **Source-Grounded Observations** — Every observation linked to verifiable sources with provenance
2. **Perspective Comparison** — Side-by-side comparison of how different actors frame phenomena
3. **Temporal Tracking** — Track how perspectives and framings change over time
4. **Signal Detection** — Identify meaningful changes in perspective, framing, or positioning
5. **Methodology Transparency** — Clear explanation of analytical methods and uncertainty

## Technical Architecture

- **Frontend (apps/jizz):** Next.js 16 App Router with Server Components for read-only data
- **UI System:** `@moonwitness/ui` shared component library
- **API Client:** Custom client to consume JIZZ Node.js API (port 8787)
- **Data Contracts:** `@moonwitness/types` for shared type definitions (adapted from JIZZ schema)
- **Backend Integration:** ROCKSOUL JIZZ Node.js API (read-only, port 8787)
- **Deployment:** Independent app boundary within monorepo

## Implementation Status

| Component | Status | Evidence |
|-----------|--------|----------|
| App Foundation | VERIFIED | `apps/jizz/package.json`, `next.config.ts`, `tsconfig.json` |
| Root Layout | VERIFIED | `apps/jizz/src/app/layout.tsx` |
| Home Page | VERIFIED | `apps/jizz/src/app/page.tsx` |
| Boundary Components | VERIFIED | `loading.tsx`, `error.tsx`, `not-found.tsx` |
| Documentation | VERIFIED | `README.md`, `AGENTS.md` |
| Repository Integration | VERIFIED | Root `package.json` scripts updated |
| Quality Gates | VERIFIED | `pnpm lint:arch` passed (100% compliance) |

## Engineering Constraints

1. **Read-Only Integration** — Initial phase does not mutate JIZZ canonical records
2. **Monorepo Invariants** — Must use `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`
3. **No Duplicate Infrastructure** — No new database, ORM, auth system, or AI gateway
4. **Source Provenance** — Every observation must retain source reference
5. **No Truth Ranking** — Never assign "winning" perspective or correct view
6. **Accessibility** — WCAG AA compliance, keyboard navigation, reduced motion support

## Delivery Phases

- **Phase 1 (Foundation):** App scaffold, navigation, basic data display ✅
- **Phase 2 (Core):** JIZZ API client, phenomena catalog, detail pages, perspective comparison
- **Phase 3 (Advanced):** Signals, timeline, methodology, sources directory, research pipeline
- **Phase 4 (Hardening):** Performance, accessibility, responsive QA
- **Phase 5 (Release):** Production build, deployment approval

## Success Criteria

- [x] App builds independently (`pnpm jizz:build`)
- [x] Passes architectural lint (`pnpm lint:arch`)
- [ ] Passes typecheck (`pnpm typecheck`)
- [ ] Passes documentation contract (`pnpm docs:check`)
- [ ] All user-facing controls functional
- [ ] Responsive layout verified (desktop/tablet/mobile)
- [ ] Accessibility audit passed
- [ ] Source provenance chain intact

## Open Questions

1. JIZZ API endpoint availability and authentication requirements (port 8787)
2. Data freshness and update cadence (daily 09:17 Asia/Jakarta)
3. Pagination and filtering capabilities
4. Rate limiting and caching strategy
5. Deployment topology and environment configuration

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JIZZ API unavailable | Medium | High | Implement mock fixtures, clear error states |
| Data schema changes | Medium | Medium | Runtime validation, version tolerance |
| Performance issues | Low | Medium | Server-side rendering, caching strategy |
| Accessibility gaps | Medium | Medium | Early audit, component library compliance |

---

**Next Document:** [01-product-vision.md](01-product-vision.md)