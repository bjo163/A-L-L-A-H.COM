import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JizzNavbar } from '@/components/navbar';
import { RouteShell, SkipLink, SkinRoot, buildAppIcons, skinRegistry } from '@moonwitness/ui';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "WORLD OBSERVATORY | The World, From Every Angle",
  description: "Source-grounded global multi-perspective intelligence observatory powered by ROCKSOUL JIZZ",
  icons: buildAppIcons("mycelium"),
  openGraph: {
    images: [{ url: skinRegistry.mycelium.identity.hero, width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: skinRegistry.mycelium.identity.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SkinRoot skin="mycelium">
          <SkipLink />
          <JizzNavbar />
          <RouteShell as="main" className="jizz-shell">
            {children}
          </RouteShell>
        </SkinRoot>
      </body>
    </html>
  );
}