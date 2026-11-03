# Tasks: Ecosystem Architecture Phase 1 — Product Application Boundaries & Naming Canon (Issue #21)

## 1. Ecosystem Audit & Boundary Matrix
- [ ] Audit active application manifests and ports (`dock`: 3001, `headquarter`: 3002, `id`: 3003, `jizz`: 3004, `arsy`: 5150)
- [ ] Define canonical mapping of product identities (WORKS, HARBOR, SENTINEL, NEXUS, ORACLE)
- [ ] Record Architectural Decision Record (ADR) for application placement

## 2. Documentation Harmonization
- [ ] Update `BLUEPRINT.md` with reconciled application portfolio
- [ ] Update `DOCUMENTATION_CONTRACT.md` and app READMEs
- [ ] Update `QUALITY.md` and `BACKLOG.md`

## 3. Verification & Monorepo Gates
- [ ] Run `pnpm lint:arch` (100% compliant)
- [ ] Run `pnpm typecheck` (0 errors)
- [ ] Run `pnpm docs:check` (100/100 pts)

