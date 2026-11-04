---
title: "GATE — Empire Gateway Implementation"
version: "1.0.0"
status: "in_progress"
owner: "engineering"
created: "2026-11-04"
last_updated: "2026-11-04"
---

# GATE — Empire Gateway Implementation Spec

## Objective

Implement `apps/gate` as the definitive public entrance to A-L-L-A-H.COM: a Next.js 16 application using IMPERIUM LUMEN skin via `@moonwitness/ui`, presenting the eight narrative movements from the Home Blueprint with distinct compositions, honest content states, and full accessibility.

## Scope

**In Scope:**
- New Next.js 16 app at `apps/gate` (port 3000)
- Eight movement pages: Home (01+08), Universe, Explore, Transmissions, Discover, Community, Journey
- Information pages: About, Sources, Privacy
- EcosystemNavbar integration with `gate` endpoint and `currentApp="gate"`
- Content manifest (JSON) + i18n catalogs (Indonesian-first + English)
- Sacred content provenance enforcement
- Responsive, accessible, reduced-motion compliant
- All quality gates passing

**Out of Scope:**
- Production deployment, DNS, Coolify
- Backend API development (uses existing @allah/sdk)
- Cockpit/Headquarter implementation
- New UI components (reuse @moonwitness/ui only)
- Content authoring beyond manifest seed data

## Requirements

### Functional

| ID | Requirement | Acceptance |
|---|---|---|
| FR-01 | Hero Arrival (M01) with architectural threshold, purpose statement, primary CTA | Renders static without JS; skip link accessible |
| FR-02 | Universe Map (M02) with 5 distinct destination silhouettes | Unequal visual weight; semantic list fallback; honest status labels |
| FR-03 | Explore Index (M03) with layered editorial hierarchy | Featured world dominant; supporting entries distinct; no identical cards |
| FR-04 | Transmissions Feed (M04) with featured + provenance | Provenance block on every item; empty state honest |
| FR-05 | Discover Filters (M05) backed by real metadata | Hidden if no backend; fallback curated link |
| FR-06 | Community Page (M06) with Dock entry | No invented counts; real Dock link; guidelines summary |
| FR-07 | Journey Page (M07) with anonymous/signed-in states | Verified shortcuts only; no invented activity |
| FR-08 | Closing Horizon (M08) + footer navigation | Echoes opening; direct destination links |
| FR-09 | Information pages (About, Sources, Privacy) | Static content, noindex, real copy |
| FR-10 | EcosystemNavbar with gate endpoint | Cross-app nav, auth actions, theme/sound toggles |
| FR-11 | Session check + sign-out via @allah/sdk | User name/email in navbar; sign-out works |

### Non-Functional

| ID | Requirement | Acceptance |
|---|---|---|
| NFR-01 | Next.js 16, React 19, TypeScript strict | Build passes |
| NFR-02 | @moonwitness/ui only (UI_PURITY) | lint:arch passes |
| NFR-03 | @allah/sdk only for API (UNIVERSAL_SDK_CLIENT) | lint:arch passes |
| NFR-04 | @moonwitness/types for shared contracts | lint:arch passes |
| NFR-05 | IMPERIUM LUMEN skin via SkinRoot | Visual matches DNA/01 |
| NFR-06 | Responsive: desktop/tablet/mobile | No horizontal overflow; touch targets ≥44px |
| NFR-07 | Accessibility: WCAG 2.2 AA | Keyboard, focus, contrast, reduced motion, semantic HTML |
| NFR-07 | Indonesian-first i18n | All visible text from catalogs |
| NFR-08 | Honest states (loading/empty/error/restricted/offline) | Designed for each movement |
| NFR-09 | No fake data presented as real | Zero invented metrics, counts, LIVE badges |
| NFR-10 | Performance: hero priority, lazy below fold | LCP < 2.5s target |

## Architecture Decisions

| Decision | Rationale |
|---|---|
| Port 3000 for GATE | Next.js default; extends ecosystem endpoints additively |
| Extend packages/ui endpoints | Minimal additive change; enables EcosystemNavbar integration |
| Content manifest JSON at build time | Static generation compatible; no runtime CMS needed |
| i18n catalogs (not next-intl) | Simpler; matches existing app patterns (id/en JSON) |
| Server Components by default | Next.js 16 best practice; client only where interactive |
| Reuse dock's imperium-lumen.png | Existing approved asset; consistent visual identity |
| Sacred provenance as required prop | TypeScript enforces completeness; prevents P0 audit gap |

## Dependencies

- `@moonwitness/ui` (workspace:*) — UI components, blocks, skins, tokens
- `@allah/sdk` (workspace:*) — Auth client
- `@moonwitness/types` (workspace:*) — Shared types
- `next` 16.4.3, `react` 19.3.0, `react-dom` 19.3.0
- `tailwindcss` 4, `@tailwindcss/turbopack`
- `next/font/google` (Geist)

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Next.js 16 breaking changes | Medium | High | Read node_modules/next/dist/docs before coding |
| UI_PURITY lint failures | Medium | High | Use only @moonwitness/ui components; test lint early |
| Missing content assets | High | Medium | Design text/surface fallbacks; don't block on artwork |
| Sacred content provenance gaps | Medium | High | Omit specific sacred excerpts until verified; use personal/fictional only |
| EcosystemNavbar type changes | Low | Medium | Additive only; test all consumer apps build |

## Acceptance Criteria (Definition of Done)

- [ ] `apps/gate` created with all routes and components
- [ ] Eight movements implemented with distinct compositions
- [ ] EcosystemNavbar integrated with `gate` endpoint
- [ ] IMPERIUM LUMEN skin applied
- [ ] Zero raw HTML controls (Button, Link, Input, Form, Card, Badge from @moonwitness/ui)
- [ ] Zero direct fetch (all API via @allah/sdk)
- [ ] Zero local type redefinitions (shared types from @moonwitness/types)
- [ ] Responsive verified: desktop, tablet, mobile
- [ ] Accessible verified: keyboard, focus, contrast, reduced motion, semantic HTML
- [ ] Honest states implemented: loading, empty, error, restricted, offline
- [ ] No fake data presented as real
- [ ] `pnpm --filter @moonwitness/gate typecheck` → 0 errors
- [ ] `pnpm lint:arch` → 100% pass
- [ ] `pnpm docs:check` → 100/100
- [ ] `pnpm --filter @moonwitness/gate build` → pass
- [ ] Documentation updated (spec, arch, design, content, implementation reports)
- [ ] Git diff clean (intentional changes only, on `dev` branch)