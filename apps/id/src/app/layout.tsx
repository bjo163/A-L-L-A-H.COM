import type { Metadata } from 'next';
import { EcosystemNavbar, SkipLink, SkinRoot, resolveEcosystemEndpoints } from '@moonwitness/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoonWitness ID | Unified Authentication & SSO',
  description: 'Enterprise Identity, Account & Session Center for MoonWitness & Empire of the Light',
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
          <EcosystemNavbar apps={resolveEcosystemEndpoints(process.env)} currentApp="id" showAuthActions={false} />
          {children}
        </SkinRoot>
      </body>
    </html>
  );
}
