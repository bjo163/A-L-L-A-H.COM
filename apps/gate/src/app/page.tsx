import { Metadata } from "next";
import Link from "next/link";
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
      <Link href="#main-content" className="skip-link">
        Lewati ke konten utama
      </Link>
      <GateNavbar />
      <main id="main-content" className="gate-page">
        <HeroArrival locale="id" />
        <ClosingHorizon locale="id" />
      </main>
    </>
  );
}