import "./globals.css";
import { EcosystemNavbar, resolveEcosystemEndpoints, RouteShell, SkipLink, SkinRoot, buildAppIcons, skinRegistry } from '@moonwitness/ui';
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "MOONSKY Console",
  description: "MOONSKY communication console - operator workspace for messaging channels",
  icons: buildAppIcons("riot-anarchy"),  // Riot Anarchy skin for MOONSKY
  openGraph: {
    images: [{ url: skinRegistry["riot-anarchy"].identity.hero, width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: skinRegistry["riot-anarchy"].identity.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SkinRoot skin="riot-anarchy">
          <SkipLink />
          <EcosystemNavbar
            apps={resolveEcosystemEndpoints(process.env)}
            currentApp="moonsky"
          />
          <RouteShell as="main" className="moonsky-shell">
            {children}
          </RouteShell>
        </SkinRoot>
      </body>
    </html>
  );
}