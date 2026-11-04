import { RouteShell, StatePanel } from '@moonwitness/ui';

export default function Loading() {
  return (
    <RouteShell as="main">
      <StatePanel kind="loading" cause="Reading the account and session record." />
    </RouteShell>
  );
}
