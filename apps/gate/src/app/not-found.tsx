import Link from "next/link";
import { Button } from "@moonwitness/ui";

export default function NotFound() {
  return (
    <div className="gate-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-3xl font-semibold" style={{ fontFamily: 'var(--mw-font-display)' }}>
        404
      </h1>
      <p className="mb-6 max-w-md text-muted" style={{ fontFamily: 'var(--mw-font-body)' }}>
        Halaman yang Anda cari tidak ditemukan. Mungkin halaman tersebut tidak pernah ada atau sudah dipindahkan.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="gold">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/explore">Jelajahi Semesta</Link>
        </Button>
      </div>
    </div>
  );
}
