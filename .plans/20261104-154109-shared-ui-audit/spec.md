---
title: "Shared UI Package and App Adoption"
status: "proposed"
timestamp: "2026-11-04T15:41:09+07:00"
author: "Copilot"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
---

# SPEC: Shared UI Package and App Adoption

## 1. Goal

Keep all five React apps on the `@moonwitness/ui` contract and close proven accessibility/API gaps in the shared components before expanding app-specific UI work. Preserve each product DNA; unify behavior, semantics, and accessibility rather than forcing identical visual composition.

This is an implementation plan, not an implementation. No UI source was changed during this audit.

## 2. Scope

### In scope

- Shared component, block, token, and CSS entry points under `packages/ui/`.
- All active Next.js apps: `apps/dock/`, `apps/gate/`, `apps/headquarter/`, `apps/id/`, and `apps/jizz/`.
- The app inventory and UI rules in `AGENTS.md` and `DESIGN.md`.

### Out of scope

- Backend services (`apps/arsy/`, `apps/sentinel/`) and the non-React `apps/server/` directory.
- A new product visual direction, brand redesign, or behavioral divergence between skins.
- Broad rewrites of app-specific CSS. Consolidate only duplicated shared foundations that are demonstrated to be equivalent and safe to share.

## 3. Verified Baseline

- `pnpm lint:arch` passed during this audit and reported all architectural invariants at 100%, including strict `@moonwitness/ui` enforcement.
- A JSX scan across the five React apps found no raw `button`, `input`, `select`, `textarea`, `a`, `form`, `label`, or `table` tags.
- A separate scan found 24 hand-written internal `mw-*` classes in 8 app files. The existing architecture check misses these names and does not scan app CSS, so its pass is not proof of full UI purity; see UI-08.
- Shared UI tests passed: 11/11 (`packages/ui/test/skins.test.tsx`, `packages/ui/test/audio.test.ts`). The tests include skin-token contrast checks and reduced-motion/style-scope checks, but do not cover the findings below.
- Static source inspection did not establish browser/axe, keyboard, 200%-zoom, or per-route visual results in this audit. Those remain explicit implementation verification gates.

### App inventory

| App | UI scope | Audit result |
|---|---|---|
| Dock | React/Next.js app using shared navbar, links, motion, and skin APIs | No raw JSX controls found; app-specific CSS remains |
| Gate | React/Next.js app consuming shared UI blocks and components | No raw JSX controls; 15 internal `mw-*` class uses across 6 files |
| Headquarter | React/Next.js app using shared controls and Skin Laboratory | No raw JSX controls; 4 internal `mw-*` CSS selectors; dialog gap at `/skin-lab` |
| ID | React/Next.js app using shared form controls | No raw JSX controls; 5 internal `mw-*` CSS selectors |
| Jizz | React/Next.js app using shared navbar, cards, and motion | No raw JSX controls found |

`apps/arsy/` and `apps/sentinel/` are service packages rather than React apps; `apps/server/` has no app package manifest. They are not UI adoption targets in this plan.

## 4. Audit Findings

| ID | Priority | Finding and evidence | Status |
|---|---|---|---|
| UI-08 | P1 | The UI gate misses app-level private-class bypasses. Its TSX scan only checks `mw-button--`, `mw-input-field__`, `mw-card__`, and `mw-badge--`; it does not scan CSS. Actual hits: Gate uses `mw-card`, `mw-link`, `mw-raw-stack`, `mw-raw-grid`, and `mw-skeleton` in six files (`discover-filters.tsx`, `journey-next.tsx`, `transmissions-feed.tsx`, `universe-map.tsx`, `closing-horizon.tsx`, `app/loading.tsx`); Headquarter and ID use private `.mw-card`/`.mw-button`/`.mw-input` selectors in their global CSS. This contradicts the `AGENTS.md` ban on hand-written `mw-*` component classes while `pnpm lint:arch` still reports a pass. Evidence: `packages/lint/src/check-architecture.mjs` lines 72-129 and the listed app files. | Verified app rule violations and gate coverage gap |
| UI-01 | P1 | `FormField` creates hint/error IDs and renders their text, but `Input`, `Textarea`, and `Select` do not consume `field.hintId` or `field.errorId` in `aria-describedby`. Their own `hint` prop is passed as a string to `aria-describedby`, without rendering an element with that ID. A consumer using the advertised shared field API can therefore have hints/errors that are not programmatically associated with the control. Evidence: `packages/ui/src/components/form.tsx` lines 44-75; `packages/ui/src/components/input.tsx` lines 16-42; corresponding `textarea.tsx` and `select.tsx` lines 16-43. | Verified in code; no current app uses `FormField` directly |
| UI-02 | P1 | `SkinLaboratory` implements its demo modal as a `div[role=dialog][aria-modal=true]`; no focus placement/trap, Escape handling, or focus restoration appears in the block. The shared native `Dialog` primitive already exists. Evidence: `packages/ui/src/blocks/skin-laboratory.tsx` lines 282-301. | Verified in code; exposed by Headquarter `/skin-lab` |
| UI-03 | P2 | `Link` announces “Opens in a new tab” whenever `external` is true but renders `target={target}` rather than forcing `_blank`; `external` without `target` therefore keeps the current tab while announcing otherwise. `LinkButton` already applies `_blank` for the same flag. Evidence: `packages/ui/src/components/link.tsx` lines 17-47 and 69-91. | Verified in code; no current app use of `external` found |
| UI-04 | P2 | `Button asChild` replaces the child's `onClick` with its own handler when cloning, so a child action handler can be lost. Evidence: `packages/ui/src/components/button.tsx` lines 52-61. | Verified in code; no current app use of `asChild` found |
| UI-05 | P2 | The UI package exposes two token representations: `tokens/index.ts` has a single static palette (including `background: '#09090b'`), while `skins/registry.ts` defines six per-world token sets. No in-repository consumer of the static `tokens` object was found. This makes the canonical design-token API unclear; consolidate or document the distinct purpose before adding more consumers. | Verified duplication; impact is architectural, not a confirmed runtime defect |
| UI-06 | P3 | The specifically tagged root `shadcn/tailwind.css` has identical content to copies under Dock, Headquarter, and ID, while app CSS uses the bare package import `shadcn/tailwind.css`. The `shadcn` package export maps that subpath to `dist/tailwind.css`; the root file has no direct import reference. `packages/ui/src/globals.css` also imports that package path but is not exported by the package manifest. Resolve which files are intentionally retained and remove dead snapshots only after confirming the bundler resolution. | Verified duplication and package export; cleanup safety needs build confirmation |
| UI-07 | P3 | `apps/gate/` is an active Next.js UI app and is included in the architecture gate, but is missing from the app inventory in `AGENTS.md`. | Verified documentation gap |

## 5. Requirements

1. **Field semantics:** Each shared control must connect visible labels, hints, and errors to its actual control ID. `aria-describedby` must contain IDs of rendered description nodes, not description text. Invalid and required states must be reflected consistently in markup.
2. **Link behavior:** `external`, `target`, and accessible new-tab messaging must agree in both `Link` and `LinkButton`, including `asChild`.
3. **Child event behavior:** `Button asChild` must preserve/compose the child and wrapper event handlers, refs, and disabled semantics, or be narrowed to a documented, safe composition contract.
4. **Dialog parity:** The Skin Laboratory must use the shared dialog behavior or an equivalent native dialog. Focus entry, Escape dismissal, focus restoration, and keyboard operation must be verified.
5. **Token authority:** Define which token interface is canonical. Preserve six distinct skins while preventing a stale single-color palette from being mistaken for the runtime theme.
6. **CSS source clarity:** Identify the actual Tailwind CSS import resolution in each app. Remove duplicate/dead files only when builds prove no app relies on them.
7. **App inventory:** Add Gate to the UI app map and ensure all five React apps remain inside the same control and quality gates.
8. **No bypass:** Every app control continues to come from `@moonwitness/ui`; app-specific composition may use native semantic containers and product-specific styling without copying primitive behavior.
9. **Enforce the complete rule:** Extend UI purity checks to detect internal component classes in app JSX and CSS, without flagging public `--mw-*` CSS tokens or the design-system implementation itself. Migrate all 24 identified app occurrences to public component props/variants or app-owned class names. Add a shared `Skeleton` API if the Gate loading state still needs the current skeleton treatment.

## 6. Acceptance Criteria

- Form component tests prove labels resolve to the rendered control ID and both hint/error IDs are referenced in `aria-describedby` for `Input`, `Textarea`, and `Select`; direct hint props render an associated description or are removed from the API.
- Architecture-gate regression tests fail for a prohibited `mw-card`/`mw-link` JSX class and a private `mw-button` CSS selector in an app, while continuing to pass on legitimate `--mw-*` token references and `packages/ui` implementation classes.
- The five app trees contain no hand-written internal component classes: migrate the 15 Gate JSX occurrences and 9 Headquarter/ID CSS selectors to public component APIs or app-owned classes.
- Link tests verify `external` opens a new tab with safe `rel`, does not misannounce same-tab navigation, and behaves identically in child composition.
- Button composition tests prove child and wrapper click handlers each run once and disabled controls cannot activate.
- Dialog tests verify Escape closes, focus enters and returns to the trigger, and the dialog is modal using native/shared semantics.
- Token ownership and every retained `shadcn/tailwind.css` entry point are documented; deleting any CSS copy is followed by all affected app builds.
- `AGENTS.md` lists all five React apps and the architecture gate still passes.
- `pnpm lint:arch`, `pnpm docs:check`, `pnpm lint`, `pnpm typecheck`, and builds for Dock, Gate, Headquarter, ID, and Jizz pass.
- Browser verification covers keyboard-only operation, focus visibility, 320px layout, 200% zoom, reduced motion, and axe checks on representative routes for each app. Results distinguish automated checks from manual checks.

## 7. Readiness

**Classification: CONDITIONALLY READY.** The app scope, current invariant baseline, and source-level defects are concrete. The CSS cleanup decision and actual browser accessibility results are prerequisites for declaring the work complete; neither blocks starting the isolated component fixes.
