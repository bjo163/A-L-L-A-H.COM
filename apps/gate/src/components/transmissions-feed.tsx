'use client';

import {
  Badge,
  Link,
  MotionFrame,
  RawCluster,
  RawContainer,
  RawGrid,
  RawStack,
} from "@moonwitness/ui";
import Image from "next/image";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getFeaturedTransmission, getTransmissions, type Transmission, type Provenance } from "@/lib/content-manifest";

const sourceTypeLabels: Record<string, { id: string; en: string }> = {
  personal: { id: "Refleksi Pribadi", en: "Personal Reflection" },
  historical: { id: "Sumber Historis", en: "Historical Source" },
  quran: { id: "Al-Qur'an", en: "Qur'an" },
  hadith: { id: "Hadits", en: "Hadith" },
  fictional: { id: "Fiksi", en: "Fiction" },
};

interface TransmissionsFeedProps {
  locale?: "id" | "en";
}

export function TransmissionsFeed({ locale = "id" }: TransmissionsFeedProps) {
  const { t } = useTranslationCatalog(locale);
  const featured = getFeaturedTransmission();
  const recent = getTransmissions().filter((t) => t.id !== featured?.id);

  return (
    <>
      {/* Featured Transmission - Dominant */}
      {featured && (
        <MotionFrame effect="enter">
          <section className="gate-section" aria-labelledby="featured-transmission-title">
            <div className="gate-section__heading">
              <div>
                <p className="gate-kicker">{t("transmissions.featured")}</p>
                <h2 id="featured-transmission-title">{featured.series} · Chapter {featured.chapter}</h2>
              </div>
            </div>

            <RawContainer>
              <RawGrid data-gap="loose" style={{ gridTemplateColumns: "minmax(0, 0.55fr) minmax(0, 1.45fr)" }}>
                <figure style={{ margin: 0, border: "1px solid var(--mw-border)", borderRadius: "var(--mw-surface-radius)", overflow: "hidden", background: "linear-gradient(135deg, var(--mw-surface), var(--mw-elevated-surface))" }}>
                  <div style={{ aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mw-muted-text)", fontFamily: "var(--mw-font-numeric)" }}>
                    {locale === "id" ? "Artwork: AngelWithShotgun Ch.1" : "Artwork: AngelWithShotgun Ch.1"}
                  </div>
                  <figcaption style={{ padding: "1rem", borderTop: "1px solid var(--mw-border)", fontFamily: "var(--mw-font-numeric)", fontSize: "0.75rem", color: "var(--mw-accent)" }}>
                    {featured.series.toUpperCase()} / {featured.chapter}
                  </figcaption>
                </figure>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem", fontFamily: "var(--mw-font-display)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "var(--mw-text)" }}>{featured.title}</h3>
                  
                  {/* Provenance Block - Required */}
                  <div className="mw-card" style={{ margin: "1.5rem 0", padding: "1.5rem" }}>
                    <RawStack data-gap="tight">
                      <RawCluster data-gap="tight" style={{ flexWrap: "wrap" }}>
                        <Badge variant="default">{sourceTypeLabels[featured.provenance.sourceType][locale]}</Badge>
                        <span style={{ fontFamily: "var(--mw-font-numeric)", color: "var(--mw-accent)" }}>{featured.provenance.reference}</span>
                        {featured.provenance.edition && (
                          <span style={{ color: "var(--mw-muted-text)", fontSize: "0.875rem" }}>{featured.provenance.edition}</span>
                        )}
                        {featured.provenance.translator && (
                          <span style={{ color: "var(--mw-muted-text)", fontSize: "0.875rem" }}>{locale === "id" ? "Penerjemah" : "Translator"}: {featured.provenance.translator}</span>
                        )}
                      </RawCluster>
                      <div style={{ fontSize: "0.875rem", color: "var(--mw-muted-text)" }}>
                        <span>{featured.provenance.author}</span>
                        <span style={{ marginInline: "0.5rem" }}>·</span>
                        <time>{new Date(featured.provenance.date).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
                        <span style={{ marginInline: "0.5rem" }}>·</span>
                        <span style={{ textTransform: "capitalize" }}>{featured.provenance.rendering}</span>
                        <span style={{ marginInline: "0.5rem" }}>·</span>
                        <Badge variant={featured.provenance.status === "verified" ? "gold" : "default"}>
                          {featured.provenance.status === "verified" ? (locale === "id" ? "Terverifikasi" : "Verified") : featured.provenance.status}
                        </Badge>
                      </div>
                    </RawStack>
                  </div>

                  <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7, fontSize: "1.125rem" }}>
                    {locale === "id" ? featured.excerptID : featured.excerptEN}
                  </p>
                  <div style={{ marginTop: "2rem" }}>
                    <Link href={featured.proposedRoute} className="gate-hero__link">
                      {t("transmissions.readMore")}
                    </Link>
                  </div>
                </div>
              </RawGrid>
            </RawContainer>
          </section>
        </MotionFrame>
      )}

      {/* Recent Transmissions List */}
      <MotionFrame effect="enter">
        <section className="gate-section" aria-labelledby="recent-transmissions-title">
          <div className="gate-section__heading">
            <div>
              <p className="gate-kicker">{t("transmissions.recent")}</p>
              <h2 id="recent-transmissions-title">{locale === "id" ? "Transmisi Terbaru" : "Recent Transmissions"}</h2>
            </div>
          </div>

          <RawContainer>
            {recent.length > 0 ? (
              <RawStack data-gap="regular" role="list">
                {recent.map((tx) => {
                  const txProv: Provenance = tx.provenance;
                  return (
                    <article key={tx.id} className="mw-card" role="listitem">
                      <RawStack data-gap="regular">
                        <RawCluster data-gap="tight" style={{ flexWrap: "wrap" }}>
                          <Badge variant="default">{sourceTypeLabels[txProv.sourceType][locale]}</Badge>
                          <strong style={{ fontFamily: "var(--mw-font-heading)" }}>{tx.series} · Ch. {tx.chapter}</strong>
                        </RawCluster>
                        <h3 style={{ margin: 0, color: "var(--mw-text)", fontFamily: "var(--mw-font-heading)" }}>{tx.title}</h3>
                        <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.6 }}>
                          {locale === "id" ? tx.excerptID : tx.excerptEN}
                        </p>
                        <div className="mw-raw-stack" data-gap="tight" style={{ fontSize: "0.875rem", color: "var(--mw-muted-text)" }}>
                          <span>{txProv.author} · {new Date(txProv.date).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}</span>
                          <Link href={tx.proposedRoute} className="mw-link mw-link--underline">{t("transmissions.readMore")}</Link>
                        </div>
                      </RawStack>
                    </article>
                  );
                })}
              </RawStack>
            ) : (
              <div className="mw-card" style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>
                  {t("transmissions.emptyState")}
                </p>
                <Link href="/explore" className="gate-hero__link" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
                  {locale === "id" ? "Jelajahi Dunia Cerita" : "Explore Story Worlds"}
                </Link>
              </div>
            )}
          </RawContainer>
        </section>
      </MotionFrame>
    </>
  );
}