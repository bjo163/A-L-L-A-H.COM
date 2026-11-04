import { LinkButton, RouteShell, StatePanel } from '@moonwitness/ui';

export default function NotFound() {
  return (
    <RouteShell as="main" className="gate-shell">
      <StatePanel
        kind="error"
        role="status"
        label="Tidak ditemukan"
        title="Halaman tidak ditemukan"
        cause="Tidak ada halaman Gate yang terdaftar pada alamat ini. Halamannya mungkin belum pernah ada atau sudah pindah."
        nextAction="Kembali ke gerbang, atau buka peta alam semesta untuk mencari destinasi yang aktif."
        action={
          <>
            <LinkButton href="/">Kembali ke gerbang</LinkButton>
            <LinkButton href="/universe" variant="outline">
              Buka peta alam semesta
            </LinkButton>
          </>
        }
      />
    </RouteShell>
  );
}
