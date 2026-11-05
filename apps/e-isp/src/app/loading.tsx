import { StatePanel } from '@moonwitness/ui';

export default function Loading() {
  return (
    <StatePanel
      as="h3"
      kind="loading"
      title="Memuat E-ISP..."
      cause="Mengambil katalog paket dan jangkauan."
    />
  );
}
