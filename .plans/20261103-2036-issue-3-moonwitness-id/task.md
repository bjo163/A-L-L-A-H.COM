---
title: "Task Checklist: MoonWitness ID with Native Arsy-ORM (GitHub Issue #3)"
date: "2026-11-03"
plan: "20261103-2036-issue-3-moonwitness-id"
issue: "https://github.com/bjo163/A-L-L-A-H.COM/issues/3"
estimated_duration: "2 hours"
estimated_cost_tokens: "~25k"
---

# Tasks

### Phase 1: Native Identity & Session Engine in `@allah/arsy-orm` & `@allah/arsy-plugin-auth` (Est: 30 mins)
- [ ] 1.1. Define canonical identity models in `@allah/arsy-orm`: `auth.user`, `auth.session`, `auth.verification`
- [ ] 1.2. Update PGlite `SchemaMigrator` to provision identity & session tables with composite indexes
- [ ] 1.3. Implement session management endpoints in `@allah/arsy-plugin-auth`:
  - [ ] `POST /api/auth/sign-in` (with session creation & user-agent tracking)
  - [ ] `POST /api/auth/sign-out` (session destruction)
  - [ ] `GET /api/auth/sessions` (list active sessions for user)
  - [ ] `POST /api/auth/sessions/revoke` (remote revocation by session ID)
- [ ] 1.4. Map `res.users` projection in `addons/base` to reference canonical `auth.user`
- [ ] 1.5. Automated tests: Sign-in, session resolution, invalid password, remote session revocation

### Phase 2: MoonWitness ID Frontend Application (`apps/id`) (Est: 45 mins)
- [ ] 2.1. Scaffold `apps/id` workspace (Next.js 16, React 19, TypeScript, Tailwind v4)
- [ ] 2.2. Configure API client pointing to canonical backend (`http://localhost:5150`)
- [ ] 2.3. Implement Sign-in page (`/login`) with error feedback & timing-safe handling
- [ ] 2.4. Implement Registration page (`/register`) with platform safeguards
- [ ] 2.5. Implement Account Center dashboard (`/account`):
  - [ ] Profile overview
  - [ ] Active sessions list with live "Revoke" button
  - [ ] Connected ecosystem apps list
- [ ] 2.6. Implement bilingual support (ID/EN) and MoonWitness dark/light design system

### Phase 3: Cross-App Integration & Session Invalidation (Est: 25 mins)
- [ ] 3.1. Test multi-app authentication (`apps/id` + `apps/web` sharing session authority)
- [ ] 3.2. Verify remote session revocation invalidates access across both apps
- [ ] 3.3. Verify tenant isolation (`company_id`) and permission check refusal for unauthorized apps

### Phase 4: Monorepo Wiring, Build Gates & Doc Sync (Est: 20 mins)
- [ ] 4.1. Add `"id:dev"` and `"id:build"` scripts to root `package.json`
- [ ] 4.2. Update `BACKLOG.md` recording Issue #3 (`AUTH-003`)
- [ ] 4.3. Update canonical documentation (`README.md`, `BLUEPRINT.md`, `CHANGELOG.md`)
- [ ] 4.4. Verify `pnpm docs:check` (100/100 threshold) and `pnpm extension:build`
- [ ] 4.5. Generate final audit and budget report `report.md` upon completion
