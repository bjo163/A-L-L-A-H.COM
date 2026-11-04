'use client';

import { Button } from "@moonwitness/ui";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="gate-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-2xl font-semibold" style={{ fontFamily: 'var(--mw-font-display)' }}>
        Terjadi Kesalahan
      </h1>
      <p className="mb-6 max-w-md text-muted" style={{ fontFamily: 'var(--mw-font-body)' }}>
        Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.
      </p>
      <Button onClick={reset} variant="gold">
        Coba Lagi
      </Button>
    </div>
  );
}
