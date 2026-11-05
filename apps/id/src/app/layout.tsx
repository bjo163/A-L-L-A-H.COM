import type { Metadata, Viewport } from 'next';
import { EcosystemNavbar, SkipLink, SkinRoot, buildAppIcons, skinRegistry } from '@moonwitness/ui';
import { getIdEcosystemEndpoints } from '../lib/endpoints';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoonWitness ID | Identity and sessions',
  description: 'Manage your MoonWitness identity, account details, and active sessions.',
  icons: buildAppIcons('lunar-chronicles'),
  openGraph: {
    images: [{ url: skinRegistry['lunar-chronicles'].identity.hero, width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: skinRegistry['lunar-chronicles'].identity.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SkinRoot skin="lunar-chronicles">
          <SkipLink />
          <EcosystemNavbar apps={getIdEcosystemEndpoints()} currentApp="id" showAuthActions={false} />
          {children}
        </SkinRoot>
      </body>
    </html>
  );
}
