import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SkinRoot } from "@moonwitness/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A-L-L-A-H.COM | Dock",
  description: "Public discovery homepage for the A-L-L-A-H.COM MoonWitness platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SkinRoot skin="imperium-lumen">{children}</SkinRoot>
      </body>
    </html>
  );
}