import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Overview | Headquarter',
};

const modules = [
  {
    index: '01',
    name: 'AI Gateway',
    note: 'Provider routing, telemetry, and a live request console.',
    href: '/ai-gateway',
  },
  {
    index: '02',
    name: 'Agent Studio',
    note: 'Submit a run and inspect its streamed steps.',
    href: '/agent',
  },
  {
    index: '03',
    name: 'Swarm Operations',
    note: 'Coordinate a bounded multi-agent run.',
    href: '/swarm',
  },
  {
    index: '04',
    name: 'Tool Registry',
    note: 'Inspect available tools and their audit records.',
    href: '/tools',
  },
  {
    index: '05',
    name: 'Knowledge Explorer',
    note: 'Search the connected Qorpus knowledge base.',
    href: '/knowledge',
  },
];

export default function HeadquarterHomePage() {
  return (
    <main className="hq-home">
      <header className="hq-home__heading">
        <p className="hq-kicker">NEXUS PARADOX / COMMAND SPACE</p>
        <h1>Headquarter</h1>
        <p>Choose an operational workspace. Runtime status appears only where it is returned by the connected service.</p>
      </header>

      <section className="hq-home__hero" aria-labelledby="hq-hero-title">
        <div className="hq-home__hero-copy">
          <span className="hq-home__coordinates">CONTROL SURFACE / 01</span>
          <h2 id="hq-hero-title">A clear view of the systems you can operate.</h2>
          <p>
            Move directly to the gateway, agent, swarm, tool, or knowledge
            workspace. Each module reports its own connection and execution state.
          </p>
          <a className="hq-home__link" href="/ai-gateway">
            Open AI Gateway <span aria-hidden="true">↗</span>
          </a>
        </div>
        <Image
          src="/artwork/nexus-paradox.png"
          alt=""
          width={1600}
          height={900}
          priority
          className="hq-home__art"
        />
        <span className="hq-home__frame-label" aria-hidden="true">N / 04 / SYSTEM MAP</span>
      </section>

      <section className="hq-modules" aria-labelledby="hq-modules-title">
        <div className="hq-modules__heading">
          <div>
            <p className="hq-kicker">DESTINATIONS / 01-05</p>
            <h2 id="hq-modules-title">Operational modules</h2>
          </div>
          <p>Open a workspace to inspect its real data or run an action.</p>
        </div>
        <nav className="hq-module-grid" aria-label="Operational modules">
          {modules.map((module) => (
            <a className="hq-module" href={module.href} key={module.index}>
              <span className="hq-module__index">{module.index}</span>
              <h3>{module.name}</h3>
              <p>{module.note}</p>
              <span className="hq-module__arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}
