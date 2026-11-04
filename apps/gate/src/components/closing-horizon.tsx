'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, MotionFrame, RawStack } from "@moonwitness/ui";
import { useTranslationCatalog } from "@/lib/translation-catalog";

interface ClosingHorizonProps {
  locale?: "id" | "en";
}

export function ClosingHorizon({ locale = "id" }: ClosingHorizonProps) {
  const { t } = useTranslationCatalog(locale);
  const destinations = [
    { id: "universe", label: t("nav.universe"), href: "/universe" },
    { id: "transmissions", label: t("nav.transmissions"), href: "/transmissions" },
    { id: "explore", label: t("nav.explore"), href: "/explore" },
    { id: "community", label: t("nav.community"), href: "/community" },
    { id: "dock", label: t("nav.dock"), href: "https://dock.a-l-l-a-h.com/account", external: true },
    { id: "signin", label: t("journey.anonymous.signIn"), href: "/login", external: false },
  ];

  return (
    <MotionFrame effect="enter">
      <footer className="gate-section" role="contentinfo" aria-labelledby="closing-title">
        <div className="gate-section__heading" style={{ borderTop: "1px solid rgb(205 178 122 / 0.28)", paddingTop: "3rem" }}>
          <div>
            <h2 id="closing-title" style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)" }}>
              {locale === "id" ? "Kembali ke Horizon" : "Return to Horizon"}
            </h2>
          </div>
        </div>

        <blockquote className="gate-section__heading" style={{ maxWidth: "40rem", margin: "0 auto 2rem", textAlign: "center", borderTop: "none", paddingTop: 0 }}>
          <p style={{ margin: 0, color: "#b7b2a7", fontSize: "clamp(1rem, 1.6vw, 1.2rem)", lineHeight: 1.7, fontStyle: "italic" }}>
            "{t("site.footerQuote")}"
          </p>
        </blockquote>

        <nav aria-label="Destinasi ekosistem" className="gate-closing-horizon__destinations">
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              href={dest.href}
              className="group block"
              target={dest.external ? "_blank" : undefined}
              rel={dest.external ? "noopener noreferrer" : undefined}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{dest.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <span style={{ fontFamily: "var(--mw-font-numeric)", color: "var(--mw-accent)" }}>→</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </nav>

        <RawStack gap="tight" style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--mw-border)", textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--mw-muted-text)", fontSize: "0.875rem" }}>
            {locale === "id" ? "A-L-L-A-H.COM — Empire of the Light" : "A-L-L-A-H.COM — Empire of the Light"}
          </p>
          <p style={{ margin: "0.5rem 0 0", color: "var(--mw-muted-text)", fontSize: "0.75rem", fontFamily: "var(--mw-font-numeric)" }}>
            {t("site.slogan")}
          </p>
        </RawStack>
      </footer>
    </MotionFrame>
  );
}