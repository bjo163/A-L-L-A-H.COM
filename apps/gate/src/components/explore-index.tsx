'use client';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Link as MwLink,
  LinkButton,
  MotionFrame,
  RawCluster,
  RawContainer,
  RawGrid,
  RawStack,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getFeaturedWorld, getWorlds, type StoryWorld } from "@/lib/content-manifest";

interface ExploreIndexProps {
  locale?: "id" | "en";
}

export function ExploreIndex({ locale = "id" }: ExploreIndexProps) {
  const { t } = useTranslationCatalog(locale);
  const featured = getFeaturedWorld();
  const worlds = getWorlds().filter((w) => w.index !== 1);

  return (
    <>
      {/* Featured World - Dominant */}
      {featured && (
        <MotionFrame effect="enter">
          <section className="gate-section" aria-labelledby="featured-world-title">
            <div className="gate-section__heading">
              <div>
                <p className="gate-kicker">{t("explore.featuredWorld")}</p>
                <h2 id="featured-world-title">{featured.title}</h2>
              </div>
              <Badge variant="gold">{featured.worldLabel}</Badge>
            </div>

            <RawContainer>
              <RawGrid data-gap="loose" style={{ gridTemplateColumns: "minmax(0, 0.55fr) minmax(0, 1.45fr)" }}>
                <figure style={{ margin: 0, border: "1px solid var(--mw-border)", borderRadius: "var(--mw-surface-radius)", overflow: "hidden", background: "linear-gradient(135deg, var(--mw-surface), var(--mw-elevated-surface))" }}>
                  <div style={{ aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mw-muted-text)", fontFamily: "var(--mw-font-numeric)" }}>
                    {locale === "id" ? "Ilustrasi: Manusia Pulpen" : "Illustration: Manusia Pulpen"}
                  </div>
                  <figcaption style={{ padding: "1rem", borderTop: "1px solid var(--mw-border)", fontFamily: "var(--mw-font-numeric)", fontSize: "0.75rem", color: "var(--mw-accent)" }}>
                    ORIGIN STORY / 01
                  </figcaption>
                </figure>
                <div>
                  <p className="gate-kicker" style={{ marginBottom: "1rem" }}>{featured.taglineID}</p>
                  <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7, fontSize: "1.125rem" }}>{featured.bodyID}</p>
                  <div style={{ marginTop: "2rem" }}>
                    <MwLink href={featured.proposedRoute} className="gate-hero__link" style={{ borderColor: "var(--mw-accent)" }}>
                      {locale === "id" ? "Mulai Membaca" : "Begin Reading"}
                    </MwLink>
                  </div>
                </div>
              </RawGrid>
            </RawContainer>
          </section>
        </MotionFrame>
      )}

      {/* Supporting Story Worlds - Distinct Compositions */}
      <MotionFrame effect="enter">
        <section className="gate-section" aria-labelledby="story-worlds-title">
          <div className="gate-section__heading">
            <div>
              <p className="gate-kicker">{t("explore.storyWorlds")}</p>
              <h2 id="story-worlds-title">{t("explore.storyWorlds")}</h2>
            </div>
          </div>

          <RawContainer>
            <RawGrid data-gap="regular" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {worlds.map((world) => (
                <Card as="article" key={world.id} className="group" style={{ display: "flex", flexDirection: "column" }}>
                  <CardHeader>
                    <RawCluster data-gap="tight">
                      <Badge>{world.worldLabel}</Badge>
                      <span style={{ fontFamily: "var(--mw-font-numeric)", color: "var(--mw-accent)" }}>{world.index.toString().padStart(2, "0")}</span>
                    </RawCluster>
                    <CardTitle>{world.title}</CardTitle>
                  </CardHeader>
                  <CardContent style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.6 }}>{locale === "id" ? world.bodyID : world.bodyEN}</p>
                  </CardContent>
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--mw-border)" }}>
                    <MwLink href={world.proposedRoute} underline style={{ fontWeight: 600 }}>
                      {locale === "id" ? "Jelajahi" : "Explore"}
                    </MwLink>
                  </div>
                </Card>
              ))}
            </RawGrid>
          </RawContainer>
        </section>
      </MotionFrame>

      {/* Transmissions Entry */}
      <MotionFrame effect="enter">
        <section className="gate-section" aria-labelledby="transmissions-entry-title">
          <RawContainer>
            <RawStack data-gap="regular" style={{ textAlign: "center", maxWidth: "40rem", margin: "0 auto" }}>
              <div>
                <p className="gate-kicker">{t("explore.transmissions")}</p>
                <h2 id="transmissions-entry-title" style={{ fontFamily: "var(--mw-font-display)" }}>
                  {locale === "id" ? "Transmisi Terbaru" : "Recent Transmissions"}
                </h2>
                <p style={{ margin: "1rem 0 0", color: "var(--mw-muted-text)" }}>
                  {locale === "id"
                    ? "Baca transmisi terverifikasi terbaru dari universe MoonWitness XV."
                    : "Read the latest verified transmissions from the MoonWitness XV universe."}
                </p>
              </div>
              <LinkButton href="/transmissions" variant="outline" style={{ margin: "0 auto" }}>
                {locale === "id" ? "Lihat Semua Transmisi" : "View All Transmissions"}
              </LinkButton>
            </RawStack>
          </RawContainer>
        </section>
      </MotionFrame>

      {/* Knowledge & Creative Categories */}
      <MotionFrame effect="enter">
        <section className="gate-section" aria-labelledby="categories-title">
          <div className="gate-section__heading">
            <div>
              <p className="gate-kicker">{t("explore.knowledge")} / {t("explore.creative")}</p>
              <h2 id="categories-title">{locale === "id" ? "Kategori Pengetahuan & Kreatif" : "Knowledge & Creative Categories"}</h2>
            </div>
          </div>

          <RawContainer>
            <RawGrid data-gap="regular" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {[
                { label: locale === "id" ? "Penelitian" : "Research", desc: locale === "id" ? "Catatan penelitian dan analisis sumber" : "Research notes and source analysis", status: "Planned" },
                { label: locale === "id" ? "Linimasa" : "Timeline", desc: locale === "id" ? "Peristiwa dan kronologi universe" : "Universe events and chronology", status: "Planned" },
                { label: locale === "id" ? "Sumber" : "Sources", desc: locale === "id" ? "Referensi primer dan sekunder" : "Primary and secondary references", status: "Planned" },
                { label: locale === "id" ? "Karakter" : "Characters", desc: locale === "id" ? "Profil ROCKSOUL, AngelWithShotgun, MYLUFT" : "ROCKSOUL, AngelWithShotgun, MYLUFT profiles", status: "Planned" },
                { label: locale === "id" ? "Artefak" : "Artifacts", desc: locale === "id" ? "Karya visual, poster, ilustrasi" : "Visual works, posters, illustrations", status: "Planned" },
                { label: locale === "id" ? "Media" : "Media", desc: locale === "id" ? "Audio, video, transmisi radio" : "Audio, video, radio transmissions", status: "Planned" },
              ].map((cat, i) => (
                <Card as="article" key={i} className="group" style={{ textAlign: "center" }}>
                  <CardHeader>
                    <CardTitle>{cat.label}</CardTitle>
                    <Badge>{cat.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p style={{ margin: 0, color: "var(--mw-muted-text)", fontSize: "0.875rem" }}>{cat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </RawGrid>
          </RawContainer>
        </section>
      </MotionFrame>
    </>
  );
}
