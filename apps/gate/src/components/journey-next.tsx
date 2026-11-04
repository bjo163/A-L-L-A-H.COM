'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  LinkButton,
  MotionFrame,
  SectionHeading,
  StatePanel,
  resolveEcosystemEndpoints,
  useEcosystemSession,
  type IconName,
} from "@moonwitness/ui";
import { mwClient } from "@allah/sdk";
import { useTranslationCatalog } from "@/lib/translation-catalog";

interface JourneyNextProps {
  locale?: "id" | "en";
}

interface JourneyAction {
  icon: IconName;
  label: string;
  description: string;
  href?: string;
  external?: boolean;
  variant?: "default" | "gold";
}

const sessionAuth = {
  getCurrentUser: () => mwClient.auth.getCurrentUser(),
  signOut: () => mwClient.auth.signOut(),
};

export function JourneyNext({ locale = "id" }: JourneyNextProps) {
  const { t } = useTranslationCatalog(locale);
  const en = locale === "en";
  const endpoints = resolveEcosystemEndpoints(process.env);
  const { user, loading, notice } = useEcosystemSession(sessionAuth);

  const anonymousActions: JourneyAction[] = [
    { icon: "compass", label: en ? "Explore the archive" : "Jelajahi arsip", description: en ? "Public stories and transmissions, no account needed." : "Cerita dan transmisi publik tanpa akun.", href: "/explore" },
    { icon: "users-round", label: en ? "Learn the community" : "Pelajari komunitas", description: en ? "How participation, sourcing, and feedback work here." : "Cara berpartisipasi, menyumberkan, dan memberi umpan balik.", href: "/community" },
    { icon: "settings", label: t("journey.anonymous.signIn"), description: en ? "Needed only for a personal workspace." : "Dibutuhkan hanya untuk ruang kerja pribadi.", href: `${endpoints.id}${endpoints.signInPath}`, external: true, variant: "gold" },
  ];

  const signedInActions: JourneyAction[] = [
    { icon: "layout-dashboard", label: t("journey.signedIn.cockpit"), description: en ? "AI tools, saved work, and preferences." : "Alat AI, kerja tersimpan, dan preferensi." },
    { icon: "book-open", label: t("journey.signedIn.saved"), description: en ? "Transmissions and research you kept." : "Transmisi dan penelitian yang Anda simpan." },
    { icon: "settings", label: t("journey.signedIn.account"), description: en ? "Manage the account and its active sessions." : "Kelola akun dan sesi aktif.", href: `${endpoints.id}${endpoints.accountPath}`, external: true },
  ];

  const actions = user ? signedInActions : anonymousActions;

  return (
    <section className="gate-section" aria-labelledby="journey-title">
      <SectionHeading titleId="journey-title" kicker={t("nav.journey")} title={t("journey.title")} />

      <MotionFrame effect="enter">
        {loading ? (
          <StatePanel
            kind="loading"
            label={t("common.loading")}
            cause={en ? "Checking for a signed-in MoonWitness ID." : "Memeriksa MoonWitness ID yang sedang masuk."}
          />
        ) : notice ? (
          <StatePanel
            kind="error"
            label={t("common.error")}
            cause={notice}
            nextAction={en ? "Refresh the page to check the session again." : "Muat ulang halaman untuk memeriksa sesi kembali."}
          />
        ) : (
          <>
            <div className="gate-tease">
              <SectionHeading
                title={user
                  ? (en ? `Welcome back, ${user.name}` : `Selamat datang kembali, ${user.name}`)
                  : t("journey.anonymous.title")}
                description={user
                  ? (en ? "Choose a destination below." : "Pilih tujuan Anda di bawah.")
                  : (en
                    ? "Explore public stories, learn about the community, or sign in when you need a personal workspace."
                    : "Jelajahi cerita publik, pelajari komunitas, atau masuk saat butuh ruang kerja pribadi.")}
              />
              <Badge variant={user ? "active" : "default"} dot>
                {user ? (en ? "Session active" : "Sesi aktif") : (en ? "Browsing as guest" : "Masih sebagai tamu")}
              </Badge>
            </div>

            <div className="gate-auto-grid">
              {actions.map((action) => (
                <Card as="article" key={action.label} className="gate-tile">
                  <span className={action.href ? "gate-tile__mark" : "gate-tile__mark gate-tile__mark--blocked"} aria-hidden="true">
                    <Icon name={action.icon} size={28} />
                  </span>
                  <CardHeader>
                    <CardTitle>{action.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="gate-meta">{action.description}</p>
                  </CardContent>
                  {action.href ? (
                    <LinkButton
                      href={action.href}
                      external={action.external}
                      variant={action.variant === "gold" ? "gold" : "outline"}
                      size="lg"
                      className="gate-actions__start"
                    >
                      {en ? (user ? "Open" : "Begin") : (user ? "Buka" : "Mulai")}
                    </LinkButton>
                  ) : (
                    <Button variant="ghost" size="lg" disabled>
                      {en ? "Not available yet" : "Belum tersedia"}
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            <p className="gate-rule">
              {en
                ? "No recent activity or history is shown here. Every shortcut above points at a route that exists."
                : "Tidak ada aktivitas terbaru atau riwayat di sini. Setiap pintasan di atas menunjuk ke rute yang benar-benar ada."}
            </p>
          </>
        )}
      </MotionFrame>
    </section>
  );
}
