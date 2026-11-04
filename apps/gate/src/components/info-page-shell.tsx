'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MotionFrame,
  SectionHeading,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";

interface InfoPageShellProps {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  /** The info pages have no other title, so their section heading is the h1. */
  as?: 'h1' | 'h2';
  locale?: "id" | "en";
}

const products = [
  { name: "MoonWitness", roleId: "Cerita & Arsip", roleEn: "Stories & Archive", descId: "Transmisi, dunia cerita, karakter, pengetahuan, linimasa", descEn: "Transmissions, story worlds, characters, knowledge, timeline" },
  { name: "Dock", roleId: "Pelabuhan Komunitas", roleEn: "Community Harbor", descId: "Diskusi, kontribusi, partisipasi bersama (butuh ID)", descEn: "Discussions, contributions, shared participation (requires ID)" },
  { name: "Cockpit", roleId: "Ruang Kerja Pribadi", roleEn: "Personal Workspace", descId: "Alat AI, kerja tersimpan, preferensi (belum diimplementasikan)", descEn: "AI tools, saved work, preferences (not implemented)" },
  { name: "Headquarter", roleId: "Markas Komando", roleEn: "Command Center", descId: "Koordinasi ekosistem terotorisasi (akses terbatas)", descEn: "Authorized ecosystem coordination (restricted)" },
  { name: "Moon UI", roleId: "Bahasa Desain Bersama", roleEn: "Shared Design Language", descId: "Token, komponen, pola, aksesibilitas, primitif interaksi", descEn: "Tokens, components, patterns, accessibility, interaction primitives" },
];

export function InfoPageShell({ title, titleEn, description, descriptionEn, as: Heading = "h1", locale = "id" }: InfoPageShellProps) {
  const { t } = useTranslationCatalog(locale);
  const en = locale === "en";

  return (
    <section className="gate-section" aria-labelledby="info-title">
      <SectionHeading as={Heading} titleId="info-title" kicker={t("nav.about")} title={en ? titleEn : title} />

      <MotionFrame effect="enter">
        <div className="gate-measure">
          <Card as="article">
            <CardHeader>
              <CardTitle as="h2">{en ? "Mission & Vision" : "Misi & Visi"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="gate-lede">{en ? descriptionEn : description}</p>
            </CardContent>
          </Card>

          <Card as="article">
            <CardHeader>
              <CardTitle as="h2">{en ? "A-L-L-A-H Acronym" : "Akronim A-L-L-A-H"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="gate-lede">
                {en
                  ? "A-L-L-A-H is the project acronym: Accountable Life, Learning & Action Hub. This is a technical and governance identity, not the divine referent ALLAH."
                  : "A-L-L-A-H adalah akronim proyek: Accountable Life, Learning & Action Hub. Ini adalah identitas teknis dan governance, bukan referensi ilahi ALLAH."}
              </p>
            </CardContent>
          </Card>

          <Card as="article">
            <CardHeader>
              <CardTitle as="h2">{en ? "MOONWITNESS XV Universe" : "Universe MOONWITNESS XV"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="gate-lede">
                {en
                  ? "MOONWITNESS XV is the story, witness, knowledge, and radio/discovery product within the Empire of the Light. Story worlds include: Manusia Pulpen (origin), AngelWithShotgun (guardian), GGS Full Moon School (learning), Empire of the Light (universe)."
                  : "MOONWITNESS XV adalah platform cerita, saksi, pengetahuan, dan radio/penemuan dalam Empire of the Light. Dunia cerita meliputi: Manusia Pulpen (origin), AngelWithShotgun (guardian), GGS Full Moon School (learning), Empire of the Light (universe)."}
              </p>
              <p className="gate-meta">
                {en
                  ? "Note: ROCKSOUL, MYLUFT, AngelWithShotgun, and GGS are MoonWitness narrative constructs. They are not claimed as prophets, angels, or holders of divine authority."
                  : "Catatan: ROCKSOUL, MYLUFT, AngelWithShotgun, dan GGS adalah konstruksi naratif MoonWitness. Tidak mengklaim tokoh ini sebagai nabi, malaikat, atau memiliki otoritas ilahi."}
              </p>
            </CardContent>
          </Card>

          <Card as="article">
            <CardHeader>
              <CardTitle as="h2">{en ? "Ecosystem Products" : "Produk Ekosistem"}</CardTitle>
            </CardHeader>
            <CardContent>
              {products.map((product) => (
                <div className="gate-rule gate-row" key={product.name}>
                  <strong className="gate-num">{product.name}</strong>
                  <div>
                    <p className="gate-meta">{en ? product.roleEn : product.roleId}</p>
                    <p className="gate-body">{en ? product.descEn : product.descId}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </MotionFrame>
    </section>
  );
}
