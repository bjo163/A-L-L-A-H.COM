import { RouteShell, StatePanel } from '@moonwitness/ui';

export default function Loading() {
  return (
    <RouteShell>
      <StatePanel kind="loading" cause="Reading the module state from the hub." />
    </RouteShell>
  );
}
