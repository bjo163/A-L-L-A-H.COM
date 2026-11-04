import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SkipLink, SkinRoot } from "@moonwitness/ui";
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
  title: {
    default: "A-L-L-A-H.COM | Gate",
    template: "%s | A-L-L-A-H.COM",
  },
  description: "Public entrance to the Empire of the Light. Enter the MoonWitness universe through stories, transmissions, and knowledge.",
  metadataBase: new URL("http://localhost:3000"),
  alternates: {
    canonical: "/",
    languages: {
      id: "/id",
      en: "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "A-L-L-A-H.COM",
    title: "A-L-L-A-H.COM | Gate",
    description: "Public entrance to the Empire of the Light.",
    images: [
      {
        url: "/artwork/imperium-lumen.png",
        width: 1600,
        height: 900,
        alt: "A-L-L-A-H.COM Empire of the Light",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A-L-L-A-H.COM | Gate",
    description: "Public entrance to the Empire of the Light.",
    images: ["/artwork/imperium-lumen.png"],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#11110f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/brand/emblem.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/emblem.svg" />
      </head>
      <body className="min-h-full flex flex-col">
        <SkinRoot skin="imperium-lumen">
          <SkipLink />
          {children}
        </SkinRoot>
      </body>
    </html>
  );
}
