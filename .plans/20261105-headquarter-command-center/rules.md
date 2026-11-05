# Local AI rules — Headquarter
1. Work only on existing dev. Never create branches. If unavailable/protected, stop and report; do not switch to main.
2. Read root AGENTS.md, AUTONOMOUS.md, DOCUMENTATION_CONTRACT.md, QUALITY.md, DESIGN.md, BLUEPRINT.md, DECISIONS.md, app AGENTS.md and this plan.
3. Inspect git status; preserve unrelated changes. Never reset, clean, force-push or overwrite user work.
4. Use existing JS/TS stack. No new framework, runtime, package manager, database, service or dependency without proven need and ADR.
5. Inspect source, SDK exports/types, ARSY route schemas, tests and installed Next.js docs before edits.
6. ARSY is sole authority for auth, tenant/RBAC, policy, persistence and audit. No direct DB access from app.
7. Use @allah/sdk and @moonwitness/types; extend contracts only after verifying backend and consumers.
8. All controls/shared composition use @moonwitness/ui. No private primitives, literal palette colours, inline paint styles or app theme variables.
9. NEXUS PARADOX is the only Headquarter skin. No second effects provider.
10. HQ_NAV is the single operational navigation source. Classify utility routes separately.
11. Preserve existing URLs unless redirects and regression coverage are included.
12. Never fabricate data, health, usage, agent activity, costs, freshness or completion. Distinguish zero/unknown/unavailable/stale.
13. Server-side authorization is mandatory. Hiding controls is not security. Test tenant isolation and forbidden operations.
14. Never log/expose pairing tokens, virtual keys, secrets, private prompts, workspace paths or local files.
15. Headquarter cannot override VS Code consent, reviewable edits or command policy.
16. Cancellation is a request until persisted confirmation. No optimistic success for privileged actions.
17. No hidden execution or destructive action without explicit confirmation.
18. Server components by default. Client components only for actual interaction. Clean up streams, bound history and reconnect safely.
19. Implement loading, empty, partial, stale, offline, unauthorized, forbidden, pending, success and failure states as applicable.
20. Meet WCAG 2.2 AA target, keyboard/focus, reduced motion, responsive behavior and Moon UI gates.
21. Keep tasks atomic; one concern and one observable acceptance check.
22. No task is complete without reproducible evidence. Keep report.md honest.
23. Run focused tests, app typecheck/build, then root quality gates. Never suppress failures.
24. Commit coherent verified slices with conventional messages; push only dev. Never claim success without confirmation.
25. No unrelated refactors, duplicate docs, speculative abstractions or branch creation.
