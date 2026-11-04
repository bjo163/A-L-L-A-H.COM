import type { Metadata, Viewport } from "next";
import { SkipLink, SkinRoot, buildAppIcons, skinRegistry } from "@moonwitness/ui";
import "./globals.css";

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
  icons: buildAppIcons("imperium-lumen"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "A-L-L-A-H.COM",
    title: "A-L-L-A-H.COM | Gate",
    description: "Public entrance to the Empire of the Light.",
    images: [
      {
        url: skinRegistry["imperium-lumen"].identity.hero,
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
    images: [skinRegistry["imperium-lumen"].identity.hero],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: skinRegistry["imperium-lumen"].identity.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SkinRoot skin="imperium-lumen">
          <SkipLink />
          {children}
        </SkinRoot>
      </body>
    </html>
  );
}
