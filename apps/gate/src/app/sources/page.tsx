import { Metadata } from "next";
import { GateNavbar } from "@/components/gate-navbar";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = {
  title: "Sources & Provenance",
  description: "Provenance methodology, scripture editions, copyright, and licensing.",
  robots: { index: false, follow: true },
};

export default function SourcesPage() {
  return (
    <>
      <GateNavbar />
      <main id="main-content" tabIndex={-1} className="gate-page">
        <InfoPageShell
          title="Sumber & Provenansi"
          titleEn="Sources & Provenance"
          description="Metodologi provenance, edisi teks suci, hak cipta, dan lisensi."
          descriptionEn="Provenance methodology, scripture editions, copyright, and licensing."
        />
      </main>
    </>
  );
}
