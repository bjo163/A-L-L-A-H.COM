'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MotionFrame,
  RawCluster,
  RawContainer,
  RawStack,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";

interface InfoPageShellProps {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  locale?: "id" | "en";
}

export function InfoPageShell({ title, titleEn, description, descriptionEn, locale = "id" }: InfoPageShellProps) {
  const { t } = useTranslationCatalog(locale);

  return (
    <section className="gate-section" aria-labelledby="info-title">
      <div className="gate-section__heading">
        <div>
          <p className="gate-kicker">{t("nav.about")}</p>
          <h1 id="info-title">{locale === "id" ? title : titleEn}</h1>
        </div>
      </div>

      <MotionFrame effect="enter">
        <RawContainer style={{ maxWidth: "48rem" }}>
          <RawStack data-gap="loose">
            <Card as="article">
              <CardHeader>
                <CardTitle as="h2">{locale === "id" ? "Misi & Visi" : "Mission & Vision"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>{locale === "id" ? description : descriptionEn}</p>
              </CardContent>
            </Card>

            <Card as="article">
              <CardHeader>
                <CardTitle as="h2">{locale === "id" ? "Akronim A-L-L-A-H" : "A-L-L-A-H Acronym"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>
                  {locale === "id"
                    ? "A-L-L-A-H adalah akronim proyek: <strong>Accountable Life, Learning & Action Hub</strong>. Ini adalah identitas teknis/governance, bukan referensi ilahi ALLAH."
                    : "A-L-L-A-H is the project acronym: <strong>Accountable Life, Learning & Action Hub</strong>. This is a technical/governance identity, not the divine referent ALLAH."}
                </p>
              </CardContent>
            </Card>

            <Card as="article">
              <CardHeader>
                <CardTitle as="h2">{locale === "id" ? "Universe MOONWITNESS XV" : "MOONWITNESS XV Universe"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ margin: "0 0 1rem", color: "var(--mw-muted-text)", lineHeight: 1.7 }}>
                  {locale === "id"
                    ? "MOONWITNESS XV adalah platform cerita, saksi, pengetahuan, dan radio/penemuan dalam Empire of the Light. Dunia cerita meliputi: Manusia Pulpen (origin), AngelWithShotgun (guardian), GGS Full Moon School (learning), Empire of the Light (universe)."
                    : "MOONWITNESS XV is the story, witness, knowledge, and radio/discovery product within the Empire of the Light. Story worlds include: Manusia Pulpen (origin), AngelWithShotgun (guardian), GGS Full Moon School (learning), Empire of the Light (universe)."}
                </p>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7, fontSize: "0.875rem", fontStyle: "italic" }}>
                  {locale === "id"
                    ? "Catatan: ROCKSOUL, MYLUFT, AngelWithShotgun, GGS adalah konstruksi naratif MoonWitness. Tidak mengklaim tokoh ini sebagai nabi, malaikat, atau memiliki otoritas ilahi."
                    : "Note: ROCKSOUL, MYLUFT, AngelWithShotgun, GGS are MoonWitness narrative constructs. They are not claimed as prophets, angels, or having divine authority."}
                </p>
              </CardContent>
            </Card>

            <Card as="article">
              <CardHeader>
                <CardTitle as="h2">{locale === "id" ? "Produk Ekosistem" : "Ecosystem Products"}</CardTitle>
              </CardHeader>
              <CardContent>
                <RawStack data-gap="regular">
                  {[
                    { name: "MoonWitness", role: locale === "id" ? "Cerita & Arsip" : "Stories & Archive", desc: locale === "id" ? "Transmisi, dunia cerita, karakter, pengetahuan, linimasa" : "Transmissions, story worlds, characters, knowledge, timeline" },
                    { name: "Dock", role: locale === "id" ? "Pelabuhan Komunitas" : "Community Harbor", desc: locale === "id" ? "Diskusi, kontribusi, partisipasi bersama (butuh ID)" : "Discussions, contributions, shared participation (requires ID)" },
                    { name: "Cockpit", role: locale === "id" ? "Ruang Kerja Pribadi" : "Personal Workspace", desc: locale === "id" ? "Alat AI, kerja tersimpan, preferensi (belum diimplementasikan)" : "AI tools, saved work, preferences (not implemented)" },
                    { name: "Headquarter", role: locale === "id" ? "Markas Komando" : "Command Center", desc: locale === "id" ? "Koordinasi ekosistem terotorisasi (akses terbatas)" : "Authorized ecosystem coordination (restricted)" },
                    { name: "Moon UI", role: locale === "id" ? "Bahasa Desain Bersama" : "Shared Design Language", desc: locale === "id" ? "Token, komponen, pola, aksesibilitas, primitif interaksi" : "Tokens, components, patterns, accessibility, interaction primitives" },
                  ].map((product, i) => (
                    <RawCluster key={i} data-gap="regular" style={{ alignItems: "flex-start", padding: "1rem 0", borderTop: i > 0 ? "1px solid var(--mw-border)" : "none" }}>
                      <div style={{ minWidth: "140px", fontFamily: "var(--mw-font-heading)", fontWeight: 600, color: "var(--mw-accent)" }}>{product.name}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "var(--mw-muted-text)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{product.role}</div>
                        <div style={{ color: "var(--mw-text)", fontSize: "0.875rem" }}>{product.desc}</div>
                      </div>
                    </RawCluster>
                  ))}
                </RawStack>
              </CardContent>
            </Card>
          </RawStack>
        </RawContainer>
      </MotionFrame>
    </section>
  );
}
