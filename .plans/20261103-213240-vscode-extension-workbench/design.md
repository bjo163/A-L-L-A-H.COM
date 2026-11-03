---
title: "Design: Native VS Code Plan Workbench"
plan: "20261103-213240-vscode-extension-workbench"
---

# Design Specification

## Design read

Reading this as a VS Code-native developer workflow for tracking `.plans`, with file state and the next actionable task as the primary hierarchy.

**Dials:** ENERGY 1 / RHYTHM 2 / MOTION 1.

## Interaction model

- Keep the existing VS Code tree views and host theme; do not add a webview or custom palette.
- Selecting a plan opens its `spec.md`. Selecting a task opens `task.md` at that task's line.
- Put start, complete, and reset actions in the task context menu as separate commands. Do not overload the row click as a toggle.
- In multi-root workspaces, ask the user to choose a root only when more than one is open.
- Refresh the tree from workspace file events, with a short debounce to coalesce editor saves.

## State and accessibility

- Show readable text for pending, in-progress, and completed states; icons supplement labels and never carry status alone.
- Use the native tree welcome content for no workspace/no plans and explicit tree rows for read, write, and gateway errors.
- Keep actions keyboard-accessible through VS Code commands and context menus; label commands with the action they perform.
- Service views distinguish loading, healthy, not-ready, and unreachable states. Model views distinguish an empty catalog from a failed request.

## Content and gateway contracts

- A local plan is an honest scaffold with specific prompts, not fabricated requirements.
- AI output supplies four Markdown bodies. The extension adds canonical plan metadata and headings.
- Static gateway model entries are labeled as catalog entries, not as evidence of configured upstream providers.
- Mock gateway output or malformed AI content produces a visible error and no plan directory.

## Decision rationale

- Reusing VS Code trees keeps keyboard and theme behavior native and avoids a second design system.
- The activity-bar `hubot` glyph identifies the gateway and model workflow; view icons use native codicons that match their plan, API, and model content.
- Separate commands make each task transition explicit and avoid destructive toggle ambiguity.
- Visible text states remain understandable with themes, screen readers, and color-vision differences.
- No added motion, decorative assets, custom colors, or visual effects are needed for a file-management workflow.
