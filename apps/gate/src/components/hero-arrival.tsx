'use client';

import Image from "next/image";
import { LinkButton, MotionFrame, PageHero } from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";

interface HeroArrivalProps {
  locale?: "id" | "en";
}

export function HeroArrival({ locale = "id" }: HeroArrivalProps) {
  const { t } = useTranslationCatalog(locale);

  return (
    <MotionFrame effect="enter">
      <PageHero
        titleId="gate-title"
        kicker={`${t("nav.gate")} / ${t("nav.universe")} / ENTRANCE`}
        title={t("hero.headline")}
        summary={locale === "id"
          ? "Masuk ke Empire of the Light melalui gerbang yang memperkenalkan kosmos, cerita, dan pengetahuan MoonWitness XV."
          : "Enter the Empire of the Light through a gate introducing the MoonWitness XV cosmos, stories, and knowledge."}
        actions={
          <>
            <LinkButton href="/universe">{t("hero.ctaPrimary")}</LinkButton>
            <LinkButton href="/about" variant="ghost">{t("hero.ctaSecondary")}</LinkButton>
          </>
        }
        media={<Image src="/artwork/rocksoul.png" alt="" width={1600} height={900} priority />}
        captionLeft="ROCKSOUL / THRESHOLD"
        captionRight="01 / ARRIVAL"
      />
    </MotionFrame>
  );
}
