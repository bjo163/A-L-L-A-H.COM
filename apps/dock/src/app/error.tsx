'use client';

import { Button, LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('DOCK error boundary:', error);
  }, [error]);

  return (
    <RouteShell as="main">
      <StatePanel
        kind="error"
        cause={
          error.digest
            ? `The dock view stopped rendering. Support reference: ${error.digest}.`
            : 'The dock view stopped rendering.'
        }
        nextAction="Try the view again. If it keeps failing, return to the entry page."
        action={
          <>
            <Button variant="outline" onClick={reset}>
              Try again
            </Button>
            <LinkButton href="/">Back to entry</LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
