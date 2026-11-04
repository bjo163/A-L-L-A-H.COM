'use client';

import { Button, LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('HEADQUARTER error boundary:', error);
  }, [error]);

  return (
    <RouteShell as="main">
      <StatePanel
        kind="error"
        cause={
          error.digest
            ? `This control module stopped rendering. Support reference: ${error.digest}.`
            : 'This control module stopped rendering.'
        }
        nextAction="Retry the module. If it keeps failing, fall back to the overview."
        action={
          <>
            <Button variant="outline" onClick={reset}>
              Try again
            </Button>
            <LinkButton href="/">Back to overview</LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
