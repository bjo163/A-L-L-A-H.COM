import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SkipLink, SkinRoot, buildAppIcons, skinRegistry } from "@moonwitness/ui";
import { HeadquarterShell } from "../components/headquarter-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moonwitness HQ | Command Center",
  description: "Headquarters command center for the A-L-L-A-H.COM MoonWitness platform",
  icons: buildAppIcons("nexus-paradox"),
  openGraph: {
    images: [{ url: skinRegistry["nexus-paradox"].identity.hero, width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: skinRegistry["nexus-paradox"].identity.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkinRoot skin="nexus-paradox">
          <SkipLink />
          <HeadquarterShell>{children}</HeadquarterShell>
        </SkinRoot>
      </body>
    </html>
  );
}