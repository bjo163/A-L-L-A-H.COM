import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
import { GateNavbar } from "@/components/gate-navbar";
import { DiscoverFilters } from "@/components/discover-filters";

export const metadata: Metadata = {
  title: "Discover",
  description: "Filter by theme, format, time, or source type to find what you seek.",
};

export default function DiscoverPage() {
  return (
    <>
      <GateNavbar />
      <RouteShell as="main" className="gate-shell">
        <DiscoverFilters />
      </RouteShell>
    </>
  );
}
