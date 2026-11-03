---
contract: "SPEC_DRIVEN_PLAN"
id: "PLAN-20261103-213240"
title: "VS Code Extension Integrated Workbench"
status: "completed"
author: "developer"
---

# VS Code Extension Integrated Workbench

## Context

The extension already exposes plan, model, and Arsy views, but its plan status model is boolean, task actions toggle implicitly, plan generation creates only two of the four repository-required artifacts, and workspace operations silently target the first root. Gateway model parsing assumes the wrong response envelope, and mock completions can be presented as successful AI output.

## Goal

Make the native VS Code workbench a reliable interface for `.plans` lifecycle and Arsy-backed planning. Preserve the existing extension identity and uncommitted changes while making file operations, gateway state, and errors explicit.

## Scope

- Parse and update pending, in-progress, and completed task checkboxes without changing unrelated bytes.
- Create local and AI plans with `spec.md`, `task.md`, `design.md`, and `rules.md`.
- Add separate start, complete, and reset commands; plan and task selection opens the corresponding file.
- Support all workspace roots, file watchers, and actionable empty/error states.
- Parse the actual Arsy model envelope, label its static catalog honestly, and reject mock or invalid AI completions.
- Align plan documentation requirements and the contract checker so estimates are not required.
- Add focused tests and verify the extension and documentation contract.

## Out of scope

- Custom webviews, new visual assets, storage browsing, remote workspace management, and AI-driven source-code edits.
- Server API changes unless verification proves the existing completion response cannot identify mock output reliably.
- Version bump, commit, or push.

## Acceptance criteria

- [x] Pending (`[ ]`), in-progress (`[/]`), and completed (`[x]` or `[X]`) tasks parse into distinct states.
- [x] Explicit status commands are idempotent, reject stale line snapshots, preserve each line ending, and report read/write failures.
- [x] Local and AI plan creation writes all four required files and removes a partially created directory on failure.
- [x] Plan and task clicks open the right Markdown document and line; status changes are available as separate context commands.
- [x] Multi-root workspaces can target any root, and edits under `.plans` refresh the tree without a window reload.
- [x] Empty workspaces, loading service checks, missing files, and read/network errors have distinct, understandable states.
- [x] The model client parses `{ success, data: { object, data } }` and validates catalog entries.
- [x] AI generation rejects the `[Arsy LLM Gateway Mock]` marker, HTTP failures, malformed JSON, and incomplete artifacts without writing files or reporting success.
- [x] `pnpm extension:test`, extension typecheck/build, and `pnpm docs:check` pass.
- [x] VSIX packaging and an available extension-host smoke check complete without introducing new dependencies.
