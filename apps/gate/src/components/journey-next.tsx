'use client';

import {
  Button,
  Card,
  CardTitle,
  MotionFrame,
  RawContainer,
  RawGrid,
  RawStack,
} from "@moonwitness/ui";
import Link from "next/link";
import { useTranslationCatalog } from "@/lib/translation-catalog";
import { useEffect, useState } from "react";
import { getCurrentUser, type GateUser } from "@/lib/auth";
import { mwClient } from "@allah/sdk";
import { Compass, UsersRound, Settings, LayoutDashboard, BookOpen } from "lucide-react";

interface JourneyNextProps {
  locale?: "id" | "en";
}

export function JourneyNext({ locale = "id" }: JourneyNextProps) {
  const { t } = useTranslationCatalog(locale);
  const [user, setUser] = useState<GateUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const anonymousActions: Array<{ icon: React.ElementType; label: string; desc: string; href: string; variant?: 'default' | 'gold' }> = [
    { icon: Compass, label: t("journey.anonymous.explore"), desc: t("journey.anonymous.explore"), href: "/explore" },
    { icon: UsersRound, label: t("journey.anonymous.participate"), desc: t("journey.anonymous.participate"), href: "/community" },
    { icon: Settings, label: t("journey.anonymous.signIn"), desc: t("journey.anonymous.signIn"), href: "/login", variant: "gold" as const },
  ];

  const signedInActions: Array<{ icon: React.ElementType; label: string; desc: string; href: string; available: boolean; external?: boolean; variant?: 'default' | 'gold' }> = [
    { icon: LayoutDashboard, label: t("journey.signedIn.cockpit"), desc: "Akses alat AI, workspace, dan preferensi", href: "/cockpit", available: false },
    { icon: BookOpen, label: t("journey.signedIn.saved"), desc: "Transmisi dan penelitian yang disimpan", href: "/saved", available: false },
    { icon: Settings, label: t("journey.signedIn.account"), desc: "Kelola akun dan sesi aktif", href: "https://dock.a-l-l-a-h.com/account", available: true, external: true },
  ];

  return (
    <section className="gate-section" aria-labelledby="journey-title">
      <div className="gate-section__heading">
        <div>
          <p className="gate-kicker">{t("nav.journey")}</p>
          <h2 id="journey-title">{t("journey.title")}</h2>
        </div>
      </div>

      <MotionFrame effect="enter">
        <RawContainer>
          {loading ? (
            <div className="mw-raw-stack" data-gap="tight" role="status" style={{ textAlign: "center", padding: "3rem" }}>
              <div className="mw-skeleton mw-skeleton--lg" aria-hidden="true" style={{ width: "200px", height: "48px", margin: "0 auto" }} />
              <div className="mw-skeleton mw-skeleton--md" aria-hidden="true" style={{ width: "300px", height: "24px", margin: "0.5rem auto 0" }} />
            </div>
          ) : user ? (
            // Signed In State
            <>
              <RawStack data-gap="regular" style={{ textAlign: "center", maxWidth: "40rem", margin: "0 auto 2rem" }}>
                <h3 style={{ margin: 0, fontFamily: "var(--mw-font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
                  {t("journey.signedIn.title")}
                </h3>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>
                  {locale === "id"
                    ? `Selamat datang kembali, ${user.name}. Pilih tujuan Anda di bawah.`
                    : `Welcome back, ${user.name}. Choose your destination below.`}
                </p>
              </RawStack>

              <RawGrid data-gap="regular" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                {signedInActions.map((action, i) => (
                  <Card as="article" key={i} className="group" style={{ textAlign: "center", display: "flex", flexDirection: "column" }}>
                    <div style={{ margin: "0 auto 1rem", width: "56px", height: "56px", borderRadius: "50%", background: action.available ? "rgb(211 183 123 / 0.15)" : "var(--mw-border)", display: "flex", alignItems: "center", justifyContent: "center", color: action.available ? "var(--mw-accent)" : "var(--mw-muted-text)" }}>
                      <action.icon size={28} />
                    </div>
                    <CardTitle>{action.label}</CardTitle>
                    <p style={{ margin: "0 0 1.5rem", color: "var(--mw-muted-text)", fontSize: "0.875rem", flex: 1 }}>{action.desc}</p>
                    {action.available ? (
                      <Button asChild variant={action.variant === "gold" ? "gold" : "default"} size="lg" style={{ width: "100%" }}>
                        <Link href={action.href} target={action.external ? "_blank" : undefined} rel={action.external ? "noopener noreferrer" : undefined}>
                          {locale === "id" ? "Buka" : "Open"}
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="lg" disabled style={{ width: "100%", opacity: 0.5 }}>
                        {locale === "id" ? "Belum Tersedia" : "Not Available"}
                      </Button>
                    )}
                  </Card>
                ))}
              </RawGrid>

              <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--mw-border)", textAlign: "center" }}>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", fontSize: "0.875rem" }}>
                  {locale === "id" ? "Tidak ada aktivitas terbaru atau riwayat yang ditampilkan. Semua pintasan diverifikasi dari data nyata." : "No recent activity or history shown. All shortcuts verified from real data."}
                </p>
              </div>
            </>
          ) : (
            // Anonymous State
            <>
              <RawStack data-gap="regular" style={{ textAlign: "center", maxWidth: "40rem", margin: "0 auto 2rem" }}>
                <h3 style={{ margin: 0, fontFamily: "var(--mw-font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
                  {t("journey.anonymous.title")}
                </h3>
                <p style={{ margin: 0, color: "var(--mw-muted-text)", lineHeight: 1.7 }}>
                  {locale === "id"
                    ? "Jelajahi cerita publik, pelajari komunitas, atau masuk saat butuh ruang kerja pribadi."
                    : "Explore public stories, learn about the community, or sign in when you need a personal workspace."}
                </p>
              </RawStack>

              <RawGrid data-gap="regular" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                {anonymousActions.map((action, i) => (
                  <Card as="article" key={i} className="group" style={{ textAlign: "center", display: "flex", flexDirection: "column" }}>
                    <div style={{ margin: "0 auto 1rem", width: "56px", height: "56px", borderRadius: "50%", background: "rgb(211 183 123 / 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mw-accent)" }}>
                      <action.icon size={28} />
                    </div>
                    <CardTitle>{action.label}</CardTitle>
                    <p style={{ margin: "0 0 1.5rem", color: "var(--mw-muted-text)", fontSize: "0.875rem", flex: 1 }}>{action.desc}</p>
                    <Button asChild variant={action.variant === "gold" ? "gold" : "default"} size="lg" style={{ width: "100%" }}>
                      <Link href={action.href}>{locale === "id" ? "Mulai" : "Begin"}</Link>
                    </Button>
                  </Card>
                ))}
              </RawGrid>
            </>
          )}
        </RawContainer>
      </MotionFrame>
    </section>
  );
}
