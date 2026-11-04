import { LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';

export default function NotFound() {
  return (
    <RouteShell>
      <StatePanel
        kind="error"
        role="status"
        title="Module not found"
        cause="No headquarter module is registered at this address."
        nextAction="Open the overview and choose a module from the rail."
        action={<LinkButton href="/">Back to overview</LinkButton>}
      />
    </RouteShell>
  );
}
