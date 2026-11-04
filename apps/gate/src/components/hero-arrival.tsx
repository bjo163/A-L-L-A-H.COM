'use client';

import Image from "next/image";
import Link from "next/link";
import { MotionFrame } from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";

interface HeroArrivalProps {
  locale?: "id" | "en";
}

export function HeroArrival({ locale = "id" }: HeroArrivalProps) {
  const { t } = useTranslationCatalog(locale);

  return (
    <MotionFrame effect="enter">
      <section className="gate-hero" aria-labelledby="gate-title">
        <div className="gate-hero__copy">
          <p className="gate-kicker">{t("nav.gate")} / {t("nav.universe")} / ENTRANCE</p>
          <h1 id="gate-title">{t("hero.headline")}</h1>
          <p className="gate-hero__summary">
            {locale === "id"
              ? "Masuk ke Empire of the Light melalui gerbang yang memperkenalkan kosmos, cerita, dan pengetahuan MoonWitness XV."
              : "Enter the Empire of the Light through a gate introducing the MoonWitness XV cosmos, stories, and knowledge."}
          </p>
          <div className="gate-hero__actions">
            <Link className="gate-hero__link" href="/universe">
              {t("hero.ctaPrimary")}
            </Link>
            <Link className="gate-hero__link" href="/about" style={{ borderColor: "transparent", background: "transparent" }}>
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>
        <figure className="gate-hero__art">
          <Image
            src="/artwork/imperium-lumen.png"
            alt=""
            width={1600}
            height={900}
            priority
            className="gate-hero__image"
          />
          <figcaption className="gate-hero__caption">
            <span>IMPERIUM LUMEN / THRESHOLD</span>
            <span>01 / ARRIVAL</span>
          </figcaption>
        </figure>
      </section>
    </MotionFrame>
  );
}
