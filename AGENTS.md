# AGENTS.md
## Universal Engineering Rules

All agents must follow GOAL.md and AUTONOMOUS.md. Read app-level AGENTS.md before changing that app.

## Product and legacy integrity
- A-L-L-A-H.COM is the unified home and continuation of the MoonWitness journey and Empire of the Light ecosystem.
- Preserve MoonWitness Reborn, MoonWitness XV, and earlier-generation provenance.
- Follow LEGACY_RECONCILIATION.md before migration, rewrite, archive, or retirement.
- Do not force every product into one application.
- Do not recreate existing functionality before checking whether it can be reused.
- Distinguish verified facts, implementation, plans, creative narrative, interpretation, and hypotheses.

## Engineering
- Inspect actual source, manifests, framework versions, tests, and runtime behavior.
- Follow local framework documentation and app-level AGENTS.md.
- Prefer focused, testable changes and root-cause fixes.
- Avoid unnecessary dependencies, duplicate abstractions, dead code, and fake integrations.
- Validate inputs and enforce authorization at trust boundaries.
- Protect tenant/user data and use least privilege.
- Never expose secrets in source, logs, examples, or commits.

## Documentation
- BACKLOG.md is the single actionable task list.
- ROADMAP.md is strategic and must not duplicate task-level detail.
- DECISIONS.md records accepted decisions only.
- CHANGELOG.md records actual changes only.
- Update affected docs and record evidence; never fabricate verification.

## Git safety
- Inspect git status before and after changes.
- Preserve unrelated work; do not create unnecessary branches.
- Never force-push or rewrite shared history.
- Review the exact staged diff; never blindly stage the whole repository.
- Never commit secrets, local environment files, local databases, or generated output.
- Production deployment, destructive data changes, DNS/billing changes, and archive deletion require explicit authorization.

## Definition of Done
Acceptance criteria met; applicable checks executed; diff reviewed; relevant documentation/backlog updated; evidence recorded. VERIFIED requires evidence.
