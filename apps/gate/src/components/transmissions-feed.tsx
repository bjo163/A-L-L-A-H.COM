'use client';

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LinkButton,
  MotionFrame,
  PageHero,
  SectionHeading,
  StatePanel,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getFeaturedTransmission, getTransmissions, type Provenance } from "@/lib/content-manifest";

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

function ProvenanceRow({ prov, en, locale }: { prov: Provenance; en: boolean; locale: "id" | "en" }) {
  const date = new Date(prov.date).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const sourceLabel = sourceTypeLabels[prov.sourceType];

  return (
    <div className="gate-provenance">
      <div className="gate-actions">
        <Badge variant="default">{sourceLabel ? (en ? sourceLabel.en : sourceLabel.id) : prov.sourceType}</Badge>
        <span className="gate-num">{prov.reference}</span>
        {prov.edition && <span className="gate-meta">{prov.edition}</span>}
        {prov.translator && <span className="gate-meta">{en ? `Translator: ${prov.translator}` : `Penerjemah: ${prov.translator}`}</span>}
      </div>
      <p className="gate-meta">
        {prov.author} &middot; {date} &middot; {prov.rendering} &middot;{" "}
        <Badge variant={prov.status === "verified" ? "gold" : "revoked"}>
          {prov.status === "verified"
            ? (en ? "Verified" : "Terverifikasi")
            : (en ? prov.status : `Belum terverifikasi (${prov.status})`)}
        </Badge>
      </p>
    </div>
  );
}

export function TransmissionsFeed({ locale = "id" }: TransmissionsFeedProps) {
  const { t } = useTranslationCatalog(locale);
  const en = locale === "en";
  const featured = getFeaturedTransmission();
  const recent = getTransmissions().filter((transmission) => transmission.id !== featured?.id);

  return (
    <>
      {featured && (
        <MotionFrame effect="enter">
          <PageHero
            titleId="featured-transmission-title"
            kicker={t("transmissions.featured")}
            title={featured.title}
            summary={en ? featured.excerptEN : featured.excerptID}
            actions={
              <>
                <Badge variant="gold">{featured.series} &middot; {en ? "Chapter" : "Bab"} {featured.chapter}</Badge>
                <ProvenanceRow prov={featured.provenance} en={en} locale={locale} />
              </>
            }
            media={(
              <div className="gate-figure__plate">
                {en ? `Artwork pending: ${featured.series} ${featured.chapter}` : `Artwork belum disetujui: ${featured.series} ${featured.chapter}`}
              </div>
            )}
            captionLeft={featured.series.toUpperCase()}
            captionRight={`${en ? "Chapter" : "Bab"} ${featured.chapter}`}
          />
        </MotionFrame>
      )}

      <MotionFrame effect="enter">
        <section className="gate-section" aria-labelledby="recent-transmissions-title">
          <SectionHeading
            titleId="recent-transmissions-title"
            kicker={t("transmissions.recent")}
            title={en ? "Recent transmissions" : "Transmisi terbaru"}
          />

          {recent.length > 0 ? (
            <div className="gate-list">
              {recent.map((tx) => (
                <Card as="article" key={tx.id}>
                  <CardHeader>
                    <CardDescription>{tx.series} &middot; {en ? "Ch." : "Bab"} {tx.chapter}</CardDescription>
                    <CardTitle as="h3">{tx.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="gate-copy">{en ? tx.excerptEN : tx.excerptID}</p>
                    <ProvenanceRow prov={tx.provenance} en={en} locale={locale} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="gate-panel">
              <StatePanel
                kind="empty"
                title={en ? "No archived transmissions" : "Belum ada transmisi tersimpan"}
                cause={t("transmissions.emptyState")}
                nextAction={en ? "Browse the story index for published worlds." : "Lihat indeks cerita untuk dunia yang sudah tayang."}
                action={<LinkButton href="/explore" variant="outline">{en ? "Explore story worlds" : "Jelajahi dunia cerita"}</LinkButton>}
              />
            </Card>
          )}
        </section>
      </MotionFrame>
    </>
  );
}
