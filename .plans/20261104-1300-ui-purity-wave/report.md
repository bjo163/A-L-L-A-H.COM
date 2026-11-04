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
| `pnpm lint` (`--max-warnings 0`) | Two errors, both parsing errors in files this wave never opened: `addons/works/models/isp_commercial.ts:56` and `packages/vscode-extension/src/extension.ts:382`. It passed clean earlier in the same session, in the window where those two files were syntactically whole. Zero findings in any file this wave owns. |
| `pnpm docs:check` | Pass, 100 / 100 |
| `pnpm dock:build` | Pass, "Compiled successfully" |
| `pnpm headquarter:build` | Pass, "Compiled successfully", `/skin-lab` prerendered |
| `pnpm id:build` | Pass, "Compiled successfully" |
| `pnpm jizz:build` | Pass, "Compiled successfully" |
| `pnpm typecheck` | Fails in three projects outside this wave's ownership; see 3 |

## 3. Not Claimed as Verified

`pnpm typecheck` fails in `addons/works`, `apps/arsy`, and `packages/vscode-extension`, and `pnpm lint` fails to parse
two of those same files. No file in those projects was edited by this wave, and every project it does own
(`packages/ui`, `packages/types`, `packages/sdk`, `packages/arsy-orm`, `dock`, `headquarter`, `id`, `jizz`) is clean.

Evidence that these files are being modified concurrently by another process during this session:

- `addons/works/models/isp_commercial.ts` reported `error TS2339: Property 'date' does not exist` at **line 48** in one
  run and `error TS1005: '}' expected` at **line 56** in the next, with no edit from me in between. Line 56 is a
  mid-write syntax state, not a stable file.
- `apps/sentinel/src/server.ts` and `apps/sentinel/tsconfig.json` appeared as modified in `git status` although this
  wave never touched `apps/sentinel`; an earlier `git diff HEAD -- apps/sentinel` in the same session reported them
  clean. `apps/sentinel` then dropped out of the failing list on the next run.
- `packages/vscode-extension/src/extension.ts(380,64): Property 'description' does not exist on type 'GatewayModel'`
  was already listed as a pre-existing working-tree modification when this session started.

Anyone resolving these three should expect the tree to move underneath them.

Also not done, and not claimed:

- The unused UI-plumbing dependencies are still in `apps/dock` and `apps/jizz`. CI runs
  `pnpm install --frozen-lockfile`, so removing them without regenerating `pnpm-lock.yaml` breaks the pipeline.
- `UI_PURITY` is still a line scanner, not the AST walk that `spec.md` of an earlier plan described. It now catches
  every case the audit found.
- App-local CSS layers (`hq-*`, `dock-*`, `id-*`, `jizz-*`, roughly 442 / 691 / 365 / 456 lines) remain. Only the
  shared-control overrides were moved back onto the package.
- `SkinLaboratory`'s own hand-rolled modal is untouched. `packages/ui` is the definition layer and is exempt from
  `UI_PURITY`; its internals should still move onto `Dialog` eventually.
- `apps/id/src/app/page.tsx` is still minified onto one line, so any future violation there reports line 1.
- `apps/id/src/app/page.tsx` links to `/sessions`, `/devices` and `/security`. Those routes were not verified to
  exist, which is an R-24 dead-navigation question rather than a UI-purity one.
- No browser click-through was performed. `Dialog` open and dismiss, the revoke path, `Select` keyboard use, and the
  `/skin-lab` layout are verified by compilation and code inspection only.
