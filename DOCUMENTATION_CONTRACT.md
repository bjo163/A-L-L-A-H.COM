---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DOCUMENTATION_CONTRACT"
version: "1.0.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-03"
---
# Documentation Contract

This contract applies to every Markdown file maintained by this repository. Read it with the root [AGENTS.md](AGENTS.md) before creating, editing, or reviewing project documentation.

## Documentation roles

Keep one canonical source for each kind of information. Link to it instead of copying the same rules or status into multiple files.

| Document | Owns |
|---|---|
| `README.md` | Repository entry point, current capabilities, setup, and deployment overview |
| `AUTONOMOUS.md` | Agent execution process, required checks, documentation updates, and Git workflow |
| `AGENTS.md` | Always-on engineering instructions and links to deeper contracts |
| `GOAL.md` | Mission and high-level execution directive |
| `DOCUMENTATION_CONTRACT.md` | Rules for creating and maintaining Markdown documentation |
| `BLUEPRINT.md` | Target architecture, boundaries, and integration contracts |
| `DESIGN.md` | Product experience, design principles, and interaction standards |
| `BACKLOG.md` | Actionable tasks, priorities, statuses, and verification evidence |
| `ROADMAP.md` | Strategic stages only; task-level detail belongs in the backlog |
| `CHANGELOG.md` | Changes that have actually happened, not plans |
| `DECISIONS.md` | Accepted decisions, rationale, and consequences |
| `QUALITY.md` | Definition of done and quality evidence |
| `LEGACY_RECONCILIATION.md` | Source inventory, preservation, provenance, and disposition |
| `apps/*/README.md` | Application-specific purpose, verified commands, and links to detailed guidance |
| `apps/*/AGENTS.md` | Application-specific instructions that extend the root guidance |
| `apps/server/.claude/skills/loco/` | Loco framework reference and task recipes |

When sources disagree, use source code, manifests, tests, and observed workflow/runtime behavior for current implementation; use `DECISIONS.md` for accepted product decisions; use `BACKLOG.md` for task state. This contract defines documentation rules, not product behavior.

## Required writing and structure

- Write primarily in English, matching the existing engineering documentation. Use another language when the intended audience or a localized product requires it.
- Give each document one descriptive top-level heading. Use heading levels in order, and keep section names specific to the document's purpose.
- State scope near the top when the title does not make it clear. Keep documents focused; split only when a distinct owner or audience needs a separate source.
- Prefer short paragraphs, concrete terms, and lists or tables when they improve scanning. Avoid filler, unsupported claims, and repeated policy text.
- Use repository-relative links for files and directories. Use descriptive link text, verify the target exists, and avoid machine-specific absolute paths.
- Format commands, paths, identifiers, statuses, and environment variable names as code. Include only commands that are defined by the current manifests or workflows.
- Mark proposed, implemented, verified, released, and deployed states distinctly. Do not describe a plan or a failed check as a completed capability.
- Cite the relevant source, workflow run, test, or decision when a claim or status depends on evidence. Record failures and environmental limits instead of implying a pass.
- Do not include secrets, private URLs, credentials, personal data, or copied content without permission.

## Keeping documents in sync

Update documentation when a change affects its subject, not merely because the file exists.

| Change | Update |
|---|---|
| User-visible capability, setup, or deployment behavior | `README.md`, `CHANGELOG.md`, and any affected app README |
| Architecture, ownership, or integration contract | `BLUEPRINT.md`; record accepted changes in `DECISIONS.md` |
| Product interaction or visual system | `DESIGN.md` |
| Task scope, priority, status, or evidence | `BACKLOG.md`; update `ROADMAP.md` only when strategic stages change |
| Verification criteria or quality process | `QUALITY.md` and, when agent execution changes, `AUTONOMOUS.md` or `AGENTS.md` |
| Source preservation, provenance, or disposition | `LEGACY_RECONCILIATION.md` |
| Documentation conventions | This contract and the root agent guidance |

Do not duplicate task lists, implementation inventories, or full procedures across documents. Put the canonical detail in its owner document and link to it from summaries.

## Document lifecycle

1. Before editing, identify the owning document and inspect its linked source of truth.
2. Make the smallest documentation change that fully reflects verified behavior or an accepted decision.
3. Check that internal links, commands, names, statuses, and branch/workflow references still match the repository.
4. Review the rendered Markdown structure and run `git diff --check`.
5. Update the changelog only for actual repository changes. Record verification in the backlog when a tracked task is affected.

## Generated and imported documentation

Framework-generated files and the Loco reference under `apps/server/.claude/skills/loco/` may follow their upstream format. Do not reformat or rewrite generated API indexes, framework-owned instructions, or imported reference material just to match this contract. Preserve their provenance, avoid local claims that conflict with them, and edit generated material only through its source or generator when practical.
