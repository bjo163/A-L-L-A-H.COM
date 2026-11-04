'use client';

import { Button, LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('GATE error boundary:', error);
  }, [error]);

  return (
    <RouteShell as="main" className="gate-shell">
      <StatePanel
        kind="error"
        label="Masalah"
        title="Halaman ini tidak dapat ditampilkan"
        cause={
          error.digest
            ? `Tampilan berhenti dimuat. Referensi dukungan: ${error.digest}.`
            : 'Tampilan berhenti dimuat.'
        }
        nextAction="Muat ulang halaman ini. Jika terus gagal, kembali ke gerbang."
        action={
          <>
            <Button variant="outline" onClick={reset}>
              Coba lagi
            </Button>
            <LinkButton href="/">Kembali ke gerbang</LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
