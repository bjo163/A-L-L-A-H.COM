'use client';

import { LinkButton, StatePanel } from '@moonwitness/ui';

export default function NotFound() {
  return (
    <StatePanel
      as="h3"
      kind="error"
      title="Page not found"
      cause="The requested page could not be found"
      nextAction="Return to the portal homepage"
      action={<LinkButton href="/">Go home</LinkButton>}
    />
  );
}