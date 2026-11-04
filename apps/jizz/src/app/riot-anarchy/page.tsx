import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame, PageHero, SectionHeading, SkinScope, StatePanel, WorldArtwork } from "@moonwitness/ui";

export const metadata = {
  title: "RIOT ANARCHY | Controlled Disruption",
  description: "RIOT ANARCHY poster runtime surface.",
};

export default function RiotAnarchyPage() {
  return (
    <SkinScope skin="riot-anarchy" className="jizz-world-scope">
      <MotionFrame effect="enter">
        <PageHero
          titleId="riot-title"
          kicker="RIOT ANARCHY / POSTER COLLISION / RUNTIME SURFACE"
          title="Controlled disruption with predictable order."
          summary="Hard print edges, poster contrast, and bounded asymmetry. DOM order, keyboard flow, and touch-safe targets stay predictable: the collision is graphic, never structural."
          actions={
            <>
              <Badge variant="active" dot>Issue / 00</Badge>
              <Badge variant="default">Poster index pending</Badge>
            </>
          }
          media={<WorldArtwork skin="riot-anarchy" />}
          captionLeft="RIOT ANARCHY / PRINT COLLISION"
          captionRight="ISSUE / 00"
        />
      </MotionFrame>

      <section className="jizz-records" aria-labelledby="riot-records-title">
        <SectionHeading
          titleId="riot-records-title"
          kicker="POSTER INDEX / IDLE"
          title="Graphic sequence"
          trailing={<Badge variant="gold">Bounded asymmetry</Badge>}
        />

        <div className="jizz-records__grid">
          <Card as="article">
            <CardHeader>
              <CardTitle>Issues</CardTitle>
              <CardDescription>Stamped content with real actions only.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No issues loaded"
                cause="This surface has no poster source attached yet."
                nextAction="Issues appear when a real source is connected."
              />
            </CardContent>
          </Card>
          <Card as="article">
            <CardHeader>
              <CardTitle>Interaction contract</CardTitle>
              <CardDescription>Keyboard, focus, and touch-safe controls are preserved.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No control outstanding"
                cause="Disruption is visual only; structure remains accessible."
                nextAction="Open an issue to exercise the keyboard and touch paths."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </SkinScope>
  );
}
