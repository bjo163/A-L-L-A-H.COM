import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
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
      <RouteShell as="main" className="gate-shell">
        <InfoPageShell
          title="Sumber & Provenansi"
          titleEn="Sources & Provenance"
          description="Metodologi provenance, edisi teks suci, hak cipta, dan lisensi."
          descriptionEn="Provenance methodology, scripture editions, copyright, and licensing."
        />
      </RouteShell>
    </>
  );
}
