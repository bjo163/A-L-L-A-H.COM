'use client';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DestinationCard,
  DestinationGrid,
  LinkButton,
  MotionFrame,
  PageHero,
  SectionHeading,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getFeaturedWorld, getWorlds } from "@/lib/content-manifest";

interface ExploreIndexProps {
  locale?: "id" | "en";
}

const categories = [
  { idLabel: "Penelitian", enLabel: "Research", idDesc: "Catatan penelitian dan analisis sumber", enDesc: "Research notes and source analysis" },
  { idLabel: "Linimasa", enLabel: "Timeline", idDesc: "Peristiwa dan kronologi universe", enDesc: "Universe events and chronology" },
  { idLabel: "Sumber", enLabel: "Sources", idDesc: "Referensi primer dan sekunder", enDesc: "Primary and secondary references" },
  { idLabel: "Karakter", enLabel: "Characters", idDesc: "Profil ROCKSOUL, AngelWithShotgun, MYLUFT", enDesc: "ROCKSOUL, AngelWithShotgun, MYLUFT profiles" },
  { idLabel: "Artefak", enLabel: "Artifacts", idDesc: "Karya visual, poster, ilustrasi", enDesc: "Visual works, posters, illustrations" },
  { idLabel: "Media", enLabel: "Media", idDesc: "Audio, video, transmisi radio", enDesc: "Audio, video, radio transmissions" },
];

export function ExploreIndex({ locale = "id" }: ExploreIndexProps) {
  const { t } = useTranslationCatalog(locale);
  const en = locale === "en";
  const featured = getFeaturedWorld();
  const worlds = getWorlds().filter((world) => world.index !== 1);

  return (
    <>
      {featured && (
        <MotionFrame effect="enter">
          <PageHero
            titleId="featured-world-title"
            kicker={t("explore.featuredWorld")}
            title={featured.title}
            summary={en ? featured.bodyEN : featured.bodyID}
            actions={
              <LinkButton href="/transmissions" variant="outline">
                {en ? "Read the transmissions" : "Baca transmisi"}
              </LinkButton>
            }
            media={(
              <div className="gate-figure__plate">
                {en ? `Illustration pending: ${featured.title}` : `Ilustrasi belum disetujui: ${featured.title}`}
              </div>
            )}
            captionLeft={featured.worldLabel}
            captionRight={`${featured.index.toString().padStart(2, "0")} / ORIGIN`}
          />
        </MotionFrame>
      )}

      <MotionFrame effect="enter">
        <section className="gate-section" aria-labelledby="story-worlds-title">
          <SectionHeading
            titleId="story-worlds-title"
            kicker={t("explore.storyWorlds")}
            title={en ? "Other story worlds" : "Dunia cerita lainnya"}
          />

          <DestinationGrid label={en ? "Story worlds" : "Dunia cerita"}>
            {worlds.map((world) => (
              <DestinationCard
                key={world.id}
                index={world.index.toString().padStart(2, "0")}
                role={world.worldLabel}
                title={world.title}
                description={en ? world.bodyEN : world.bodyID}
                status={<Badge variant="gold">{world.publicationState}</Badge>}
              />
            ))}
          </DestinationGrid>
        </section>
      </MotionFrame>

      <MotionFrame effect="enter">
        <section className="gate-section" aria-labelledby="categories-title">
          <SectionHeading
            titleId="categories-title"
            kicker={`${t("explore.knowledge")} / ${t("explore.creative")}`}
            title={en ? "Knowledge & creative categories" : "Kategori pengetahuan & kreatif"}
          />

          <div className="gate-auto-grid">
            {categories.map((category) => (
              <Card as="article" key={category.idLabel} className="gate-tile">
                <CardHeader>
                  <CardTitle>{en ? category.enLabel : category.idLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="gate-meta">{en ? category.enDesc : category.idDesc}</p>
                </CardContent>
                <Badge variant="gold">{en ? "Planned" : "Direncanakan"}</Badge>
              </Card>
            ))}
          </div>

          <div className="gate-tease">
            <SectionHeading
              kicker={t("explore.transmissions")}
              title={en ? "Recent transmissions" : "Transmisi terbaru"}
              description={en
                ? "Read the latest verified transmissions from the MoonWitness XV universe."
                : "Baca transmisi terverifikasi terbaru dari universe MoonWitness XV."}
            />
            <LinkButton href="/transmissions" variant="outline">
              {en ? "View all transmissions" : "Lihat semua transmisi"}
            </LinkButton>
          </div>
        </section>
      </MotionFrame>
    </>
  );
}
