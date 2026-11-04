import { Metadata } from "next";
import { GateNavbar } from "@/components/gate-navbar";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = {
  title: "About A-L-L-A-H.COM",
  description: "Mission, vision, and ecosystem products of the Empire of the Light.",
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return (
    <>
      <GateNavbar />
      <main id="main-content" tabIndex={-1} className="gate-page">
        <InfoPageShell
          title="Tentang A-L-L-A-H.COM"
          titleEn="About A-L-L-A-H.COM"
          description="Misi, visi, dan produk ekosistem Empire of the Light."
          descriptionEn="Mission, vision, and ecosystem products of the Empire of the Light."
        />
      </main>
    </>
  );
}
