import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
import { GateNavbar } from "@/components/gate-navbar";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Data collected, no tracking, your rights, and contact.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <GateNavbar />
      <RouteShell as="main" className="gate-shell">
        <InfoPageShell
          title="Privasi"
          titleEn="Privacy"
          description="Data yang dikumpulkan, tidak ada pelacakan, hak Anda, dan kontak."
          descriptionEn="Data collected, no tracking, your rights, and contact."
        />
      </RouteShell>
    </>
  );
}
