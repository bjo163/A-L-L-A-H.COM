import Image from 'next/image';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame, PageHero, SectionHeading, StatePanel } from '@moonwitness/ui';

export default function WorldObservatoryHome() {
  return (
    <>
      <MotionFrame effect="enter">
        <PageHero
          titleId="observatory-title"
          kicker="WORLD OBSERVATORY / MYCELIUM / RESEARCH DESK"
          title="Evidence before perspective."
          summary="A space for source-grounded observations and the perspectives attached to them. Every record keeps its provenance visible, and no unverified sample record is shown."
          actions={
            <>
              <Badge variant="active" dot>Await source connection</Badge>
              <Badge variant="default">No feed attached</Badge>
            </>
          }
          media={<Image src="/artwork/mycelium.png" alt="" width={1600} height={900} priority />}
          captionLeft="MYCELIUM / NETWORK ATLAS"
          captionRight="01 / OPEN SPACE"
        />
      </MotionFrame>

      <section className="jizz-records" aria-labelledby="record-heading">
        <SectionHeading
          titleId="record-heading"
          kicker="OBSERVATION INDEX / 00"
          title="Source-backed records"
          trailing={<Badge variant="gold">Provenance-first</Badge>}
        />

        <div className="jizz-records__grid">
          <Card as="article">
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
          <Card as="article">
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
    </>
  );
}
