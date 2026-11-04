import { Metadata } from "next";
import { GateNavbar } from "@/components/gate-navbar";
import { HeroArrival } from "@/components/hero-arrival";
import { ClosingHorizon } from "@/components/closing-horizon";

export const metadata: Metadata = {
  title: "A-L-L-A-H.COM | Gate",
  description: "Public entrance to the Empire of the Light. Enter the MoonWitness XV universe through stories, transmissions, and knowledge.",
};

export default function HomePage() {
  return (
    <>
      <GateNavbar />
      <main id="main-content" tabIndex={-1} className="gate-page">
        <HeroArrival locale="id" />
        <ClosingHorizon locale="id" />
      </main>
    </>
  );
}