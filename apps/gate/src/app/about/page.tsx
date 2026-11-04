import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
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
      <RouteShell as="main" className="gate-shell">
        <InfoPageShell
          title="Tentang A-L-L-A-H.COM"
          titleEn="About A-L-L-A-H.COM"
          description="Misi, visi, dan produk ekosistem Empire of the Light."
          descriptionEn="Mission, vision, and ecosystem products of the Empire of the Light."
        />
      </RouteShell>
    </>
  );
}
