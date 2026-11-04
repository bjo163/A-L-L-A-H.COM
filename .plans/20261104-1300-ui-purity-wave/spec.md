---
title: "UI Purity Wave: Shared Primitives, Real Gate, Zero App Bypass"
status: "in_progress"
timestamp: "2026-11-04T13:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
---

# SPEC: UI Purity Wave

## 1. Problem Statement

A code review of `packages/ui` and every frontend app found that the mandatory invariant
"All UI controls come from `@moonwitness/ui`" is not delivered, and the gate that claims to
enforce it reports a false PASS.

Three independent causes:

1. **The gate is broken.** `UI_PURITY` in `packages/lint/src/check-architecture.mjs` scans a
   line at a time with `<tag>(\s|>|/)`. Prettier writes the tag name at end of line, so a raw
   `<select>` is invisible to it. `pnpm lint:arch` exits 0 on a tree containing two raw
   `<select>`, two raw `<table>`, three raw `<form>`, twelve raw `<a>` and two raw `<label>`.
2. **The package under-delivers.** `@moonwitness/ui` exports only `Button`, `Input`,
   `Textarea`, `Card`, `Badge`, `Avatar`. There is no `Select`, `Table`, `Dialog`, `Form` or
   link affordance, so an app that needs one either hand-rolls a native element or hand-writes
   the package's internal class names.
3. **The documented rule and the implemented rule disagree.** `rules.md` documents six blocked
   elements over `apps/` AND `packages/`; the implementation blocks four over `apps/` only.

## 2. Requirements

### 2.1 Gate correctness (`@moonwitness/lint`)
- REQ-1.1: `hasRawHTMLElement` must match a tag at a real boundary, including end of line.
- REQ-1.2: Blocked element list must cover `button`, `input`, `select`, `textarea`, `a`,
  `form`, `label`, `table`.
- REQ-1.3: `UI_PURITY` must scan `apps/` **and** `packages/`, exempting only `packages/ui`
  (the definition layer) and `packages/vscode-extension` (webviews use raw HTML by design).
- REQ-1.4: `collectFiles` must stop excluding every directory named `lib`; build and
  dependency directories stay excluded.
- REQ-1.5: A styled anchor carrying the package's internal `mw-button--*` classes must be
  detected, because it bypasses the component API.

### 2.2 Shared primitives (`@moonwitness/ui`)
- REQ-2.1: Add `Select`, `Table` family, `Dialog`, `Form` + `FormField`, and `asChild` on
  `Button`.
- REQ-2.2: Every new primitive ships skin styles in `skins.css` and is driven by the existing
  `--mw-*` tokens. No primitive may hardcode a colour.
- REQ-2.3: Native semantics first. `Select` wraps a native `<select>`, `Dialog` wraps a native
  `<dialog>`, `Table` wraps a native `<table>`. No custom listbox, no hand-rolled focus trap.
- REQ-2.4: `FormField` wires label, hint and error to the control through context, so a control
  inside a field never needs a hand-threaded `id`.

### 2.3 App migration
- REQ-3.1: `apps/headquarter`, `apps/id`, `apps/dock` render zero raw interactive or structural
  controls.
- REQ-3.2: `apps/headquarter/src/app/page.tsx` stops hand-writing `mw-button--*` class strings.
- REQ-3.3: The destructive device-revoke flow uses `Dialog`, not `window.confirm`.
- REQ-3.4: Per-instance Tailwind colour overrides of shared controls are replaced by package
  variants.
- REQ-3.5: The duplicated `Avatar` in `apps/id/src/app/account/page.tsx` and the duplicated
  `cn` helper in `apps/id/src/lib/utils.ts` are removed.

### 2.4 Package hygiene
- REQ-4.1: `SkinLaboratory` ships the `mw-skin-lab*` styles it already references, and is
  mounted on a real route.
- REQ-4.2: `EcosystemNavbar` takes its app endpoints as props instead of hardcoding
  `http://localhost:*`.
- REQ-4.3: ESLint gains `no-restricted-imports` for `apps/**` so a primitive cannot be built
  straight from `@base-ui/react`, `class-variance-authority` or `cn`.
- REQ-4.4: `scripts/typecheck.ts` and `tsconfig.base.json` agree on what "strict TS" means.

## 3. Acceptance Criteria

- `pnpm lint:arch` fails when a raw `<select>` is reintroduced into any app, and passes on the
  migrated tree.
- `pnpm lint`, `pnpm typecheck`, `pnpm docs:check` pass.
- `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build` pass.
- Every control in every app resolves to an export of `@moonwitness/ui`.
- `report.md` records only commands that were actually run and their actual output.

## 4. Out of Scope

- New visual directions or new skins.
- Migrating `packages/vscode-extension` webviews onto `@moonwitness/ui`.
- Replacing native `<select>` / `<dialog>` with ARIA listbox and custom focus-trap code.
