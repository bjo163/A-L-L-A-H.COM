import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
import { GateNavbar } from "@/components/gate-navbar";
import { TransmissionsFeed } from "@/components/transmissions-feed";

export const metadata: Metadata = {
  title: "Transmissions",
  description: "Featured and recent transmissions from the MoonWitness XV universe.",
};

export default function TransmissionsPage() {
  return (
    <>
      <GateNavbar />
      <RouteShell as="main" className="gate-shell">
        <TransmissionsFeed />
      </RouteShell>
    </>
  );
}
