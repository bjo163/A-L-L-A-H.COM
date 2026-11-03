import Image from 'next/image';

export default function WorldObservatoryHome() {
  return (
    <div className="jizz-home">
      <section className="jizz-hero" aria-labelledby="observatory-title">
        <div className="jizz-hero__copy">
          <p className="jizz-kicker">WORLD OBSERVATORY / RESEARCH DESK</p>
          <h1 id="observatory-title">Evidence before perspective.</h1>
          <p>
            A space for source-grounded observations and the perspectives
            attached to them. Every record must keep its provenance visible.
          </p>
          <div className="jizz-hero__principle">
            <span className="jizz-hero__node" aria-hidden="true" />
            <span>No unverified sample records are shown.</span>
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

      <section className="jizz-records" aria-labelledby="record-heading">
        <div className="jizz-records__heading">
          <div>
            <p className="jizz-kicker">OBSERVATION INDEX / 00</p>
            <h2 id="record-heading">Source-backed records</h2>
          </div>
          <p>Records appear here only after a connected source returns them.</p>
        </div>

        <div className="jizz-empty" role="status">
          <span className="jizz-empty__glyph" aria-hidden="true">
            <svg viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r="31" />
              <circle cx="48" cy="48" r="18" />
              <path d="M48 5v18m0 50v18M5 48h18m50 0h18M18 18l13 13m34 34 13 13m0-60L65 31m-34 34L18 78" />
              <circle cx="48" cy="48" r="4" />
            </svg>
          </span>
          <div>
            <p className="jizz-empty__state">No source connection</p>
            <h3>No observations are available yet.</h3>
            <p>
              This workspace is not connected to an observation feed. The list
              will remain empty until a real source integration is available.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
