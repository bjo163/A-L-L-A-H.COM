import { LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';

export default function NotFound() {
  return (
    <RouteShell as="main">
      <StatePanel
        kind="error"
        role="status"
        title="Page not found"
        cause="No dock route is registered at this address."
        nextAction="Return to the entry page and choose a destination from there."
        action={<LinkButton href="/">Back to entry</LinkButton>}
      />
    </RouteShell>
  );
}
