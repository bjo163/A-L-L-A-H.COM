import Image from "next/image";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, MotionFrame } from "@moonwitness/ui";

export const metadata = {
  title: "RIOT ANARCHY | Controlled Disruption",
  description: "RIOT ANARCHY poster runtime surface.",
};

export default function RiotAnarchyPage() {
  return (
    <div className="jizz-home">
      <MotionFrame effect="enter">
        <section className="jizz-hero" aria-labelledby="riot-title">
          <div className="jizz-hero__copy">
            <p className="jizz-kicker">RIOT ANARCHY / POSTER COLLISION / RUNTIME SURFACE</p>
            <h1 id="riot-title">Controlled disruption with predictable order.</h1>
            <p>
              Hard print edges, poster contrast, and bounded asymmetry. DOM order, keyboard flow, and touch-safe
              targets remain predictable despite the disruption.
            </p>
            <div className="jizz-hero__principle">
              <span className="jizz-hero__node" aria-hidden="true" />
              <span>Graphic collision without losing semantic structure.</span>
            </div>
            <div className="jizz-hero__actions">
              <Button type="button" disabled>
                Open issue
              </Button>
              <Button type="button" variant="outline" disabled>
                View poster index
              </Button>
            </div>
          </div>
          <figure className="jizz-hero__art">
            <Image
              src="/artwork/riot-anarchy.png"
              alt=""
              width={1600}
              height={900}
              priority
              className="jizz-hero__image"
            />
            <figcaption className="jizz-hero__caption">
              <span>RIOT ANARCHY / PRINT COLLISION</span>
              <span>ISSUE / 00</span>
            </figcaption>
          </figure>
        </section>
      </MotionFrame>

      <section className="jizz-records" aria-labelledby="riot-records-title">
        <div className="jizz-records__heading">
          <div>
            <p className="jizz-kicker">POSTER INDEX / IDLE</p>
            <h2 id="riot-records-title">Graphic sequence</h2>
          </div>
          <Badge variant="gold">Bounded asymmetry</Badge>
        </div>
        <div className="jizz-records__grid">
          <Card>
            <CardHeader>
              <CardTitle>Issues</CardTitle>
              <CardDescription>Stamped content with real actions only.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="jizz-empty" role="status">
                <span className="jizz-empty__glyph" aria-hidden="true" />
                <div>
                  <p className="jizz-empty__state">No issues loaded</p>
                  <p>Content appears when a real source is attached.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interaction contract</CardTitle>
              <CardDescription>Keyboard, focus, and touch-safe controls are preserved.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="jizz-empty" role="status">
                <span className="jizz-empty__glyph" aria-hidden="true" />
                <div>
                  <p className="jizz-empty__state">Ready</p>
                  <p>Disruption is visual only; structure remains accessible.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
