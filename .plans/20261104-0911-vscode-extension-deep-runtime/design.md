# Design

## Runtime cockpit

The extension remains host-native. Connection, model, session, approval, mission, and error states should be visible in the existing status bar, tree views, and webviews instead of introducing a disconnected dashboard.

## State hierarchy

1. Active session or mission.
2. Pending approval or blocked safety state.
3. Gateway and model availability.
4. Historical and diagnostic details.

## Error behavior

Runtime failures must identify the operation and provide a retry or configuration action. Missing activation registration must never be presented as an ordinary gateway error.
