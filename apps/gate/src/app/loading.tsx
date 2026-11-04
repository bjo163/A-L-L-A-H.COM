import { RouteShell, StatePanel } from '@moonwitness/ui';
import { catalogCopy } from '@/lib/translation-catalog';

export default function Loading() {
  const t = catalogCopy();

  return (
    <RouteShell as="main" className="gate-shell">
      <StatePanel kind="loading" label={t('states.loadingLabel')} title={t('states.loadingTitle')} cause={t('states.loadingCause')} />
    </RouteShell>
  );
}
