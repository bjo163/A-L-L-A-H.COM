import type { Metadata } from "next";
import {
  Badge,
  DestinationCard,
  DestinationGrid,
  LinkButton,
  MotionFrame,
  PageHero,
  RouteShell,
  SectionHeading,
  WorldArtwork,
} from "@moonwitness/ui";

export const metadata: Metadata = {
  title: "Overview | Headquarter",
};

const modules = [
  { index: "01", name: "AI Gateway", href: "/ai-gateway", description: "Route requests, monitor providers, and inspect usage." },
  { index: "02", name: "Agent Studio", href: "/agent", description: "Run agents with tools and review execution." },
  { index: "03", name: "Swarm Ops", href: "/swarm", description: "Coordinate multi-agent tasks and inspect results." },
  { index: "04", name: "Tool Registry", href: "/tools", description: "Browse registered MCP tools and capabilities." },
  { index: "05", name: "Knowledge", href: "/knowledge", description: "Search Qorpus with grounded results." },
];

export default function HeadquarterHomePage() {
  return (
    <RouteShell as="main" className="hq-home">
      <MotionFrame effect="enter">
        <PageHero
          titleId="hq-title"
          kicker="NEXUS PARADOX / OPERATIONS / COMMAND CENTER"
          title="Control plane for the MoonWitness ecosystem"
          summary="Dense, instrument-grade views for gateway routing, agent work, swarm coordination, tools, and knowledge."
          actions={
            <>
              <LinkButton href="/ai-gateway">Open AI Gateway</LinkButton>
              <LinkButton href="/agent" variant="outline">Open Agent Studio</LinkButton>
            </>
          }
          media={<WorldArtwork skin="nexus-paradox" />}
          captionLeft="NEXUS PARADOX / INSTRUMENT PLANE"
          captionRight="01 / OPERATIONS"
        />
      </MotionFrame>

      <section className="hq-modules" aria-labelledby="hq-modules-title">
        <SectionHeading
          titleId="hq-modules-title"
          kicker="MODULE INDEX / 05"
          title="Operational modules"
          trailing={<Badge variant="gold">Five routes</Badge>}
        />

        <DestinationGrid label="Headquarter modules">
          {modules.map((module) => (
            <DestinationCard
              key={module.href}
              index={module.index}
              role="module"
              title={module.name}
              description={module.description}
              href={module.href}
            />
          ))}
        </DestinationGrid>
      </section>
    </RouteShell>
  );
}
