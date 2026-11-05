import "./globals.css";
import { LinkButton, RouteShell, SkipLink, SkinRoot, buildAppIcons, skinRegistry } from '@moonwitness/ui';
import type { Metadata, Viewport } from "next";

const idBaseUrl = () => process.env.NEXT_PUBLIC_ID_URL ?? 'http://localhost:3003';

export const metadata: Metadata = {
  title: "E-ISP | Internet cepat & stabil untuk rumah dan bisnis",
  description: "Lihat paket internet dan cek jangkauan E-ISP di daerahmu, lalu daftar langsung.",
  icons: buildAppIcons("rocksoul"),
  openGraph: {
    images: [{ url: skinRegistry["rocksoul"].identity.hero, width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: skinRegistry["rocksoul"].identity.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SkinRoot skin="rocksoul">
          <SkipLink />
          <header className="esp-header">
            <div className="esp-brand">
              <span className="esp-brand__mark" aria-hidden="true" />
              <strong>E-ISP</strong>
            </div>
            <nav className="esp-nav" aria-label="Navigasi utama">
              <LinkButton href="/" variant="ghost">Beranda</LinkButton>
              <LinkButton href="/plans" variant="ghost">Paket</LinkButton>
              <LinkButton href="/coverage" variant="ghost">Jangkauan</LinkButton>
              <LinkButton href={`${idBaseUrl()}/login`} variant="outline" external>
                Masuk akun
              </LinkButton>
            </nav>
          </header>
          <RouteShell as="main" className="esp-shell">
            {children}
          </RouteShell>
        </SkinRoot>
      </body>
    </html>
  );
}
