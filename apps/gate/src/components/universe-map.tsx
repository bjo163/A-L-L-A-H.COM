'use client';

import {
  Badge,
  DestinationCard,
  DestinationGrid,
  SectionHeading,
  resolveEcosystemEndpoints,
  type BadgeProps,
  type EcosystemAppEndpoints,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getDestinations, type Destination } from "@/lib/content-manifest";

const statusBadge: Record<Destination["status"], { variant: BadgeProps["variant"]; labelKey: string }> = {
  available: { variant: "active", labelKey: "common.statusAvailable" },
  unavailable: { variant: "revoked", labelKey: "common.statusUnavailable" },
  restricted: { variant: "revoked", labelKey: "common.statusRestricted" },
  planned: { variant: "gold", labelKey: "common.statusPlanned" },
};

// Only a destination that is actually open becomes a link. The manifest still lists
// /cockpit and /command-center, which have no route in this app.
function liveHref(dest: Destination, endpoints: EcosystemAppEndpoints): string | undefined {
  if (dest.status !== "available") return undefined;
  if (dest.id === "headquarter") return endpoints.headquarter;
  if (dest.id === "dock") return endpoints.dock;
  if (dest.id === "observatory") return endpoints.jizz;
  return dest.href;
}

export function UniverseMap({ locale = "id" }: { locale?: "id" | "en" }) {
  const { t } = useTranslationCatalog(locale);
  const endpoints = resolveEcosystemEndpoints(process.env);
  const destinations = getDestinations();

  return (
    <section className="gate-section" aria-labelledby="universe-title">
      <SectionHeading
        titleId="universe-title"
        kicker={t("universe.title")}
        title={t("universe.description")}
      />

      <DestinationGrid label={t("universe.title")}>
        <DestinationCard
          index="00"
          role={t("nav.gate")}
          title={locale === "id" ? "Gerbang Utama" : "Main Gate"}
          description={locale === "id"
            ? "Titik masuk Anda ke Empire of the Light. Di sinilah perjalanan dimulai."
            : "Your entry point to the Empire of the Light. This is where the journey begins."}
          status={<Badge variant="active" dot>{locale === "id" ? "Di sini" : "Current"}</Badge>}
          href="/"
        />

        {destinations.map((dest, i) => {
          const badge = statusBadge[dest.status];

          return (
            <DestinationCard
              key={dest.id}
              index={String(i + 1).padStart(2, "0")}
              role={dest.role}
              title={dest.name}
              description={dest.description}
              status={<Badge variant={badge.variant}>{t(badge.labelKey)}</Badge>}
              href={liveHref(dest, endpoints)}
              external={dest.href.startsWith("http")}
            />
          );
        })}
      </DestinationGrid>
    </section>
  );
}
