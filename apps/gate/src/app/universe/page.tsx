import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
import { GateNavbar } from "@/components/gate-navbar";
import { UniverseMap } from "@/components/universe-map";

export const metadata: Metadata = {
  title: "Universe Map",
  description: "Explore the five destinations of the A-L-L-A-H.COM ecosystem.",
};

export default function UniversePage() {
  return (
    <>
      <GateNavbar />
      <RouteShell as="main" className="gate-shell">
        <UniverseMap />
      </RouteShell>
    </>
  );
}
