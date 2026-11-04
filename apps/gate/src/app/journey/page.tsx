import { Metadata } from "next";
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
      <main id="main-content" tabIndex={-1} className="gate-page">
        <JourneyNext />
      </main>
    </>
  );
}
