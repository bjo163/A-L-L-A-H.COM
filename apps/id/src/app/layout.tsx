import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoonWitness ID — Unified Authentication & SSO',
  description: 'Enterprise Identity, Account & Session Center for MoonWitness & Empire of the Light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
