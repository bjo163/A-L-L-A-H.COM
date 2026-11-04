import { LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';

export default function NotFound() {
  return (
    <RouteShell as="main">
      <StatePanel
        kind="error"
        role="status"
        title="Page not found"
        cause="No Gate page is registered at this address. It may never have existed, or it has moved."
        nextAction="Return to the entrance, or browse the universe map for a live destination."
        action={
          <>
            <LinkButton href="/">Back to entrance</LinkButton>
            <LinkButton href="/universe" variant="outline">
              Open the universe map
            </LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
