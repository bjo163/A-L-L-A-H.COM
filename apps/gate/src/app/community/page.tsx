import { Metadata } from "next";
import { RouteShell } from "@moonwitness/ui";
import { GateNavbar } from "@/components/gate-navbar";
import { CommunityPortal } from "@/components/community-portal";

export const metadata: Metadata = {
  title: "Community",
  description: "Learn about participation in the Dock community harbor.",
};

export default function CommunityPage() {
  return (
    <>
      <GateNavbar />
      <RouteShell as="main" className="gate-shell">
        <CommunityPortal />
      </RouteShell>
    </>
  );
}
