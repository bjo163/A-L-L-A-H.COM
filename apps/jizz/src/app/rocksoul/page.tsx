import Image from "next/image";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame } from "@moonwitness/ui";

export const metadata = {
  title: "ROCKSOUL | Narrative Space",
  description: "ROCKSOUL cinematic narrative runtime surface.",
};

export default function RocksoulPage() {
  return (
    <div className="jizz-home">
      <MotionFrame effect="enter">
        <section className="jizz-hero" aria-labelledby="rocksoul-title">
          <div className="jizz-hero__copy">
            <p className="jizz-kicker">ROCKSOUL / CINEMATIC NARRATIVE / RUNTIME SURFACE</p>
            <h1 id="rocksoul-title">Chapters told in rain and negative space.</h1>
            <p>
              Intimate, poster-driven storytelling with back view framing, selective crimson, and a quiet rhythm.
              No face reveal, no autoplay media, and no fabricated playback stats.
            </p>
            <div className="jizz-hero__principle">
              <span className="jizz-hero__node" aria-hidden="true" />
              <span>Film stills over dashboards. Silence over noise.</span>
            </div>
            <div className="jizz-hero__actions">
              <Button type="button" disabled>
                Open first chapter
              </Button>
              <Button type="button" variant="outline" disabled>
                View chapter index
              </Button>
            </div>
          </div>
          <figure className="jizz-hero__art">
            <Image
              src="/artwork/rocksoul.png"
              alt=""
              width={1600}
              height={900}
              priority
              className="jizz-hero__image"
            />
            <figcaption className="jizz-hero__caption">
              <span>ROCKSOUL / WET STREET</span>
              <span>CHAPTER / 00</span>
            </figcaption>
          </figure>
        </section>
      </MotionFrame>

      <section className="jizz-records" aria-labelledby="rocksoul-records-title">
        <div className="jizz-records__heading">
          <div>
            <p className="jizz-kicker">CHAPTER INDEX / IDLE</p>
            <h2 id="rocksoul-records-title">Narrative sequence</h2>
          </div>
          <Badge variant="gold">Editorial rhythm</Badge>
        </div>
        <div className="jizz-records__grid">
          <Card>
            <CardHeader>
              <CardTitle>Chapters</CardTitle>
              <CardDescription>Film stills and intertitles with no synthetic counters.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="jizz-empty" role="status">
                <span className="jizz-empty__glyph" aria-hidden="true" />
                <div>
                  <p className="jizz-empty__state">No chapters loaded</p>
                  <p>Chapters appear when a real narrative source is attached.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reading state</CardTitle>
              <CardDescription>Explicit loading, empty, and error states.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="jizz-empty" role="status">
                <span className="jizz-empty__glyph" aria-hidden="true" />
                <div>
                  <p className="jizz-empty__state">Idle</p>
                  <p>Progress is tracked only when actual reading occurs.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
