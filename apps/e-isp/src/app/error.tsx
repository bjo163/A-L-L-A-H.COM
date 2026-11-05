'use client';

import { Button, StatePanel } from '@moonwitness/ui';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <StatePanel
      as="h3"
      kind="error"
      title="Terjadi kesalahan"
      cause={error.message}
      nextAction="Coba lagi, atau kembali ke beranda."
      action={<Button variant="outline" onClick={reset}>Coba lagi</Button>}
    />
  );
}
