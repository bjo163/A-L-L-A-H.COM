---
title: "IR Translation Phase 4: Design Specification"
status: "proposed"
timestamp: "2026-11-04T04:50:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 32
parent_issue: 29
---

# DESIGN: IR Translation Phase 4 — Frontend Visual Graph & IDE Workbench Canvas

## 1. Visual Canvas Layout & Node Hierarchy
The Visual Graph displays interactive workflows, cognitive agent reasoning traces, and data topologies using `@moonwitness/ui` atomic elements.

```mermaid
flowchart LR
    subgraph CanvasArea["Interactive Graph Canvas (/workflows)"]
        Node1["Node: Intake (#98a)"] -->|Success| Node2["Node: Validate Policy (#98b)"]
        Node2 -->|Condition: Approved| Node3["Node: Provision RADIUS (#98c)"]
        Node2 -->|Condition: Rejected| Node4["Node: Alert Dispatch (#98d)"]
    end

    subgraph InspectorPanel["Inspector Drawer (Right-Hand Dock)"]
        NodeTitle["Node: Provision RADIUS"]
        KindBadge["Kind: Action"]
        AttrsView["Attributes: { nasId: 4, profile: '100M' }"]
        TelemetryTrace["Execution Time: 42ms"]
    end

    Node3 -.->|Select Node| InspectorPanel
```

## 2. Graph Node Status Visual Design
- **Pending**: Slate/Muted border with subtle pulse.
- **Executing**: Cyan/Teal continuous flowing border with active particle edge animation.
- **Completed**: Emerald/Green solid border with check icon badge.
- **Failed**: Rose/Red highlighted border with error diagnostic tooltip.

## 3. Interaction Mechanics
- Wheel/Pinch to Zoom ($0.25\times$ to $2.0\times$).
- Drag background to pan viewport.
- Click node to open inspection drawer.
- Double-click node to focus and fit to viewport.

