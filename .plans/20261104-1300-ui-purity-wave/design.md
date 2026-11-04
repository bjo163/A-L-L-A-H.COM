# DESIGN: UI Purity Wave

## 1. Component API added to `@moonwitness/ui`

| Export | Element it wraps | Purpose |
|---|---|---|
| `Select` | native `<select>` | Keyboard and AT behaviour for free; the package supplies skin only |
| `Table`, `TableScroll`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | native table elements | Telemetry grids across skins without 40 Tailwind classes per page |
| `Dialog` | native `<dialog>` | Focus trap, `Escape`, backdrop and focus return are browser behaviour, not hand-written code |
| `Form` | native `<form>` | Skin-level field rhythm plus a submit affordance |
| `FormField` | `<div>` plus `<label>` | Wires label, hint and error to the control through context |
| `Button` `asChild` | any single child | Turns the variant contract into a link without hand-writing class names |

### `asChild` contract
`<Button asChild><Link href="/x">Open</Link></Button>` merges `buttonVariants`, the click
handler and the sound effect onto the child. `asChild` without exactly one element child throws
in development instead of silently rendering a `<button>` inside an `<a>`.

### `FormField` context
`FormField` creates one `useId()` and publishes `{ id, errorId, hintId, invalid }`. `Input`,
`Select` and `Textarea` resolve their id as `props.id ?? context.id ?? own useId()`, and merge
`aria-describedby` with the hint and error ids. A control outside a field keeps today's
behaviour, so the change is additive.

## 2. Skin styling rules for the new primitives

- Style only through `--mw-*` tokens already defined by the skin registry: `--mw-canvas`,
  `--mw-surface`, `--mw-surface-raised`, `--mw-border`, `--mw-border-width`, `--mw-text`,
  `--mw-muted-text`, `--mw-accent`, `--mw-accent-text`, `--mw-danger`, `--mw-focus`,
  `--mw-control-radius`, `--mw-surface-radius`, `--mw-*-shadow`, `--mw-font-*`, `--mw-motion-*`.
- No hardcoded hex or rgb colour inside a component rule; per-skin overrides live in the
  `[data-moonframe-skin='…']` blocks.
- Logical properties only (`padding-inline-end`, `inset-inline-end`), so RTL layouts reflow.
- Every interactive boundary keeps the shared `:focus-visible` ring; nothing sets
  `outline: none`.
- Native `appearance: none` on the select is paired with a real caret element marked
  `aria-hidden="true"`, so the control still reads as a dropdown.
- Tap targets stay at or above 44px, matching `Button`, `Input` and the navbar.

## 3. UI states each new surface must show

| Surface | Empty | Loading | Error |
|---|---|---|---|
| AI Gateway model table | "No models served yet" plus the action that fills it | Skeleton row with text | Failed-fetch banner with a Retry action |
| Tools table | Same: names the cause and the next action | Same | Same |
| Revoke dialog | n/a | Confirm button disabled with visible text | The failure is stated in the dialog, not swallowed |

## 4. Gate design

`UI_PURITY` becomes boundary-aware rather than line-aware:

- Match `<tag` when the next character is whitespace, `>`, `/` **or the end of the line**.
- Blocked elements: `button`, `input`, `select`, `textarea`, `a`, `form`, `label`, `table`.
- Scan both `apps/` and `packages/`; exempt `packages/ui` (the definition layer) and
  `packages/vscode-extension` (webviews are raw HTML by design).
- A hand-written `mw-button--*` class string outside `packages/ui` is a violation in its own
  right, because it bypasses `buttonVariants`.

## 5. Migration map

| Site | Before | After |
|---|---|---|
| `headquarter/src/app/page.tsx` | `<a className="mw-button mw-button--default">` | `<Button asChild><Link></Button>` |
| `headquarter/src/app/ai-gateway/page.tsx` | raw `<select>`, raw `<table>`, raw `<a>` | `Select`, `Table` family, `Button asChild` |
| `headquarter/src/app/tools/page.tsx` | raw `<select>`, raw `<table>`, raw `<label>`, raw `<a>` | `Select`, `Table` family, `FormField`, `Button asChild` |
| `headquarter/src/app/knowledge/page.tsx` | raw `<form>` | `Form` + `FormField` |
| `headquarter/src/components/remote-agent-control-panel.tsx` | `window.confirm` | `Dialog` |
| `headquarter/src/app/swarm/page.tsx` | Tailwind colour overrides on `Button`/`Input`/`Card` | package variants |
| `id/src/app/login/page.tsx`, `register/page.tsx` | raw `<form>` | `Form` + `FormField` |
| `id/src/app/account/page.tsx` | raw `<a>`, hand-rolled avatar block, `text-[10px]` overrides | `Button asChild`, `Link`, shared `Avatar` |
| `dock/src/app/page.tsx` | raw `<a>` with bespoke CSS class | `Link` primitive |
| `ui/src/blocks/navbar.tsx` | localhost literals, raw `<a>`, `buttonVariants` on anchors | `apps` prop, `Button asChild` |
