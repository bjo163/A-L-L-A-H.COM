'use client';

import { Button, LinkButton, StatePanel } from '@moonwitness/ui';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('WORLD OBSERVATORY error boundary:', error);
  }, [error]);

  return (
    <StatePanel
      kind="error"
      cause={
        error.digest
          ? `The observatory view stopped rendering. Support reference: ${error.digest}.`
          : 'The observatory view stopped rendering.'
      }
      nextAction="Retry the view. If it keeps failing, return to the observatory home."
      action={
        <>
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <LinkButton href="/">Back to observatory home</LinkButton>
        </>
      }
    />
  );
}
