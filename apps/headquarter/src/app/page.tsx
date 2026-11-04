import Image from "next/image";
import type { Metadata } from "next";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame } from "@moonwitness/ui";

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
    <div className="hq-home">
      <MotionFrame effect="enter">
        <section className="hq-hero" aria-labelledby="hq-title">
          <div className="hq-hero__copy">
            <p className="hq-kicker">NEXUS PARADOX / OPERATIONS / COMMAND CENTER</p>
            <h1 id="hq-title">Control plane for the MoonWitness ecosystem</h1>
            <p className="hq-hero__summary">Dense, instrument-grade views for gateway routing, agent work, swarm coordination, tools, and knowledge.</p>
            <div className="hq-hero__actions">
              <Button><a href="/ai-gateway">Open AI Gateway</a></Button>
              <Button variant="outline"><a href="/agent">Open Agent Studio</a></Button>
            </div>
          </div>
          <figure className="hq-hero__art">
            <Image src="/artwork/nexus-paradox.png" alt="" width={1600} height={900} priority className="hq-hero__image" />
            <figcaption className="hq-hero__caption"><span>NEXUS PARADOX / INSTRUMENT PLANE</span><span>01 / OPERATIONS</span></figcaption>
          </figure>
        </section>
      </MotionFrame>
      <section className="hq-grid" aria-labelledby="hq-modules-title">
        <div className="hq-grid__header">
          <div>
            <p className="hq-kicker">MODULE INDEX / 05</p>
            <h2 id="hq-modules-title">Operational modules</h2>
          </div>
          <Badge variant="gold">All routes preserved</Badge>
        </div>
        <div className="hq-grid__cards">
          {modules.map((module) => (
            <Card key={module.href}>
              <CardHeader>
                <div className="hq-card__top">
                  <span className="hq-card__index">{module.index}</span>
                  <CardTitle>{module.name}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm"><a href={module.href}>Open module</a></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}