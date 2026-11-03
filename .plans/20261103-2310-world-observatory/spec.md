---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-04"
---
# WORLD OBSERVATORY — Product & Functional Specification

## 1. Product definition

**Product:** WORLD OBSERVATORY  
**Category:** Global multi-perspective intelligence observatory  
**Engine:** ROCKSOUL JIZZ  
**Primary question:** HOW IS THE WORLD SEEING IT?  
**Tagline:** THE WORLD, FROM EVERY ANGLE.

WORLD OBSERVATORY is a standalone Next.js application inside A-L-L-A-H.COM. It presents source-grounded observations about public phenomena, compares perspectives and framings, tracks changes over time, and exposes explainable analytical outputs. It is not a generic news feed, prediction engine, truth-ranking service, or replacement for other ROCKSOUL domain repos.

**JIZZ owns PERSPECTIVE only.** It does not own STORY, EVENT, PERSON, TEXT, LAW, or RELATIONSHIP.

## 2. Technical target

- App directory: `apps/jizz/`
- Stack: Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, pnpm workspace
- Shared packages: `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types` (reuse only where verified contracts fit)
- Initial integration: read-only
- Deployment: excluded until separately approved

## 3. Acceptance criteria

- [ ] App exists at `apps/jizz/` with Next.js App Router stack and builds cleanly.
- [ ] Workspace scripts/package boundaries correct (`pnpm jizz:dev`, `pnpm jizz:build`).
- [ ] Shared UI/tokens and SDK/types used appropriately where contracts exist.
- [ ] Home page renders the WORLD OBSERVATORY identity band, engine credit, and core question.
- [ ] Design distinct from Dock, Headquarter and ID — not a generic dashboard.
- [ ] Accessible: semantic landmarks, keyboard focus, sufficient contrast, reduced-motion.
- [ ] All quality gates pass: `pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`.
- [ ] No placeholder routes, mock-success states, dead controls, fabricated data or unexplained TODOs.