import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame, PageHero, SectionHeading, SkinScope, StatePanel, WorldArtwork } from "@moonwitness/ui";

export const metadata = {
  title: "ROCKSOUL | Narrative Space",
  description: "ROCKSOUL cinematic narrative runtime surface.",
};

export default function RocksoulPage() {
  return (
    <SkinScope skin="rocksoul" className="jizz-world-scope">
      <MotionFrame effect="enter">
        <PageHero
          titleId="rocksoul-title"
          kicker="ROCKSOUL / CINEMATIC NARRATIVE / RUNTIME SURFACE"
          title="Chapters told in rain and negative space."
          summary="Intimate, poster-driven storytelling with back view framing, selective crimson, and a quiet rhythm. Film stills over dashboards, silence over noise."
          actions={
            <>
              <Badge variant="active" dot>Chapter / 00</Badge>
              <Badge variant="default">Index pending</Badge>
            </>
          }
          media={<WorldArtwork skin="rocksoul" />}
          captionLeft="ROCKSOUL / WET STREET"
          captionRight="CHAPTER / 00"
        />
      </MotionFrame>

      <section className="jizz-records" aria-labelledby="rocksoul-records-title">
        <SectionHeading
          titleId="rocksoul-records-title"
          kicker="CHAPTER INDEX / IDLE"
          title="Narrative sequence"
          trailing={<Badge variant="gold">Editorial rhythm</Badge>}
        />

        <div className="jizz-records__grid">
          <Card as="article">
            <CardHeader>
              <CardTitle>Chapters</CardTitle>
              <CardDescription>Film stills and intertitles with no synthetic counters.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="No chapters loaded"
                cause="This surface has no narrative source attached yet."
                nextAction="Chapters appear when a real narrative source is connected."
              />
            </CardContent>
          </Card>
          <Card as="article">
            <CardHeader>
              <CardTitle>Reading state</CardTitle>
              <CardDescription>Explicit loading, empty, and error states.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatePanel
                as="h3"
                kind="empty"
                title="Nothing read yet"
                cause="Progress is tracked only when actual reading occurs."
                nextAction="Open a chapter to start the reading record."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </SkinScope>
  );
}
