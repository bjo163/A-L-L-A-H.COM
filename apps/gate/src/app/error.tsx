'use client';

import { Button, LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('GATE error boundary:', error);
  }, [error]);

  return (
    <RouteShell as="main">
      <StatePanel
        kind="error"
        cause={
          error.digest
            ? `This page of the Gate stopped rendering. Support reference: ${error.digest}.`
            : 'This page of the Gate stopped rendering.'
        }
        nextAction="Try the page again. If it keeps failing, return to the entrance."
        action={
          <>
            <Button variant="outline" onClick={reset}>
              Try again
            </Button>
            <LinkButton href="/">Back to entrance</LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
