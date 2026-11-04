import { LinkButton, StatePanel } from '@moonwitness/ui';

export default function NotFound() {
  return (
    <StatePanel
      kind="error"
      role="status"
      title="Page not found"
      cause="No observatory route is registered at this address."
      nextAction="Return to the observatory home and choose a desk from there."
      action={<LinkButton href="/">Back to observatory home</LinkButton>}
    />
  );
}
