import { RouteShell, StatePanel } from '@moonwitness/ui';

export default function Loading() {
  return (
    <RouteShell as="main" className="gate-shell">
      <StatePanel kind="loading" label="Memuat" title="Menyiapkan halaman" cause="Halaman gerbang ini sedang dimuat." />
    </RouteShell>
  );
}
