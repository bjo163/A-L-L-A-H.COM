---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DOCUMENTATION_CONTRACT"
version: "1.2.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-04"
---
# Documentation Contract

One canonical source per topic. Link — never copy rules across files. Read with [AGENTS.md](AGENTS.md).

## Document Ownership

| Document | Owns |
|---|---|
| `README.md` | Entry point · capabilities · setup · deployment |
| `AGENTS.md` | Always-on engineering rules · monorepo map · invariants · quality gates · plans standard |
| `AUTONOMOUS.md` | Execution loop · security audit steps · git workflow |
| `GOAL.md` | Mission · /goal directive |
| `DOCUMENTATION_CONTRACT.md` | These rules |
| `BLUEPRINT.md` | Target architecture · layer stack · swarm endpoints · delivery |
| `DESIGN.md` | Product experience · Moon UI doctrine · DNA app assignments · interaction |
| `BACKLOG.md` | Tasks · priorities · statuses · evidence |
| `ROADMAP.md` | Strategic stages only |
| `CHANGELOG.md` | Changes that actually happened |
| `DECISIONS.md` | Accepted ADRs · rationale · consequences |
| `QUALITY.md` | Definition of done · verification baseline |
| `LEGACY_RECONCILIATION.md` | Source inventory · provenance · disposition |
| `apps/*/README.md` | App-specific purpose + verified commands |
| `apps/*/AGENTS.md` | App-specific rules extending root |

Source-of-truth priority: `source code + manifests + tests + runtime > DECISIONS.md > BACKLOG.md > this contract`

## Writing Rules

- One `#` heading per document.
- Tables + lists over prose. No filler, unsupported claims, or repeated policy text.
- No time/budget estimates unless requested and evidence-backed.
- Repo-relative links only. Verify target exists.
- Format: commands · paths · identifiers · statuses → `` `code` ``.
- States: `proposed` · `in_progress` · `implemented` · `verified` · `released` · `deployed` — mark distinctly.
- Cite source/test/decision when claim depends on evidence. Record failures; never imply skipped check passed.
- No secrets, private URLs, credentials, or personal data.

## Change Matrix

| Changed | Update |
|---|---|
| Capability / setup / deployment | `README.md` + `CHANGELOG.md` + affected app README |
| Architecture / ownership / integration | `BLUEPRINT.md` + `DECISIONS.md` |
| Product experience / visual system | `DESIGN.md` |
| Task / status / evidence | `BACKLOG.md`; `ROADMAP.md` only when strategic stages change |
| Quality criteria / agent execution | `QUALITY.md` + `AUTONOMOUS.md` or `AGENTS.md` |
| Provenance / legacy | `LEGACY_RECONCILIATION.md` |
| Documentation rules | This file + root agent guidance |

## Lifecycle

1. Identify owner doc and inspect linked source of truth.
2. Smallest change that fully reflects verified behavior or accepted decision.
3. Check links · commands · names · statuses · branch refs still match repo.
4. Review rendered Markdown. Run `git diff --check`.
5. Changelog: actual changes only. Backlog: update when tracked task affected.

## Generated Docs

Framework-generated files + Arsy Hub reference (`apps/arsy/`) follow upstream format. Do not reformat. Edit only through source or generator.
