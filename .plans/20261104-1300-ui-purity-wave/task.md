# TASK: UI Purity Wave

## Gate correctness (`packages/lint`)
- [x] REQ-1.1 Fix `hasRawHTMLElement` tag-boundary regex
- [x] REQ-1.2 Extend blocked elements to `a`, `form`, `label`, `table`
- [x] REQ-1.3 Scan `packages/` too, exempt only `packages/ui` and `packages/vscode-extension`
- [x] REQ-1.4 Drop the blanket `lib` exclusion from `collectFiles`
- [x] REQ-1.5 Detect hand-written `mw-button--*` class strings outside the package

## Shared primitives (`packages/ui`)
- [x] REQ-2.1a `Select` component
- [x] REQ-2.1b `Table` family (Table, TableScroll, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption)
- [x] REQ-2.1c `Dialog` on native `<dialog>`
- [x] REQ-2.1d `Form` + `FormField` with label/error wiring through context
- [x] REQ-2.1e `Button` gains `asChild`, `Link` gains `asChild` / `current` / `underline`
- [x] REQ-2.2 Skin styles for every new primitive in `skins.css`
- [x] REQ-2.4 `Input` and `Textarea` consume the `FormField` context

## App migration
- [x] REQ-3.1a headquarter: replace both raw `<select>`
- [x] REQ-3.1b headquarter: replace both raw `<table>`
- [x] REQ-3.1c headquarter: replace raw `<form>` and `<label>`
- [x] REQ-3.1d id: replace both raw `<form>` and raw `<label>`
- [x] REQ-3.1e id + dock + headquarter: replace raw `<a>` controls
- [x] REQ-3.3 headquarter: `window.confirm` to `Dialog`
- [x] REQ-3.4 swarm page: Tailwind colour overrides to package variants
- [x] REQ-3.5 id/account: shared `Avatar` with a `size` variant; id/lib/utils.ts: reduced to a `cn` re-export (the IDE file-delete call failed twice)

## Package hygiene
- [x] REQ-4.1 `SkinLaboratory` styles plus a real mount at Headquarter `/skin-lab`
- [x] REQ-4.2 `EcosystemNavbar` endpoints from `resolveEcosystemEndpoints()` and the `apps` prop
- [x] REQ-4.3 ESLint `no-restricted-imports` for `apps/**`
- [x] REQ-4.4 `strict` enabled for `packages/ui`, `dock`, `headquarter`, `id`, `jizz`; the type-check gate now prints its real strict coverage

## Verification
- [x] `pnpm lint:arch` passes on migrated tree
- [x] Gate evidence: it reported 24 `UI_PURITY` violations before migration and 0 after, where the old code reported 0 with those same 24 present
- [x] `pnpm lint` passes with `--max-warnings 0`
- [ ] `pnpm typecheck` passes. Blocked by three projects this wave does not own; see report.md
- [x] `pnpm docs:check` at 100/100
- [x] `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build` pass
- [x] `report.md` written from real command output

## Not taken in this wave
- Removing the unused `@base-ui/react`, `class-variance-authority`, `shadcn` and `cn` dependencies from
  `apps/dock` and `apps/jizz`. CI installs with `--frozen-lockfile`, so a `package.json` edit without a
  regenerated lockfile breaks the pipeline. The `no-restricted-imports` rule now blocks the bypass instead.
- AST-based `UI_PURITY` parsing. The boundary-aware line scanner closes every violation found in the audit;
  the spec's AST wording is now narrower than before but still not literal.
- Converting the new `Select` to an ARIA listbox, and migrating `SkinLaboratory`'s internal hand-rolled modal.
- App-local CSS layers (`dock-*`, `hq-*`, `id-*`, `jizz-*`) beyond the controls listed above.
