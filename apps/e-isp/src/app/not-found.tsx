import { LinkButton, StatePanel } from '@moonwitness/ui';

export default function NotFound() {
  return (
    <StatePanel
      as="h3"
      kind="error"
      title="Halaman tidak ditemukan"
      cause="Alamat yang kamu tuju tidak ada di situs E-ISP."
      nextAction="Kembali ke beranda untuk melihat paket dan jangkauan."
      action={<LinkButton href="/">Ke beranda</LinkButton>}
    />
  );
}
