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
import { HQ_MODULE_NAV, hqIndexLabel } from "@/lib/nav-registry";

export const metadata: Metadata = {
  title: "Overview | Headquarter",
};

const moduleCount = HQ_MODULE_NAV.length;

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
          kicker={`MODULE INDEX / ${hqIndexLabel(moduleCount - 1)}`}
          title="Operational modules"
          trailing={<Badge variant="gold">{moduleCount} routes</Badge>}
        />

        <DestinationGrid label="Headquarter modules">
          {HQ_MODULE_NAV.map((module, index) => (
            <DestinationCard
              key={module.href}
              index={hqIndexLabel(index)}
              role="module"
              title={module.label}
              description={module.description}
              href={module.href}
            />
          ))}
        </DestinationGrid>
      </section>
    </RouteShell>
  );
}
