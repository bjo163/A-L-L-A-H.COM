'use client';

import {
  DestinationCard,
  DestinationGrid,
  MotionFrame,
  SectionHeading,
  resolveEcosystemEndpoints,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getManifest } from "@/lib/content-manifest";

interface ClosingHorizonProps {
  locale?: "id" | "en";
}

export function ClosingHorizon({ locale = "id" }: ClosingHorizonProps) {
  const { t } = useTranslationCatalog(locale);
  const endpoints = resolveEcosystemEndpoints(process.env);
  // The catalog has no site section; the quote and slogan are content and live in the manifest.
  const site = getManifest().site;

  const destinations = [
    { id: "universe", label: t("nav.universe"), href: "/universe" },
    { id: "transmissions", label: t("nav.transmissions"), href: "/transmissions" },
    { id: "explore", label: t("nav.explore"), href: "/explore" },
    { id: "community", label: t("nav.community"), href: "/community" },
    { id: "journey", label: t("nav.journey"), href: "/journey" },
    { id: "dock", label: t("nav.dock"), href: endpoints.dock, external: true },
    // Sign-in lives in the identity app; gate has no /login route of its own.
    { id: "signin", label: t("journey.anonymous.signIn"), href: `${endpoints.id}${endpoints.signInPath}`, external: true },
  ];

  return (
    <MotionFrame effect="enter">
      <footer className="gate-closing" role="contentinfo" aria-labelledby="closing-title">
        <SectionHeading
          titleId="closing-title"
          kicker={t("nav.gate")}
          title={locale === "id" ? "Kembali ke Horizon" : "Return to Horizon"}
        />

        <p className="gate-quote">&ldquo;{site.footerQuote}&rdquo;</p>

        <DestinationGrid label={locale === "id" ? "Destinasi ekosistem" : "Ecosystem destinations"}>
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              role={t("nav.gate")}
              title={dest.label}
              href={dest.href}
              external={dest.external}
            />
          ))}
        </DestinationGrid>

        <div className="gate-colophon">
          <p>{site.name} &mdash; {site.descriptor}</p>
          <p className="gate-colophon__slogan">{site.slogan}</p>
        </div>
      </footer>
    </MotionFrame>
  );
}
