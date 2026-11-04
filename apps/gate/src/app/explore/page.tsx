import { Metadata } from "next";
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
      <main className="gate-page">
        <ExploreIndex />
      </main>
    </>
  );
}
