import type { Metadata } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LinkButton,
  MotionFrame,
  SectionHeading,
  StatePanel,
} from '@moonwitness/ui';
import { formatMbps, formatPrice, getPlans } from '@/lib/isp';

export const metadata: Metadata = {
  title: "Paket Internet | E-ISP",
  description: "Perbandingan kecepatan dan harga paket internet E-ISP.",
};

export default async function PlansPage() {
  const idBase = process.env.NEXT_PUBLIC_ID_URL ?? 'http://localhost:3003';

  let plans = null as Awaited<ReturnType<typeof getPlans>> | null;
  let failed = false;
  try {
    plans = await getPlans();
  } catch {
    failed = true;
  }

  return (
    <MotionFrame effect="enter">
      <section aria-labelledby="esp-plans-title">
        <SectionHeading
          as="h1"
          titleId="esp-plans-title"
          kicker="KATALOG PUBLIK / LANGSUNG"
          title="Paket internet"
          description="Semua paket di bawah datang dari katalog publik E-ISP dan diperbarui otomatis."
        />

        {failed ? (
          <StatePanel
            as="h2"
            kind="error"
            title="Katalog sedang tidak tersedia"
            cause="Kami tidak dapat menghubungi server katalog saat ini."
            nextAction="Silakan coba lagi beberapa saat."
          />
        ) : !plans || plans.length === 0 ? (
          <StatePanel
            as="h2"
            kind="empty"
            title="Belum ada paket publik"
            cause="Paket akan muncul begitu tersedia di daerahmu."
            nextAction="Cek jangkauan untuk status jaringan di lokasimu."
            action={<LinkButton href="/coverage" variant="outline">Cek jangkauan</LinkButton>}
          />
        ) : (
          <div className="esp-grid">
            {plans.map((plan) => (
              <Card as="article" key={plan.slug ?? plan.name}>
                <CardHeader>
                  <div className="esp-result">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge variant="gold">{formatPrice(plan.price, plan.currency)}</Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="esp-spec">
                    <div className="esp-spec__item">
                      <span className="esp-label">Unduh</span>
                      <strong>{formatMbps(plan.download_mbps)} Mbps</strong>
                    </div>
                    <div className="esp-spec__item">
                      <span className="esp-label">Unggah</span>
                      <strong>{formatMbps(plan.upload_mbps)} Mbps</strong>
                    </div>
                    <div className="esp-spec__item">
                      <span className="esp-label">Mata uang</span>
                      <strong>{plan.currency.toUpperCase()}</strong>
                    </div>
                  </div>
                  <p className="esp-label">Pilih &amp; daftar lewat portal pelanggan.</p>
                  <LinkButton
                    href={plan.slug ? `${idBase}/register?plan=${encodeURIComponent(plan.slug)}` : `${idBase}/register`}
                    variant="gold"
                    external
                  >
                    Pilih &amp; daftar
                  </LinkButton>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </MotionFrame>
  );
}
