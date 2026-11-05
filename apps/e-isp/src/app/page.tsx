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
  WorldArtwork,
} from '@moonwitness/ui';
import { formatMbps, formatPrice, getPlans } from '@/lib/isp';

const steps = [
  { index: '01', title: 'Cek jangkauan', body: 'Masukkan nama daerah atau kota untuk melihat apakah jaringan kami sudah tersedia di lokasi kamu.' },
  { index: '02', title: 'Pilih paket', body: 'Bandingkan kecepatan unduh/unggah dan harga, lalu pilih paket yang sesuai pemakaian rumah atau bisnismu.' },
  { index: '03', title: 'Daftar & pasang', body: 'Buat akun, ajukan pemasangan, dan tim kami menjadwalkan instalasi di alamatmu.' },
];

export default async function EispHome() {
  const idBase = process.env.NEXT_PUBLIC_ID_URL ?? 'http://localhost:3003';

  let plans = null as Awaited<ReturnType<typeof getPlans>> | null;
  let failed = false;
  try {
    plans = await getPlans();
  } catch {
    failed = true;
  }

  return (
    <>
      <MotionFrame effect="enter">
        <PageHero
          as="h1"
          titleId="esp-title"
          kicker="E-ISP / JARINGAN FIBER"
          title="Internet cepat & stabil untuk rumah dan bisnis"
          summary="Lihat paket yang tersedia dan cek jangkauan di daerahmu. Harga transparan, tanpa biaya tersembunyi."
          actions={
            <>
              <LinkButton href="/coverage" variant="gold">Cek jangkauan</LinkButton>
              <LinkButton href="/plans" variant="outline">Lihat paket</LinkButton>
            </>
          }
          media={<WorldArtwork skin="rocksoul" />}
          mediaLayout="backdrop"
          captionLeft="E-ISP / KATALOG PUBLIK"
          captionRight="ROCKSOUL"
        />
      </MotionFrame>

      <MotionFrame effect="enter">
        <section className="esp-section" aria-labelledby="esp-steps-title">
          <SectionHeading
            titleId="esp-steps-title"
            kicker="CARA BERLANGGANAN"
            title="Tiga langkah untuk terhubung"
          />
          <div className="esp-steps">
            {steps.map((step) => (
              <Card as="article" key={step.index}>
                <CardHeader>
                  <span className="esp-step__index">{step.index}</span>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.body}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </MotionFrame>

      <MotionFrame effect="enter">
        <section className="esp-section" aria-labelledby="esp-featured-title">
          <SectionHeading
            titleId="esp-featured-title"
            kicker="KATALOG LANGSUNG"
            title="Paket unggulan"
            description="Data ini datang langsung dari katalog publik E-ISP, bukan angka hiasan."
            trailing={<LinkButton href="/plans" variant="ghost">Semua paket</LinkButton>}
          />

          {failed ? (
            <StatePanel
              as="h3"
              kind="error"
              title="Katalog sedang tidak tersedia"
              cause="Kami tidak dapat menghubungi server katalog saat ini."
              nextAction="Coba lagi beberapa saat, atau cek jangkauan terlebih dahulu."
            />
          ) : !plans || plans.length === 0 ? (
            <StatePanel
              as="h3"
              kind="empty"
              title="Belum ada paket publik"
              cause="Paket akan muncul begitu tersedia di daerahmu."
              nextAction="Cek jangkauan untuk tahu status jaringan di lokasimu."
            />
          ) : (
            <div className="esp-grid">
              {plans.slice(0, 3).map((plan) => (
                <Card as="article" key={plan.slug ?? plan.name}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
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
                    </div>
                    <p className="esp-price">
                      <Badge variant="gold">{formatPrice(plan.price, plan.currency)}</Badge>
                      <span className="esp-label">per bulan</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </MotionFrame>

      <MotionFrame effect="enter">
        <section className="esp-band" aria-labelledby="esp-band-title">
          <SectionHeading
            titleId="esp-band-title"
            kicker="SUDAH SIAP?"
            title="Buat akun untuk memasang layanan"
            description="Pendaftaran, penjadwalan instalasi, dan penagihan berlangsung lewat portal pelanggan."
          />
          <LinkButton href={`${idBase}/register`} variant="gold" external>
            Daftar sekarang
          </LinkButton>
        </section>
      </MotionFrame>
    </>
  );
}
