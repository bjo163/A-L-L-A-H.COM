# Execution tasks

- [x] Inspect DNA contracts, current skin runtime, app mappings, and preserve existing local changes.
- [x] Add shared vector artwork for all six worlds and route-level `SkinScope`.
- [x] Upgrade world-specific hero compositions, readable accent-label tokens, and pauseable motion.
- [x] Apply Gate/Dock/ID/Headquarter/Observatory mappings and ROCKSOUL/RIOT route scopes.
- [x] Align DNA documentation, artwork ownership, and the explicit Gate/Dock Imperium root exception.
- [/] Run UI tests, contrast, architecture checks, typecheck, and relevant app builds. UI tests (42), contrast, lint, and Gate/Dock/Headquarter/ID builds pass. Jizz build/typecheck are blocked by a pre-existing TS2322 in `apps/jizz/src/lib/jizz/client.test.ts`; architecture lint reports seven existing Jizz violations; docs check reports 12 missing artifacts in other in-progress plans (80/100). `pnpm` also reports a preflight 404 for the workspace dependency `@moonwitness/sdk@^1.0.0`; the selected scripts still ran against existing `node_modules`.
- [x] Verify all six Skin Laboratory selections at 390px and 1440px with no horizontal overflow; verify Jizz ROCKSOUL/RIOT scopes at 390px and Gate/Dock/ID hero mappings at 390px and 1440px. Dialog, representative form validation/submission, and mobile navigation were exercised. Existing dev servers emitted unrelated 401s and `@allah/sdk` resolution errors, so record those as environment limitations rather than clean console evidence.
