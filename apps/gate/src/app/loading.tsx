import { RouteShell, StatePanel } from '@moonwitness/ui';

export default function Loading() {
  return (
    <RouteShell as="main">
      <StatePanel kind="loading" cause="Opening this page of the Gate." />
    </RouteShell>
  );
}
