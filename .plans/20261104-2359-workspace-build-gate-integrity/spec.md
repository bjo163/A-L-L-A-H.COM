# SPEC: Workspace Build Gate Integrity & Scaffold Hygiene

## 1. Executive Summary

The monorepo's build gate (`pnpm -r run build`) is incomplete: it builds only 20 of 21 workspace projects, skipping `apps/moonsky` due to an empty Next.js scaffold with no `pages` or `app` directory. This violates the core build gate invariant — **all workspace projects must build** — and leaves an undetected build failure in the monorepo. The scaffold is untracked in git, exposing a latent integrity risk.

## 2. Problem Statement

- **Verified defect**: `apps/moonsky` is an incomplete Next.js scaffold (no `pages`/`app`, empty `src/blocks`/`src/components`) that fails `next build` with "Couldn't find any `pages` or `app` directory"
- **Evidence**: `pnpm -r run build` reports "Scope: 20 of 21 workspace projects" (skips moonsky)
- **Impact**: Build gate passes despite broken project, creating false confidence. CI/CD may deploy with missing/broken apps.
- **Root cause**: Incomplete scaffold + workspace glob inclusion without build-time validation

## 3. Repository Evidence & Affected Components

| Component | Evidence | Status |
|-----------|----------|--------|
| `apps/moonsky` | `src/` empty, no `pages`/`app` | Incomplete scaffold, build fails |
| `pnpm-workspace.yaml` | `packages: - "apps/*"` | Includes moonsky in workspace |
| `pnpm -r run build` | `Scope: 20 of 21 workspace projects` | Skips moonsky |
| `git status` | `?? apps/moonsky/` | Untracked in git |
| `apps/server` | Empty directory | Unused scaffold |
| `.gitignore` | No entry for `apps/moonsky` | Should be ignored or tracked |

## 4. Confirmed Bugs & Potential Issues

### Confirmed Bugs
- **BG-001**: `pnpm -r run build` skips `apps/moonsky` (build gate incomplete)
- **BG-002**: `apps/moonsky` has no `pages` or `app` directory → `next build` fails
- **BG-003**: `apps/moonsky` is untracked in git (silent drift risk)
- **BG-004**: `apps/server` is an empty unused directory

### Potential Issues
- **PI-001**: Other `apps/*` scaffolds may be incomplete (e.g., `moonsky` is not the only one)
- **PI-002**: Workspace glob `apps/*` includes untracked/dirty projects in build gate
- **PI-003**: No pre-build validation for Next.js project structure

## 5. Root-Cause Analysis

1. **Scaffold drift**: `apps/moonsky` was scaffolded but never completed (no `pages`/`app`, empty `src` subdirs)
2. **Workspace inclusion**: `pnpm-workspace.yaml` glob `apps/*` includes the scaffold without structural validation
3. **Git untracked**: Scaffold not in `.gitignore` nor tracked — diverges between machines
4. **Build gate blind spot**: `pnpm -r` skips projects that fail fast, but the gate only checks "exit code 0 on all projects", not "all projects in workspace manifest"

## 6. Impact & Severity Assessment

| Metric | Assessment |
|--------|------------|
| **Severity** | High — Build gate passes with false positive; deployment risk |
| **Impact** | Ecosystem-wide — affects all workspace verification |
| **Frequency** | Every build — gate permanently incomplete |
| **Recovery** | Manual fix required; CI may not catch until deployment |

## 7. Expected Outcomes

- `pnpm -r run build` builds **all 21 workspace projects** (or excludes incomplete ones explicitly)
- `apps/moonsky` is either completed or explicitly excluded/ignored
- Scaffold hygiene rules enforced for all `apps/*` projects
- No untracked `apps/*` directories in git

## 8. Functional Requirements

- **FR-001**: `pnpm -r run build` must attempt to build every workspace project
- **FR-002**: Every `apps/*` project must have a valid Next.js structure (`pages` or `app` directory)
- **FR-003**: Untracked scaffold directories must be either tracked or ignored
- **FR-004**: Build gate must fail if any workspace project fails to build

## 9. Non-Functional Requirements

- **NFR-001**: Must pass `pnpm lint:arch` (arch invariants)
- **NFR-002**: Must pass `pnpm lint` and `pnpm typecheck`
- **NFR-003**: Must not break existing `pnpm -r run build` for valid apps (dock, gate, headquarter, id, jizz, arsy, sentinel)
- **NFR-004**: Must not introduce configuration bloat

## 10. Scope & Out-of-Scope

### In Scope
- `apps/moonsky` completion or exclusion
- `apps/server` cleanup
- Workspace glob validation for `apps/*` structure
- Build gate completeness verification

### Out of Scope
- Changing build tooling (pnpm, next, tsup)
- Modifying valid apps (dock, gate, headquarter, id, jizz, arsy, sentinel)
- UI/UX changes
- Documentation updates beyond plan artifacts

## 11. Affected Applications & Packages

- **Applications**: `apps/moonsky`, `apps/server`
- **Packages**: None (shared packages unaffected)
- **Config**: `pnpm-workspace.yaml`, `package.json` (workspace root)

## 12. MoonWitness Ecosystem Alignment

- **Build Gate**: `pnpm -r run build` must pass on all projects (QUALITY.md)
- **Auth**: Not affected (server-side only)
- **Tenant**: Not affected
- **ORM**: Not affected
- **Style Source**: Not affected (no UI in scaffold)
- **SSRF**: Not affected

## 13. Acceptance Criteria

1. `pnpm -r run build` reports "Scope: 21 of 21 workspace projects"
2. `apps/moonsky` either:
   - Has valid `src/app` or `src/pages` directory with a buildable Next.js app, **OR**
   - Is explicitly excluded from workspace via `.gitignore` + `pnpm-workspace.yaml` pattern adjustment
3. `apps/server` is removed or populated
4. No untracked `apps/*` directories in `git status`
5. `pnpm lint:arch` passes

## 14. Success Metrics

- Build gate completeness: 21/21 projects
- Untracked workspace projects: 0
- Scaffold hygiene: all `apps/*` have valid `app`/`pages` or are excluded

## 15. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing dev workflow | Low | Medium | Gradual migration, backup scaffold |
| Removing valid scaffold | Low | High | Verify no other incomplete apps |
| Pnpm glob behavior change | Medium | Low | Test filtering on multiple pnpm versions |

---
*Generated by Qoder Agent (Ultra Planner) — 2026-11-04 23:59:00+07:00*