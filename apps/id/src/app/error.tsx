'use client';

import { Button, LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('MOONWITNESS ID error boundary:', error);
  }, [error]);

  return (
    <RouteShell as="main">
      <StatePanel
        kind="error"
        cause={
          error.digest
            ? `The identity view stopped rendering. Support reference: ${error.digest}.`
            : 'The identity view stopped rendering.'
        }
        nextAction="Retry the view. Your session is unchanged; sign in again if the identity service is unreachable."
        action={
          <>
            <Button variant="outline" onClick={reset}>
              Try again
            </Button>
            <LinkButton href="/login">Sign in</LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
