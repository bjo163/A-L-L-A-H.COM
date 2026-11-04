import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
import { GateNavbar } from "@/components/gate-navbar";
import { JourneyNext } from "@/components/journey-next";

export const metadata: Metadata = {
  title: "Your Journey",
  description: "Choose your next step: continue exploring or sign in for personal tools.",
};

export default function JourneyPage() {
  return (
    <>
      <GateNavbar />
      <RouteShell as="main" className="gate-shell">
        <JourneyNext />
      </RouteShell>
    </>
  );
}
