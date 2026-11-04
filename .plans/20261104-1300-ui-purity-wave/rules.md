---
status: "in_progress"
---
# Invariants & Security Rules: UI Purity Wave

## 1. Architectural Invariants

- **Single UI authority.** Every interactive or structural control in `apps/**` and
  `packages/**` resolves to an export of `@moonwitness/ui`. `packages/ui` is exempt because it
  is the definition layer; `packages/vscode-extension` is exempt because webviews ship raw HTML
  by design.
- **No internal class strings outside the package.** `mw-button--*`, `mw-input*`, `mw-card*`,
  `mw-badge*` and `mw-skin-lab*` are private output of the package. Application code consumes
  the component API, never the class names, because the names are not a contract.
- **Native semantics before ARIA.** A new primitive wraps the native element that already has
  the behaviour (`select`, `dialog`, `table`, `form`) instead of reimplementing keyboard and
  screen-reader behaviour in React.
- **Token-driven skinning.** No primitive hardcodes a colour. Skin differences are expressed
  through `--mw-*` custom properties and `[data-moonframe-skin]` overrides.
- **Gate truth.** A documented rule that the linter does not enforce is a defect in the rule,
  not in the code. Either the linter catches it or the documentation stops claiming it.

## 2. Accessibility Constraints

- Focus indicator: nothing may set `outline: none` without a replacement. The shared
  `:focus-visible` ring in `skins.css` stays authoritative.
- Every control reaches or exceeds a 44px tap target, matching the existing `Button`, `Input`
  and navbar rules.
- Every field has a real `<label for>`; placeholder-only labelling is not accepted.
- Error text is announced with `role="alert"` and linked through `aria-describedby`, never
  carried by colour alone.
- `Dialog` closes on `Escape` and returns focus to the element that opened it. Native
  `<dialog>` provides both; a hand-written overlay does not.
- Non-text contrast for control boundaries and status markers stays at 3:1.
- Layout direction uses logical properties so RTL reﬂows without physical `left` / `right`.

## 3. Security Constraints

- `EcosystemNavbar` endpoints come from props or environment, never from an embedded host that
  can leak into a production bundle.
- No new outbound request is introduced by this wave; the SSRF rule
  (`validateUrlSsrf` before any upstream `base_url`) is unchanged.
- Revoke remains an explicit confirmation: the dialog's confirm action is the only path that
  calls the endpoint, and it stays `company_id` scoped on the server side.

## 4. Quality Gate Compliance

- `pnpm lint:arch` passes on the migrated tree and fails on a reintroduced raw `<select>`.
- `pnpm lint` passes with `--max-warnings 0`.
- `pnpm typecheck` passes with zero errors.
- `pnpm docs:check` at 100/100.
- `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build` pass.
