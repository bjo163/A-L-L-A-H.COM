import Image from 'next/image';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame, StatePanel } from '@moonwitness/ui';

export default function WorldObservatoryHome() {
  return (
    <div className="jizz-home">
      <MotionFrame effect="enter">
        <section className="jizz-hero" aria-labelledby="observatory-title">
          <div className="jizz-hero__copy">
            <p className="jizz-kicker">WORLD OBSERVATORY / MYCELIUM / RESEARCH DESK</p>
            <h1 id="observatory-title">Evidence before perspective.</h1>
            <p>
              A space for source-grounded observations and the perspectives attached to them. Every record
              must keep its provenance visible.
            </p>
            <div className="jizz-hero__principle">
              <span className="jizz-hero__node" aria-hidden="true" />
              <span>No unverified sample records are shown.</span>
            </div>
            <div className="jizz-hero__actions">
              <span className="jizz-hero__status">Await source connection</span>
              <span className="jizz-hero__status jizz-hero__status--outline">No feed attached</span>
            </div>
          </div>
          <figure className="jizz-hero__art">
            <Image
              src="/artwork/mycelium.png"
              alt=""
              width={1600}
              height={900}
              priority
              className="jizz-hero__image"
            />
            <figcaption className="jizz-hero__caption">
              <span>MYCELIUM / NETWORK ATLAS</span>
              <span>01 / OPEN SPACE</span>
            </figcaption>
          </figure>
        </section>
      </MotionFrame>

      <section className="jizz-records" aria-labelledby="record-heading">
        <div className="jizz-records__heading">
          <div>
            <p className="jizz-kicker">OBSERVATION INDEX / 00</p>
            <h2 id="record-heading">Source-backed records</h2>
          </div>
          <Badge variant="gold">Provenance-first</Badge>
        </div>

        <div className="jizz-records__grid">
          <Card>
            <CardHeader>
              <CardTitle>Records</CardTitle>
              <CardDescription>Read-only list gated by a real source.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No observations are available yet"
                cause="This workspace is not connected to an observation feed."
                nextAction="The list fills as soon as a real source integration is available."
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Perspectives</CardTitle>
              <CardDescription>Perspectives attach only to existing records.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No perspectives yet"
                cause="Perspective threads require at least one sourced observation record."
                nextAction="Connect a source, then perspectives attach to the records it produces."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
