---
title: "Design: Odoo-Style Project Manager Addon"
plan: "20261105-1000-odoo-project-manager-addon"
---

# Design Specification

## User experience
- **VS Code Developer Flow**: The developer opens the Plans view in the Activity Bar. A single click on the sync cloud icon runs `allah.syncPlansToHub`, which extracts all tasks from `.plans/*/task.md`, pushes them to Arsy Hub, and reflects any remote changes locally.
- **Hub UI Flow**: Tenant managers view project progress, assign users to tasks, and reorder stages in Kanban mode without direct filesystem access.

## Technical approach
- **Decoupled Architecture**: Hub runs inside Docker without local filesystem mounts. The VS Code extension acts as an authenticated edge runner pushing scanned JSON payloads to `POST /v1/projects/:id/sync`.
- **Scheduled Poller (`ir.cron`)**: Fastify onReady event loop timer executes background tasks without external system cron dependencies.
