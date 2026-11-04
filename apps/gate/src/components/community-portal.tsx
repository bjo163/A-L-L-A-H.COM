'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MotionFrame,
  RawCluster,
  RawContainer,
  RawGrid,
  RawStack,
} from "@moonwitness/ui";
import Link from "next/link";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getDestinations, type Destination } from "@/lib/content-manifest";
import { UsersRound, ShieldCheck, MessageSquare, BookOpen } from "lucide-react";

interface CommunityPortalProps {
  locale?: "id" | "en";
}

export function CommunityPortal({ locale = "id" }: CommunityPortalProps) {
  const { t } = useTranslationCatalog(locale);
  const dock = getDestinations().find((d) => d.id === "dock");

  return (
    <section className="gate-section" aria-labelledby="community-title">
      <div className="gate-section__heading">
        <div>
          <p className="gate-kicker">{t("nav.community")}</p>
          <h2 id="community-title">{t("community.title")}</h2>
        </div>
      </div>

      <MotionFrame effect="enter">
        <RawContainer>
          {/* Purpose */}
          <Card style={{ marginBottom: "2rem" }}>
            <CardHeader>
              <RawCluster data-gap="tight">
                <span style={{ fontFamily: "var(--mw-font-numeric)", color: "var(--mw-accent)" }}>01</span>
                <CardTitle>{locale === "id" ? "Tujuan Komunitas" : "Community Purpose"}</CardTitle>
              </RawCluster>
            </CardHeader>
            <CardContent>
              <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>{t("community.description")}</p>
            </CardContent>
          </Card>

          {/* Participation */}
          <Card style={{ marginBottom: "2rem" }}>
            <CardHeader>
              <RawCluster data-gap="tight">
                <span style={{ fontFamily: "var(--mw-font-numeric)", color: "var(--mw-accent)" }}>02</span>
                <CardTitle>{t("community.participation")}</CardTitle>
              </RawCluster>
            </CardHeader>
            <CardContent>
              <p style={{ margin: "0 0 1rem", color: "var(--mw-muted-text)", lineHeight: 1.7 }}>{t("community.participation")}</p>
              <RawGrid data-gap="regular" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                {[
                  { icon: MessageSquare, label: locale === "id" ? "Diskusi Pemikiran" : "Thoughtful Discussion", desc: locale === "id" ? "Berbagi interpretasi dan pertanyaan" : "Share interpretations and questions" },
                  { icon: BookOpen, label: locale === "id" ? "Kontribusi Bersumber" : "Sourced Contributions", desc: locale === "id" ? "Kutip referensi untuk klaim faktual" : "Cite references for factual claims" },
                  { icon: UsersRound, label: locale === "id" ? "Umpan Balik Konstruktif" : "Constructive Feedback", desc: locale === "id" ? "Bantu meningkatkan karya bersama" : "Help improve collective work" },
                  { icon: ShieldCheck, label: locale === "id" ? "Hormati Pedoman" : "Respect Guidelines", desc: locale === "id" ? "Privasi, tidak spam, bedakan fakta/opini" : "Privacy, no spam, distinguish fact/opinion" },
                ].map((item, i) => (
                  <Card key={i} style={{ textAlign: "center", padding: "1.5rem" }}>
                    <div style={{ margin: "0 auto 1rem", width: "48px", height: "48px", borderRadius: "50%", background: "rgb(211 183 123 / 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mw-accent)" }}>
                      <item.icon size={24} />
                    </div>
                    <h4 style={{ margin: "0 0 0.5rem", fontFamily: "var(--mw-font-heading)" }}>{item.label}</h4>
                    <p style={{ margin: 0, color: "var(--mw-muted-text)", fontSize: "0.875rem" }}>{item.desc}</p>
                  </Card>
                ))}
              </RawGrid>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card style={{ marginBottom: "2rem" }}>
            <CardHeader>
              <RawCluster data-gap="tight">
                <span style={{ fontFamily: "var(--mw-font-numeric)", color: "var(--mw-accent)" }}>03</span>
                <CardTitle>{t("community.guidelines")}</CardTitle>
              </RawCluster>
            </CardHeader>
            <CardContent>
              <RawStack data-gap="regular">
                {[t("community.guideline1"), t("community.guideline2"), t("community.guideline3"), t("community.guideline4"), t("community.guideline5")].map((guideline, i) => (
                  <RawCluster key={i} data-gap="regular" style={{ alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "var(--mw-font-numeric)", color: "var(--mw-accent)", flexShrink: 0 }}>{(i + 1).toString().padStart(2, "0")}</span>
                    <p style={{ margin: 0, color: "var(--mw-text)", lineHeight: 1.6 }}>{guideline}</p>
                  </RawCluster>
                ))}
              </RawStack>
            </CardContent>
          </Card>

          {/* Safety */}
          <Card style={{ marginBottom: "2rem" }}>
            <CardHeader>
              <RawCluster data-gap="tight">
                <span style={{ fontFamily: "var(--mw-font-numeric)", color: "var(--mw-accent)" }}>04</span>
                <CardTitle>{t("community.safety")}</CardTitle>
              </RawCluster>
            </CardHeader>
            <CardContent>
              <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>{t("community.safetyText")}</p>
            </CardContent>
          </Card>

          {/* Entry to Dock */}
          <MotionFrame effect="enter">
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <RawStack data-gap="regular" style={{ maxWidth: "40rem", margin: "0 auto" }}>
                <div>
                  <h3 style={{ margin: "0 0 1rem", fontFamily: "var(--mw-font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
                    {locale === "id" ? "Siap Bergabung?" : "Ready to Join?"}
                  </h3>
                  <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>
                    {locale === "id"
                      ? "Dermaga menunggu suara Anda. Masuk dengan MoonWitness ID untuk mulai berpartisipasi."
                      : "The Dock awaits your voice. Sign in with MoonWitness ID to start participating."}
                  </p>
                </div>
                {dock && (
                  <Button asChild variant="gold" size="lg" style={{ width: "100%" }}>
                    <Link href={dock.href} target="_blank" rel="noopener noreferrer">
                      {t("community.enterDock")}
                    </Link>
                  </Button>
                )}
              </RawStack>
            </div>
          </MotionFrame>
        </RawContainer>
      </MotionFrame>
    </section>
  );
}