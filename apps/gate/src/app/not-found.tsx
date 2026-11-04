import { LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';
import { catalogCopy } from '@/lib/translation-catalog';

export default function NotFound() {
  const t = catalogCopy();

  return (
    <RouteShell as="main" className="gate-shell">
      <StatePanel
        kind="error"
        role="status"
        label={t('states.notFoundLabel')}
        title={t('states.notFoundTitle')}
        cause={t('states.notFoundCause')}
        nextAction={t('states.notFoundNext')}
        action={
          <>
            <LinkButton href="/">{t('states.backToGate')}</LinkButton>
            <LinkButton href="/universe" variant="outline">
              {t('states.openUniverse')}
            </LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
