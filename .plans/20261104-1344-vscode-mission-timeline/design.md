# Design

## Design Read

Reading this as a developer mission cockpit for workspace owners, using VS Code-native controls and theme tokens. Dial: ENERGY 2 / RHYTHM 2 / MOTION 1.

## Hierarchy

1. Active mission status and next action.
2. Pending edit or validation approval.
3. Chronological event evidence.
4. Local session history.

## Interaction

- Timeline entries are real state transitions, not decorative cards.
- The repair action appears only after a failed validation and is limited to one proposal per failure signature.
- Repair returns to the existing workspace-context consent and edit-review flow.
- Restored sessions are visibly paused or blocked. Nothing resumes automatically.

## Visual decisions

- VS Code theme tokens provide contrast and theme compatibility.
- One chronological list fits the work better than a dashboard grid.
- Status is written as text, not color alone.
- Motion is limited to native interaction feedback.
