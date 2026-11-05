# Rules for Local Coding Agents

## Repository discipline
1. Work only on existing dev branch; do not create branches.
2. Read root/extension README, package manifest, source and related plans before editing.
3. Inspect git status; never overwrite unrelated user changes.
4. Never rewrite history, force-push or merge to main.
5. Do not commit unrelated changes.
6. Preserve package manager, ESM and repository conventions.

## Anti-duplication
1. Search existing services/types/commands/providers/views before adding.
2. Reuse correct existing implementation.
3. Trace callers, tests and runtime registrations before consolidation.
4. Do not delete legacy code before reference, migration and rollback audit.
5. Record prior implementation disposition for every architecture decision.

## Execution
1. Respect task dependencies.
2. One task = one reviewable outcome.
3. State intended files and acceptance criteria before editing.
4. Make the smallest coherent change and add/update tests.
5. Run focused tests, then regression gates.
6. Record exact commands, exit codes and concise outputs.
7. If blocked, record blocker and stop dependent tasks.
8. Never fabricate results or mark untested behavior PASS.

## Safety
Respect Workspace Trust. Never read/send secrets or excluded files to a model. Never store credentials in source/settings/logs/reports. Never run arbitrary model-generated shell. Keep writes within approved workspace and reviewable. Destructive, network, Git push, release and deploy actions require explicit approval. No silent fallback/upload/remote execution. Propagate cancellation.

## Documentation integrity
Keep README/blueprint/changelog aligned with verified behavior. Inspect neighboring plan formats. Checkboxes change only after evidence. Separate automated, extension-host, manual and untested evidence. Never claim ready/secure/offline/standalone without acceptance tests.

## Completion report
Include summary, files changed, tests, results, limitations, follow-ups and commit SHA.