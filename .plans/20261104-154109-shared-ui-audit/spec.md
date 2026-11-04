---
title: "Shared UI Package and App Adoption"
status: "in_progress"
timestamp: "2026-11-04T15:41:09+07:00"
author: "Copilot"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
---

# SPEC: Shared UI Package and App Adoption

## 1. Goal

Keep all five React apps on the `@moonwitness/ui` contract and close proven accessibility/API gaps in the shared components before expanding app-specific UI work. Preserve each product DNA; unify behavior, semantics, and accessibility rather than forcing identical visual composition.

This plan has been implemented across the shared UI package and the five React apps. Final status remains in progress until the remaining browser-only checks are resolved or explicitly waived.

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
- Initial shared UI tests passed: 11/11 before adding regression coverage. The updated component suite is recorded in the implementation report after final validation.
- Static source inspection did not establish browser/axe, keyboard, 200%-zoom, or per-route visual results in this audit. Those remain explicit implementation verification gates.

### App inventory

| App | UI scope | Audit result |
|---|---|---|
| Dock | React/Next.js app using shared navbar, links, motion, and skin APIs | No raw JSX controls found; app-specific CSS remains |
| Gate | React/Next.js app consuming shared UI blocks and components | No raw JSX controls; migrated the identified internal classes |
| Headquarter | React/Next.js app using shared controls and Skin Laboratory | No raw JSX controls; migrated CSS selectors to public slots |
| ID | React/Next.js app using shared form controls | No raw JSX controls; migrated CSS selectors to public slots |
| Jizz | React/Next.js app using shared navbar, cards, and motion | No raw JSX controls found |

`apps/arsy/` and `apps/sentinel/` are service packages rather than React apps; `apps/server/` has no app package manifest. They are not UI adoption targets in this plan.

## 4. Audit Findings

| ID | Priority | Finding and evidence | Status |
|---|---|---|---|
| UI-08 | P1 | The UI gate missed app-level private-class bypasses because its TSX scan checked only selected class prefixes and did not scan CSS. Gate used `mw-card`, `mw-link`, `mw-raw-stack`, and `mw-skeleton` in six files; Headquarter and ID used private selectors in global CSS. | Resolved: gate scans app JSX/CSS and all identified uses now use public components or data slots |
| UI-01 | P1 | `FormField` generated and rendered hint/error IDs, but controls did not consume those IDs. Direct `hint` props were passed to `aria-describedby` as text without a corresponding description node. | Resolved: controls now reference field/direct description nodes and propagate required state; component tests cover all three controls |
| UI-02 | P1 | `SkinLaboratory` implemented its demo modal as a `div[role=dialog][aria-modal=true]` without native focus management or Escape behavior, despite a shared native `Dialog` being available. | Resolved in code: block now uses shared native `Dialog`; browser keyboard/focus verification remains pending |
| UI-03 | P2 | `Link` announced a new tab for `external` but did not set `_blank`, unlike `LinkButton`. | Resolved: both components apply consistent target, safe rel, and accessible announcement behavior; tests cover both |
| UI-04 | P2 | `Button asChild` replaced the child's `onClick` handler when cloning. | Resolved: composed handlers and child refs are preserved; tests cover handler and disabled activation behavior |
| UI-05 | P2 | `tokens/index.ts` exposed a static palette alongside six runtime skin token sets without clarifying which is canonical. No app consumes the static palette. | Resolved without a breaking API removal: deprecated static palette points consumers to the selected skin tokens |
| UI-06 | P3 | The tagged root `shadcn/tailwind.css` duplicated app-local snapshots. Apps resolve the bare CSS import through the `shadcn` package export; the UI global stylesheet was not exported or imported. | Resolved: removed the five unreferenced snapshots; app package CSS imports remain |
| UI-07 | P3 | `apps/gate/` is an active Next.js UI app and was missing from the app inventory in `AGENTS.md`. | Resolved: Gate is now listed in the app map |

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
- Browser verification on Headquarter `/skin-lab` confirms native modal semantics, focus entry, Escape dismissal, and focus restoration to the trigger. Automated component tests verify the named native dialog markup. Backdrop-click behavior remains unverified in the integrated browser.
- Token ownership and every retained `shadcn/tailwind.css` entry point are documented; deleting any CSS copy is followed by all affected app builds.
- `AGENTS.md` lists all five React apps and the architecture gate still passes.
- `pnpm lint:arch`, `pnpm docs:check`, `pnpm lint`, `pnpm typecheck`, and builds for Dock, Gate, Headquarter, ID, and Jizz pass.
- Browser checks at a 320px viewport found no horizontal overflow on representative routes in all five apps. Headquarter `/skin-lab` also remained within a 640px viewport with reduced motion enabled; its route animation resolved to `none`. True 200% browser zoom and axe checks were not available in this browser session and remain unverified.

## 7. Readiness

**Classification: IMPLEMENTED, VERIFICATION INCOMPLETE.** The source changes, app builds, architecture gate, shared UI tests, typecheck, lint, and documentation checks have passed. Keep the plan in progress until backdrop-click behavior, true 200% browser zoom, and axe checks are verified or explicitly waived. The existing Headquarter Tailwind config format warning and local auth 401 responses are recorded as unrelated environment observations.
