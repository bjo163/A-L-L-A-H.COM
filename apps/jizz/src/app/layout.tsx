import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JizzNavbar } from '@/components/navbar';
import { RouteShell, SkipLink, SkinRoot } from '@moonwitness/ui';
import type { ReactNode } from 'react';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WORLD OBSERVATORY | The World, From Every Angle",
  description: "Source-grounded global multi-perspective intelligence observatory powered by ROCKSOUL JIZZ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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