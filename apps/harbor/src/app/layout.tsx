import "./globals.css";
import { EcosystemNavbar, resolveEcosystemEndpoints, RouteShell, SkipLink, SkinRoot, buildAppIcons, skinRegistry } from '@moonwitness/ui';
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "HARBOR | E-ISP Customer Portal",
  description: "Manage your E-ISP internet service, plans, billing and support from one place",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SkinRoot skin="rocksoul">
          <SkipLink />
          <EcosystemNavbar
            apps={resolveEcosystemEndpoints(process.env)}
            currentApp="harbor"
          />
          <RouteShell as="main" className="harbor-shell">
            {children}
          </RouteShell>
        </SkinRoot>
      </body>
    </html>
  );
}