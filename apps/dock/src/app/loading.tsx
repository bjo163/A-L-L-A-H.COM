import { RouteShell, StatePanel } from '@moonwitness/ui';

export default function Loading() {
  return (
    <RouteShell as="main">
      <StatePanel kind="loading" cause="Preparing the dock entry view." />
    </RouteShell>
  );
}
