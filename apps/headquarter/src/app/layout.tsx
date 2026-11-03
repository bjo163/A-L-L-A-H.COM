import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SkinRoot } from "@moonwitness/ui";
import { HeadquarterShell } from "../components/headquarter-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moonwitness HQ | Command Center",
  description: "Headquarters command center for the A-L-L-A-H.COM MoonWitness platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkinRoot skin="nexus-paradox">
          <HeadquarterShell>{children}</HeadquarterShell>
        </SkinRoot>
      </body>
    </html>
  );
}