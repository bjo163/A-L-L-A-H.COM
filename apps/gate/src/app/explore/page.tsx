import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
import { GateNavbar } from "@/components/gate-navbar";
import { ExploreIndex } from "@/components/explore-index";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover story worlds, transmissions, knowledge, and the living timeline.",
};

export default function ExplorePage() {
  return (
    <>
      <GateNavbar />
      <RouteShell as="main" className="gate-shell">
        <ExploreIndex />
      </RouteShell>
    </>
  );
}
