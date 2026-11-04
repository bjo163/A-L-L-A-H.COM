'use client';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LinkButton,
  MotionFrame,
  SectionHeading,
} from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { getDestinations } from "@/lib/content-manifest";
import { UsersRound, ShieldCheck, MessageSquare, BookOpen } from "lucide-react";

interface CommunityPortalProps {
  locale?: "id" | "en";
}

export function CommunityPortal({ locale = "id" }: CommunityPortalProps) {
  const { t } = useTranslationCatalog(locale);
  const en = locale === "en";
  const dock = getDestinations().find((destination) => destination.id === "dock");

  const participation = [
    { icon: MessageSquare, label: en ? "Thoughtful discussion" : "Diskusi pemikiran", desc: en ? "Share interpretations and questions" : "Berbagi interpretasi dan pertanyaan" },
    { icon: BookOpen, label: en ? "Sourced contributions" : "Kontribusi bersumber", desc: en ? "Cite references for factual claims" : "Kutip referensi untuk klaim faktual" },
    { icon: UsersRound, label: en ? "Constructive feedback" : "Umpan balik konstruktif", desc: en ? "Help improve the collective work" : "Bantu meningkatkan karya bersama" },
    { icon: ShieldCheck, label: en ? "Respect the guidelines" : "Hormati pedoman", desc: en ? "Privacy, no spam, separate fact from opinion" : "Privasi, tanpa spam, bedakan fakta dan opini" },
  ];

  const guidelines = [
    t("community.guideline1"),
    t("community.guideline2"),
    t("community.guideline3"),
    t("community.guideline4"),
    t("community.guideline5"),
  ];

  return (
    <section className="gate-section" aria-labelledby="community-title">
      <SectionHeading titleId="community-title" kicker={t("nav.community")} title={t("community.title")} />

      <MotionFrame effect="enter">
        <Card as="article">
          <CardHeader>
            <span className="gate-num">01</span>
            <CardTitle>{en ? "Community purpose" : "Tujuan komunitas"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="gate-lede">{t("community.description")}</p>
          </CardContent>
        </Card>

        <Card as="article">
          <CardHeader>
            <span className="gate-num">02</span>
            <CardTitle>{t("community.participation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="gate-auto-grid">
              {participation.map((item) => (
                <div className="gate-tile" key={item.label}>
                  <span className="gate-tile__mark" aria-hidden="true">
                    <item.icon size={24} />
                  </span>
                  <p className="gate-body">{item.label}</p>
                  <p className="gate-meta">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card as="article">
          <CardHeader>
            <span className="gate-num">03</span>
            <CardTitle>{t("community.guidelines")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="gate-list">
              {guidelines.map((guideline, i) => (
                <li className="gate-row" key={guideline}>
                  <span className="gate-num">{(i + 1).toString().padStart(2, "0")}</span>
                  <p className="gate-body">{guideline}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card as="article">
          <CardHeader>
            <span className="gate-num">04</span>
            <CardTitle>{t("community.safety")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="gate-lede">{t("community.safetyText")}</p>
          </CardContent>
        </Card>

        <div className="gate-tease">
          <SectionHeading
            title={en ? "Ready to join?" : "Siap bergabung?"}
            description={en
              ? "The Dock awaits your voice. Sign in with a MoonWitness ID to start participating."
              : "Dermaga menunggu suara Anda. Masuk dengan MoonWitness ID untuk mulai berpartisipasi."}
          />
          {dock && (
            <LinkButton href={dock.href} variant="gold" size="lg" external>
              {t("community.enterDock")}
            </LinkButton>
          )}
          <Badge variant="default">{en ? "Dock requires an ID" : "Dermaga membutuhkan ID"}</Badge>
        </div>
      </MotionFrame>
    </section>
  );
}
