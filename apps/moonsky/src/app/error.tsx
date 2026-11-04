'use client';

import { Button, StatePanel } from '@moonwitness/ui';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <StatePanel
      as="h3"
      kind="error"
      title="Something went wrong"
      cause={error.message}
      nextAction="Try again or contact support"
      action={<Button variant="outline" onClick={reset}>Try again</Button>}
    />
  );
}