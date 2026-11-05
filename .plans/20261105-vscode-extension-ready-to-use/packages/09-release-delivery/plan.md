# Release and Distribution

Priority: P0 · Status: pending

## Objective
Produce a verified, understandable and installable 0.4.0 release with reproducible evidence.

## Execution tasks
- [ ] 09RELEASEDELIVERY-01: Run extension build, typecheck, lint and focused unit/integration tests.
- [ ] 09RELEASEDELIVERY-02: Run extension-host tests on supported VS Code versions.
- [ ] 09RELEASEDELIVERY-03: Run standalone/security checks; resolve blockers or document accepted limitations.
- [ ] 09RELEASEDELIVERY-04: Inspect VSIX manifest, runtime bundle, dependencies, licenses and included files.
- [ ] 09RELEASEDELIVERY-05: Install VSIX in clean profile and complete documented user journey.
- [ ] 09RELEASEDELIVERY-06: Update README, setup, provider, troubleshooting and security documentation.
- [ ] 09RELEASEDELIVERY-07: Update changelog/version only after release acceptance passes.
- [ ] 09RELEASEDELIVERY-08: Publish release report with artifact checksum, test matrix and known limitations.

## Dependencies
All P0 phases 00–05.

## Acceptance
Every task has implementation references, focused tests, exit codes, evidence and report update. Reuse current contracts and services. No duplicate provider/mission/policy implementation. Preserve user data and workspace security. Mark blocked work explicitly; never fabricate PASS.

## Verification record
- Commands:
- Results/exit codes:
- Extension-host/manual evidence:
- Limitations:
- Follow-ups:
- Commit:
