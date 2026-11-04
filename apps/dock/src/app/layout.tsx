import type { Metadata, Viewport } from "next";
import { SkipLink, SkinRoot, buildAppIcons, skinRegistry } from "@moonwitness/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "A-L-L-A-H.COM | Dock",
  description: "Public discovery homepage for the A-L-L-A-H.COM MoonWitness platform",
  icons: buildAppIcons("imperium-lumen"),
  openGraph: {
    images: [{ url: skinRegistry["imperium-lumen"].identity.hero, width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: skinRegistry["imperium-lumen"].identity.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SkinRoot skin="imperium-lumen">
          <SkipLink />
          {children}
        </SkinRoot>
      </body>
    </html>
  );
}
