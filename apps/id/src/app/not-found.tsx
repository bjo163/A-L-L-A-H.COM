import { LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';

export default function NotFound() {
  return (
    <RouteShell as="main">
      <StatePanel
        kind="error"
        role="status"
        title="Page not found"
        cause="No identity route is registered at this address."
        nextAction="Return to the identity home and choose account, sessions, or security from there."
        action={<LinkButton href="/">Back to identity home</LinkButton>}
      />
    </RouteShell>
  );
}
