'use client';

import { Button, LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';
import { useEffect } from 'react';
import { catalogCopy } from '@/lib/translation-catalog';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('GATE error boundary:', error);
  }, [error]);

  // Copy comes from the same bilingual catalog as the rest of gate; the locale
  // follows <html lang>. Switch the argument when localized segments land.
  const t = catalogCopy();

  return (
    <RouteShell as="main" className="gate-shell">
      <StatePanel
        kind="error"
        label={t('states.errorLabel')}
        title={t('states.errorTitle')}
        cause={
          error.digest
            ? `${t('states.errorCauseRef')} ${error.digest}.`
            : t('states.errorCause')
        }
        nextAction={t('states.errorNext')}
        action={
          <>
            <Button variant="outline" onClick={reset}>
              {t('states.errorRetry')}
            </Button>
            <LinkButton href="/">{t('states.backToGate')}</LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
