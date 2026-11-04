import { Metadata } from "next";
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
      <main className="gate-page">
        <CommunityPortal />
      </main>
    </>
  );
}
