# Rules — LUNAR CHRONICLES Visual Foundation

# Rules — Autonomous execution contract

1. Work only in the existing `dev` branch of `bjo163/A-L-L-A-H.COM`. Never create a branch, switch to `main`, or modify historical repositories.
2. Before each batch, inspect current HEAD, working tree, target files, and relevant source. Never assume the baseline SHA is still current.
3. Execute every task that is safely within this plan without asking the user for confirmation. Make reasonable reversible implementation choices and record them.
4. Keep changes inside `apps/id` and this plan directory unless a concrete shared-contract defect requires a separately justified shared-library change.
5. ARSY is the only authority for identity, credentials, authentication, sessions, tenant, roles, authorization, and first-owner setup. Never create a shadow authority.
6. Never change auth backend, database schema/data, migration, cookie policy, CORS/trusted origins, DNS, reverse proxy, TLS, secrets, production configuration, or deployment under an ID UI plan.
7. Never claim SSO, MFA, passkeys, email verification, password recovery, social login, universal session revocation, or destination availability without source and end-to-end evidence.
8. Do not invent API fields, SDK methods, routes, environment variables, domain names, statuses, or design tokens. Inspect exports and actual implementation first.
9. Use `@allah/sdk`, `@moonwitness/types`, `@moonwitness/ui`, and the shared skin engine. No local primitive library, duplicate tokens, parallel auth client, or shadow design system.
10. Do not expose credentials, tokens, session identifiers, secrets, internal tenant IDs, or raw provider diagnostics in URLs, logs, analytics, or user-facing errors.
11. Default deny. Never trust browser-supplied tenant, role, permission, user, subscriber, or resource ownership.
12. Every async operation needs explicit pending, success, failure, unavailable, and retry behavior as applicable. Success is shown only after the authoritative operation succeeds.
13. No fake metrics, fake live status, random astronomy, fake security seals, placeholder buttons, dead links, empty shells, or decorative data that looks factual.
14. Anti-slop: no generic SaaS hero, repeated centered-card layout, equal-card dashboard grid, random gradient/glass treatment, arbitrary icon salad, excessive micro-labels, filler copy, or motion without semantic purpose.
15. Preserve the LUNAR CHRONICLES DNA: personal observatory, lunar instrument precision, cartographic geometry, editorial archive, quiet wonder, and readable functional hierarchy.
16. Accessibility is mandatory: semantic HTML, visible focus, keyboard operation, associated errors, contrast, reduced motion, and responsive behavior.
17. Prefer the smallest complete implementation. Avoid new dependencies unless existing workspace/platform APIs cannot satisfy a documented requirement.
18. Add or update tests for behavior changed. Do not weaken, delete, or skip existing tests to make a gate pass.
19. Run actual relevant commands and report exact results. Never mark a task complete because code was merely written.
20. Update task checkboxes and report.md with evidence after each coherent batch. Keep status proposed/in_progress until all acceptance criteria pass.
21. Commit coherent completed batches to `dev` with descriptive messages. Never force-push, rewrite history, or silently overwrite another actor's work. If the remote head changes, rebase/reconcile safely or stop and report.
22. If a task hits a missing server contract, security contradiction, irreversible operation, production boundary, or unavailable permission, do not guess or bypass it. Record a precise blocker and continue independent tasks.
23. Do not request user confirmation for ordinary implementation decisions, test fixes, copy refinements, or reversible UI changes. Escalate only the explicit hard boundaries in rule 22.


## Plan-specific boundary
Inspect and use @moonwitness/ui, SkinRoot, existing design tokens, and current app styling. Define only app-level composition and component usage. Shared primitives/tokens are changed only when a concrete shared defect is proven and a separate shared-scope change is justified.

## Dependency rule
Do not start implementation tasks until all listed dependencies have evidence-backed completion. Read their reports; a folder existing is not proof that a dependency is complete.
