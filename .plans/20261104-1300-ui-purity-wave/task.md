# TASK: UI Purity Wave

## Gate correctness (`packages/lint`)
- [ ] REQ-1.1 Fix `hasRawHTMLElement` tag-boundary regex
- [ ] REQ-1.2 Extend blocked elements to `a`, `form`, `label`, `table`
- [ ] REQ-1.3 Scan `packages/` too, exempt only `packages/ui` and `packages/vscode-extension`
- [ ] REQ-1.4 Drop the blanket `lib` exclusion from `collectFiles`
- [ ] REQ-1.5 Detect hand-written `mw-button--*` class strings outside the package

## Shared primitives (`packages/ui`)
- [ ] REQ-2.1a `Select` component
- [ ] REQ-2.1b `Table` family (Table, TableScroll, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption)
- [ ] REQ-2.1c `Dialog` on native `<dialog>`
- [ ] REQ-2.1d `Form` + `FormField` with label/error wiring through context
- [ ] REQ-2.1e `Button` gains `asChild`
- [ ] REQ-2.2 Skin styles for every new primitive in `skins.css`
- [ ] REQ-2.4 `Input` and `Textarea` consume the `FormField` context

## App migration
- [ ] REQ-3.1a headquarter: replace both raw `<select>`
- [ ] REQ-3.1b headquarter: replace both raw `<table>`
- [ ] REQ-3.1c headquarter: replace raw `<form>` and `<label>`
- [ ] REQ-3.1d id: replace both raw `<form>` and raw `<label>`
- [ ] REQ-3.1e id + dock + headquarter: replace raw `<a>` controls
- [ ] REQ-3.3 headquarter: `window.confirm` to `Dialog`
- [ ] REQ-3.4 swarm page: Tailwind colour overrides to package variants
- [ ] REQ-3.5 id/account: shared `Avatar`; id/lib/utils.ts: remove duplicate `cn`

## Package hygiene
- [ ] REQ-4.1 `SkinLaboratory` styles plus a real mount
- [ ] REQ-4.2 `EcosystemNavbar` endpoints as props
- [ ] REQ-4.3 ESLint `no-restricted-imports` for `apps/**`
- [ ] REQ-4.4 Agree `strict` TS between tsconfig and the typecheck script

## Verification
- [ ] `pnpm lint:arch` passes on migrated tree and fails on a reintroduced `<select>`
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm docs:check` at 100/100
- [ ] `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build` pass
- [ ] `report.md` written from real command output
