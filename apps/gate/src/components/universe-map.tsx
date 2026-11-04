'use client';

import { RawCluster, RawContainer, RawGrid, RawStack } from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getDestinations, type Destination } from "@/lib/content-manifest";

export function UniverseMap({ locale = "id" }: { locale?: "id" | "en" }) {
  const { t } = useTranslationCatalog(locale);
  const destinations = getDestinations();

  const statusLabels = {
    available: t("common.statusAvailable"),
    unavailable: t("common.statusUnavailable"),
    restricted: t("common.statusRestricted"),
    planned: t("common.statusPlanned"),
  };

  const statusClasses = {
    available: "universe-destination__status--available",
    unavailable: "universe-destination__status--unavailable",
    restricted: "universe-destination__status--restricted",
    planned: "universe-destination__status--planned",
  };

  return (
    <section className="gate-section" aria-labelledby="universe-title">
      <div className="gate-section__heading">
        <div>
          <p className="gate-kicker">{t("universe.title")}</p>
          <h2 id="universe-title">{t("universe.description")}</h2>
        </div>
      </div>

      {/* Spatial Map - Distinct Compositions */}
      <RawContainer className="universe-map">
        {/* Gate - Current, Prominent */}
        <article className="universe-destination universe-destination--gate" aria-labelledby="dest-gate-title">
          <div>
            <span className="universe-destination__label">{t("universe.gate")} (Current)</span>
            <h3 id="dest-gate-title" style={{ margin: "0.5rem 0 1rem", color: "var(--mw-text)", fontFamily: "var(--mw-font-heading)", fontSize: "1.5rem" }}>
              {locale === "id" ? "Gerbang Utama" : "Main Gate"}
            </h3>
            <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.6 }}>
              {locale === "id"
                ? "Titik masuk Anda ke Empire of the Light. Di sinilah perjalanan dimulai."
                : "Your entry point to the Empire of the Light. This is where the journey begins."}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={`universe-destination__status ${statusClasses.available}`}>
              {statusLabels.available}
            </span>
          </div>
        </article>

        {/* MoonWitness - Archive Tower */}
        <article className="universe-destination" aria-labelledby="dest-mw-title">
          <span className="universe-destination__label">{t("universe.moonwitness")}</span>
          <h3 id="dest-mw-title" style={{ margin: "0.5rem 0 1rem", color: "var(--mw-text)", fontFamily: "var(--mw-font-heading)", fontSize: "1.25rem" }}>
            {t("universe.moonwitness")}
          </h3>
          <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.6 }}>
            {locale === "id"
              ? "Arsip cerita, transmisi, karakter, pengetahuan, dan linimasa hidup MoonWitness XV."
              : "Archive of stories, transmissions, characters, knowledge, and the living MoonWitness XV timeline."}
          </p>
          <span className={`universe-destination__status ${statusClasses.available}`}>
            {statusLabels.available}
          </span>
        </article>

        {/* Dock - Harbor */}
        <article className="universe-destination" aria-labelledby="dest-dock-title">
          <span className="universe-destination__label">{t("universe.dock")}</span>
          <h3 id="dest-dock-title" style={{ margin: "0.5rem 0 1rem", color: "var(--mw-text)", fontFamily: "var(--mw-font-heading)", fontSize: "1.25rem" }}>
            {t("universe.dock")}
          </h3>
          <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.6 }}>
            {locale === "id"
              ? "Pelabuhan komunitas: diskusi, kontribusi, dan partisipasi bersama. Butuh MoonWitness ID."
              : "Community harbor: discussions, contributions, and shared participation. Requires MoonWitness ID."}
          </p>
          <span className={`universe-destination__status ${statusClasses.available}`}>
            {statusLabels.available}
          </span>
        </article>

        {/* Cockpit - Workspace (Unavailable) */}
        <article className="universe-destination" aria-labelledby="dest-cockpit-title" style={{ opacity: 0.6 }}>
          <span className="universe-destination__label">{t("universe.cockpit")}</span>
          <h3 id="dest-cockpit-title" style={{ margin: "0.5rem 0 1rem", color: "var(--mw-text)", fontFamily: "var(--mw-font-heading)", fontSize: "1.25rem" }}>
            {t("universe.cockpit")}
          </h3>
          <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.6 }}>
            {locale === "id"
              ? "Ruang kerja pribadi: alat AI, kerja tersimpan, preferensi. Belum diimplementasikan."
              : "Personal workspace: AI tools, saved work, preferences. Not yet implemented."}
          </p>
          <span className={`universe-destination__status ${statusClasses.unavailable}`}>
            {statusLabels.unavailable}
          </span>
        </article>

        {/* Headquarter - Command Spire (Restricted) */}
        <article className="universe-destination universe-destination--restricted" aria-labelledby="dest-hq-title">
          <span className="universe-destination__label">{t("universe.headquarter")}</span>
          <h3 id="dest-hq-title" style={{ margin: "0.5rem 0 1rem", color: "var(--mw-text)", fontFamily: "var(--mw-font-heading)", fontSize: "1.25rem" }}>
            {t("universe.headquarter")}
          </h3>
          <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.6 }}>
            {locale === "id"
              ? "Koordinasi ekosistem dan operasi terotorisasi. Akses terbatas."
              : "Ecosystem coordination and authorized operations. Restricted access."}
          </p>
          <span className={`universe-destination__status ${statusClasses.restricted}`}>
            {statusLabels.restricted}
          </span>
        </article>

        {/* Observatory */}
        <article className="universe-destination" aria-labelledby="dest-obs-title">
          <span className="universe-destination__label">{t("universe.observatory")}</span>
          <h3 id="dest-obs-title" style={{ margin: "0.5rem 0 1rem", color: "var(--mw-text)", fontFamily: "var(--mw-font-heading)", fontSize: "1.25rem" }}>
            {t("universe.observatory")}
          </h3>
          <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.6 }}>
            {locale === "id"
              ? "Ruang kerja intelijen bersumber. ROCKSOUL JIZZ API."
              : "Source-grounded intelligence workspace. ROCKSOUL JIZZ API."}
          </p>
          <span className={`universe-destination__status ${statusClasses.available}`}>
            {statusLabels.available}
          </span>
        </article>
      </RawContainer>

      {/* Semantic List Fallback */}
      <RawContainer style={{ marginTop: "2rem" }}>
        <RawStack data-gap="tight" role="list" aria-label="Daftar destinasi semantik">
          {destinations.map((dest: Destination) => (
            <article key={dest.id} className="mw-card" role="listitem">
              <RawStack data-gap="tight">
                <RawCluster data-gap="tight">
                  <strong style={{ fontFamily: "var(--mw-font-heading)" }}>{dest.name}</strong>
                  <span className={`universe-destination__status ${statusClasses[dest.status as keyof typeof statusClasses]}`}>
                    {statusLabels[dest.status as keyof typeof statusLabels]}
                  </span>
                </RawCluster>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", fontSize: "0.875rem" }}>{dest.description}</p>
              </RawStack>
            </article>
          ))}
        </RawStack>
      </RawContainer>
    </section>
  );
}
