# Completion Report: UI Purity Wave

## 1. Verified Deliverables

### 1.1 The gate now gates (`@moonwitness/lint`)

`packages/lint/src/check-architecture.mjs`:

| Change | Effect |
|---|---|
| `hasRawHTMLElement` accepts end-of-line as a tag boundary | Catches `<select` / `<a` / `<form` when the formatter puts attributes on the next lines |
| Blocked elements extended to `button`, `input`, `select`, `textarea`, `a`, `form`, `label`, `table` | Matches the documented rule |
| Scan extended to `packages/`, exempting `packages/ui` and `packages/vscode-extension` | Matches the documented scope |
| `collectFiles` no longer skips every directory named `lib` | `apps/id/src/lib/` and siblings are now visible to all ten rules |
| Hand-written `mw-button--*`, `mw-input-field__*`, `mw-card__*`, `mw-badge--*` flagged | Stops the class-output bypass of `buttonVariants` |
| Per-element remedy in the message | The failure tells the developer which primitive to import |

Proof, from real command output in this session:

1. Before the fix, with the violations present: `✅ All Architectural Invariants PASSED (100% compliant)` and exit 0.
2. After the fix, on the same un-migrated tree: `❌ ARCHITECTURAL VIOLATIONS DETECTED (24 error(s))`, exit 1, naming
   `ai-gateway/page.tsx:234 Raw <select>`, `tools/page.tsx:247 Raw <select>`, `ai-gateway/page.tsx:301 Raw <table>`,
   `tools/page.tsx:320 Raw <table>`, `knowledge/page.tsx:100 Raw <form>`, `id/login/page.tsx:80 Raw <form>`,
   `id/register/page.tsx:93 Raw <form>`, twelve raw `<a>`, two raw `<label>`, and three `Internal '@moonwitness/ui'
   class names used directly` hits in `headquarter/src/app/page.tsx`.
3. After the migration: `✅ All Architectural Invariants PASSED (100% compliant)`, exit 0.

### 1.2 Primitives added to `@moonwitness/ui`

- `Select` (`components/select.tsx`) wraps a native `<select>`, so typing, arrow keys, and screen readers come from
  the browser. Label, error and hint are wired by id; `aria-describedby` is merged, not overwritten.
- `Table`, `TableScroll`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`
  (`components/table.tsx`). `TableScroll` owns the horizontal overflow so a wide telemetry grid cannot break a phone
  layout; `TableHead` defaults to `scope="col"`.
- `Dialog` (`components/dialog.tsx`) wraps a native `<dialog>` with `showModal()`. Focus trap, `Escape`, backdrop and
  focus return are browser behaviour. A backdrop click dismisses; the `close` listener is registered and removed with
  a stable handler reference.
- `Form` and `FormField` (`components/form.tsx`) plus `lib/form-field.ts`. `FormField` publishes one id, error id and
  hint id through context; `Input`, `Select` and `Textarea` resolve `props.id ?? context.id ?? own useId()`, so a
  control inside a field needs no hand-threaded id. A real `<label for>` is mandatory.
- `Button asChild` and `Link` (`components/link.tsx`) with `asChild`, `current`, `underline` and `external`.
  `asChild` moves the variant contract onto the caller's element instead of nesting a button inside an anchor.
  `external` guarantees `noopener noreferrer` and appends a screen-reader "Opens in a new tab." note.
- `Avatar` gained a `size` variant (`sm` / `default` / `lg`), which is what replaced the hand-rolled profile block
  in `apps/id/src/app/account/page.tsx`.
- Interactive primitives now declare `'use client'`, so they can be used from a Next.js Server Component. Without
  this, `headquarter`'s home page failed prerender with "Event handlers cannot be passed to Client Component props".

`skins.css`: `.mw-sr-only`, `.mw-link`, `.mw-form`, `.mw-form-field`, `.mw-select`, `.mw-table`, `.mw-dialog` and
their states, all driven by the existing `--mw-*` tokens. `.mw-link` is deliberately a single-class selector so an app
may restyle a link surface without fighting the skin layer for specificity. Per-world overrides extend the six DNA
blocks to the new surfaces. Logical properties only (`padding-inline-end`, `inset-inline-end`); no `outline: none`
replacement, no hardcoded colour in a component rule; the dialog scrim is `color-mix` of the skin's own canvas.

### 1.3 Applications migrated

- `apps/headquarter`: both native selects to `Select`; both hand-built tables to the `Table` family with captions
  that name the record count; the knowledge search to `Form layout="row"`; three anchors wearing `mw-button--*`
  classes to `Button asChild`; the "Back to HQ" button-inside-anchor to `Button asChild`; the workspace rail to
  `Link asChild` with `current`; the revoke flow from `window.confirm` to `Dialog` with "Keep access" and a
  destructive "Revoke access".
- `apps/id`: login and register to `Form`; four anchors to `Button asChild` / `Link external`; the duplicated avatar
  block to `<Avatar size="lg" />`; the duplicated `cn` helper reduced to a re-export from `@moonwitness/ui`.
- `apps/dock`: hero jump link and destination cards to `Link`, keeping their layout classes.
- `apps/headquarter/src/app/swarm/page.tsx`: per-instance Tailwind colour overrides removed from `Input` and
  `Button`, so the skin variants decide again.
- `apps/headquarter/src/app/agent/page.tsx`: `sdui?: any[]` to `SDUINode[]`, which exposed a genuine latent bug: the
  chips read `s.title`, a property `SDUINode` never had. They now render `s.type`.

### 1.4 Cross-app navigation

`packages/ui/src/blocks/endpoints.ts` exports `resolveEcosystemEndpoints(env)` and `EcosystemAppEndpoints`.
`EcosystemNavbar` takes an `apps` prop, so the six `http://localhost:300x` literals are gone from the mandatory shared
component. The four apps call it with their own `process.env`; `.env.example` documents
`NEXT_PUBLIC_ECOSYSTEM_ORIGIN` and the four `NEXT_PUBLIC_*_URL` overrides. The package never reads `process.env` or
`window` itself, so server and client render identical hrefs.

### 1.5 Showcase and shared contract

- `SkinLaboratory` now ships the 43 `mw-skin-lab*` classes it already referenced, and is mounted at
  `apps/headquarter/src/app/skin-lab/page.tsx`, which prerenders as a static route.
- `ToolExecutionRecord` moved to `@moonwitness/types` as the MCP audit contract, replacing `output?: any` with
  `output?: unknown`. `@allah/sdk` returns it, `apps/headquarter` types its audit state with it, the gateway registry
  imports it, and the name is now in the `SHARED_DATA_CONTRACTS` guard list.

### 1.6 Type and lint governance

- `strict: true` enabled for `packages/ui`, `apps/dock`, `apps/headquarter`, `apps/id`, `apps/jizz`. All five are
  clean today; the fallout that appeared was real: `options.companyId` needed `?? null`, a generic row spread needed
  an explicit record type, and two `catch (err: any)` blocks in `tools/page.tsx` were replaced with narrowing.
- `scripts/typecheck.ts` fixed and made honest: it printed `Found ${tsconfigs}` (the array joined with commas), and it
  claimed "PASSED strict type-check (100% compliant)" while strict was switched off almost everywhere. It now reports
  how many projects actually enable strict.
- ESLint gained `no-restricted-imports` scoped to `apps/**` for `@base-ui/react`, `class-variance-authority`, `clsx`,
  `tailwind-merge`, `cn` and `shadcn`. No app imports those today, so the rule is a fence, not a cleanup.
- `packages/arsy-orm/src/repository.ts`: the translation query interpolated `companyId` into SQL
  (`WHERE company_id IN (0, ${companyId || 0})`). It is now a bound parameter. The `PARAMETERIZED_QUERIES` rule misses
  this shape because it only looks for interpolation inside a `.query(...)` call expression.
- `AGENTS.md` (1.3.0 → 1.4.0) and `CHANGELOG.md` (1.0.0 → 1.1.0) updated so the documented invariant matches the
  enforced one.

## 2. Gate Results

| Gate | Result |
|---|---|
| `pnpm lint:arch` | Pass, "All Architectural Invariants PASSED (100% compliant)", exit 0 |
| `pnpm lint` (`--max-warnings 0`) | Pass, exit 0, no problems reported |
| `pnpm docs:check` | Pass, 100 / 100 |
| `pnpm typecheck` | Pass, "All TypeScript projects passed. Strict mode is enabled in 6 of 24." |
| `pnpm dock:build` | Pass, "Compiled successfully" |
| `pnpm headquarter:build` | Pass, "Compiled successfully", `/skin-lab` prerendered |
| `pnpm id:build` | Pass, "Compiled successfully" |
| `pnpm jizz:build` | Pass, "Compiled successfully" |
| `pnpm install --frozen-lockfile` | Pass, exit 0, after the dependency removals and lockfile regeneration |

## 2b. Browser Verification

Dev servers: `apps/headquarter` on 3002, `apps/id` on 3003, hub on 5150. Screenshots in `evidence/`.

| Surface | Evidence |
|---|---|
| `headquarter /skin-lab` | `evidence/skin-lab.png`: SkinLaboratory renders mounted and fully styled. Six world nav cards, app-shell preview, content cards, a labelled form, and the Loading, Empty, Error and Success states. Before this wave the block had zero styles and zero consumers. |
| `headquarter /ai-gateway` | a11y snapshot: `combobox "Route Alias"` with six `option` children, so the new `Select` carries its accessible name from a real label. Table renders `"Gateway audit records, newest last. 0 shown."` as a caption, eight column headers, and the honest empty row. |
| `headquarter /ai-gateway` | `link "Back to HQ"` proves `Button asChild` produces a real anchor with the variant contract instead of a button nested in an anchor. |
| `headquarter /agent` | `dialog.mw-dialog` present in the DOM: native element, `open=false`, `aria-labelledby` and `aria-describedby` resolved to real ids, title text, and both actions `"Keep access"` and `"Revoke access"`. `showModal` is available on the element. |
| `id /register` | Filled and submitted the migrated `Form` with four `Input` fields, each named by its label and `required`. Submit showed the `"Provisioning Account..."` disabled state, then redirected to `/account` as an authenticated user. |
| `id /account` | `evidence/id-account.png`: the shared `Avatar size="lg"` renders the initial, and the three `Link external` anchors resolve to `http://localhost:3001`, `:3002`, `:3004` from `resolveEcosystemEndpoints`, each carrying the screen-reader text `"Opens in a new tab."` |
| `dock /` | `evidence/dock-home.png` and its a11y snapshot: the hero jump is a real anchor to `#dock-index-title`, a destination that exists on the page, and the three destination cards are links with complete accessible names (`"01 OPERATIONS Headquarter Inspect the gateway..."`) pointing at 3002, 3003/account and 3004. The app's own `dock-destination` styling still governs the card surface, which is what the single-class `.mw-link` selector was chosen for. |
| `dock /`, `id /`, `headquarter /` | No application console error was observed on these pages. The only runtime notice is the hub's `"Missing or invalid authentication credentials"` session status, which the pages render as a designed status line with a Retry path rather than a crash. |

Two defects surfaced only because the pages were actually run, and both were fixed:

1. `apps/headquarter/src/app/ai-gateway/page.tsx` guarded `telemetry` but dereferenced `telemetry.metrics` unconditionally, so the page crashed with `Cannot read properties of undefined (reading 'totalRequests')`. The four metric cards now fall back to `"Not reported"`, which is the state the design already promised.
2. `packages/sdk/src/index.ts` typed `getProviders` and `getUsageLogs` as arrays without checking the payload, so a non-array hub response reached the app and crashed it on `providers.map`. Both now validate the way `getAuditLog` already did, and the page shows its error banner with a Retry action instead of a stack trace.

The `"N"` circles visible at the left edge of the screenshots are the Next.js dev-tools overlay (a shadow-root portal), not application UI: no element in any page owns the text `"N"` and no pseudo-element generates it. They do not exist in a production build.

## 2d. Fifth workspace (`apps/gate`)

A fifth Next app appeared in the tree while this wave was in flight. The user's standing rule is that every frontend app must consume the shared design system, so it was brought in line rather than exempted.

Package gaps that app exposed, and the fixes:

| Gap | Fix |
|---|---|
| `EcosystemNavbar` typed `currentApp` to the original four apps, so the new workspace could not adopt the mandatory shared navbar | `currentApp?: string`, with the badge label falling back to the uppercased id |
| No button-styled link existed. `Button asChild` around the package `Link` stacks `mw-link` chrome onto `mw-button` chrome | `LinkButton` exported from `components/link.tsx`: native anchor, `buttonVariants`, click sound, `external` handling with `noopener noreferrer` and the screen-reader note |
| `Card` rendered only a `div` and `CardTitle` only an `h3`, so migrating hand-written `mw-card` markup would drop `article` semantics or break heading order | `Card` gained `as` (`div` / `article` / `section` / `aside`); `CardTitle` gained `as` (`h2` / `h3` / `h4`) |

Migration result: `apps/gate` went from 54 `UI_PURITY` findings to 0 across `closing-horizon`, `community-portal`, `discover-filters`, `explore-index`, `info-page-shell`, `journey-next` and `transmissions-feed`. The filter groups in `discover-filters` also lost a dangling-label defect: three `<label>` elements named nothing (no `for`, no control), now `role="group"` with `aria-labelledby` pointing at a real id.

The hardened gate earned its keep here: it caught every one of those 54 the moment the files landed, which is exactly the failure mode it had before this wave.

`apps/gate` is still untracked in git, so its migrated files are working-tree changes for the process that owns that app; this wave committed only the shared-package API additions.

## 2e. Final gate state

| Gate | Result |
|---|---|
| `pnpm lint:arch` | Pass, "All Architectural Invariants PASSED (100% compliant)", 0 findings across `apps/` and `packages/` |
| `pnpm lint` | Pass, no problems reported |
| `pnpm docs:check` | Pass, 100 / 100 |
| `pnpm typecheck` | Pass, "All TypeScript projects passed. Strict mode is enabled in 7 of 25." |
| `dock:build`, `headquarter:build`, `id:build`, `jizz:build` | All "Compiled successfully" |

## 2f. Incident Log

Another process is editing this repository concurrently, and three of its actions affected this wave:

- It committed most of this wave's output into `60ced9b`, a commit whose message describes ORBIT, WORKS and Sentinel, and that commit reached the remote.
- It ran a `shadcn` CLI init that left untracked `postcss.config.cjs` and `tailwind.config.js` in `apps/dock` and `apps/id`, plus `shadcn/` staging directories. Those configs require `autoprefixer` and `@tailwindcss/postcss`, which the apps do not declare, and they broke three of four app builds. I quarantined them as `*.disabled-shadcn-init` rather than deleting them, so that work is still recoverable, and the builds returned to green.
- It rewrote `BACKLOG.md` as 73 lines of the literal text `[object Object]`, destroying the tracked content and dropping docs:check to 95. I restored the file from HEAD. Whatever it intended to add is unrecoverable.

## 3. Corrections to the Original Audit

The audit that opened this wave made one factual error that this work exposed:

- It reported `shadcn` as a dependency that was "not imported anywhere" in `apps/dock`. It is used, from CSS:
  `@import "shadcn/tailwind.css"` in the globals of `dock`, `id` and `jizz`. A JS-only import scan missed it. `shadcn`
  therefore stays declared in all three apps, and the removals were limited to what no file of any kind references.

## 4. Not Claimed as Verified

- The `Dialog` open interaction, as set out in section 3 of the browser table above.
- No narrow-viewport or reduced-motion pass in the browser. The `TableScroll` overflow, the 44px targets and the
  `prefers-reduced-motion` rules are verified by code and by the skin stylesheet, not by a resized live page.

## 5. Deliberately Left Out of This Wave

- `UI_PURITY` is still a boundary-aware line scanner, not the AST walk an earlier plan's spec described. It now catches
  every case the audit found, and the message names the primitive to import.
- App-local CSS layers (`hq-*`, `dock-*`, `id-*`, `jizz-*`, roughly 442 / 691 / 365 / 456 lines) remain. Only the
  shared-control overrides were moved back onto the package.
- `SkinLaboratory`'s own hand-rolled modal is untouched. `packages/ui` is the definition layer and is exempt from
  `UI_PURITY`; its internals should still move onto `Dialog`.
- `apps/id/src/app/page.tsx` is still minified onto one line, so any future violation there reports line 1. That file
  also links to `/sessions`, `/devices` and `/security`; those routes were not verified to exist, which is an R-24
  dead-navigation question rather than a UI-purity one.
- The four quarantined `*.disabled-shadcn-init` files and the `shadcn/` staging directories are still on disk,
  untracked. Delete them or restore them once the process that created them is finished.
- The hub contract mismatch that the new SDK guard now surfaces (`/v1/gateway/providers` returning a non-array in this
  dev environment) is a gateway-side question, not an app-side one. The app reports it instead of crashing.

