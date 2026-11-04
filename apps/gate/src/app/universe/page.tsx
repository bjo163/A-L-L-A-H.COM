import { Metadata } from "next";
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
      <main className="gate-page">
        <UniverseMap />
      </main>
    </>
  );
}
