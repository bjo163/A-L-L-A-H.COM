import type { Metadata } from 'next';
import {
  Badge,
  Button,
  Form,
  FormField,
  Input,
  MotionFrame,
  SectionHeading,
  StatePanel,
} from '@moonwitness/ui';
import type { PublicIspCoverageArea } from '@allah/sdk';
import { getCoverage } from '@/lib/isp';

export const metadata: Metadata = {
  title: "Cek Jangkauan | E-ISP",
  description: "Periksa apakah jaringan fiber E-ISP sudah tersedia di daerahmu.",
};

const statusLabels: Record<PublicIspCoverageArea['status'], string> = {
  available: 'Tersedia',
  coming_soon: 'Segera tersedia',
  planned: 'Dijadwalkan',
  unavailable: 'Belum terjangkau',
};

const statusBadge: Record<PublicIspCoverageArea['status'], 'default' | 'active' | 'gold' | 'revoked'> = {
  available: 'active',
  coming_soon: 'gold',
  planned: 'default',
  unavailable: 'revoked',
};

export default async function CoveragePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = ((await searchParams).q ?? '').trim();

  let areas: PublicIspCoverageArea[] = [];
  let failed = false;
  try {
    areas = await getCoverage(q || undefined);
  } catch {
    failed = true;
  }

  return (
    <MotionFrame effect="enter">
      <section className="esp-section" aria-labelledby="esp-coverage-title">
        <SectionHeading
          as="h1"
          titleId="esp-coverage-title"
          kicker="PETA JANGKAUAN / LANGSUNG"
          title="Cek jangkauan di daerahmu"
          description="Tulis nama daerah, kota, atau kecamatan. Status yang muncul berasal dari data jangkauan publik kami."
        />

        <Form method="get" action="/coverage" layout="row" className="esp-checker">
          <FormField
            label="Daerah, kota, atau kecamatan"
            className="esp-checker__field"
            controlId="esp-coverage-q"
          >
            <Input
              id="esp-coverage-q"
              name="q"
              defaultValue={q}
              placeholder="mis. Bandung, Cileunyi"
              autoComplete="off"
            />
          </FormField>
          <Button type="submit" variant="gold">
            Cek jangkauan
          </Button>
        </Form>

        <div className="esp-results" aria-live="polite">
          {failed ? (
            <StatePanel
              as="h2"
              kind="error"
              title="Gagal memeriksa jangkauan"
              cause="Server katalog tidak dapat dihubungi saat ini."
              nextAction="Silakan coba lagi beberapa saat."
            />
          ) : areas.length === 0 ? (
            <StatePanel
              as="h2"
              kind="empty"
              title={q ? `Tidak ada hasil untuk “${q}”` : 'Belum ada data jangkauan'}
              cause={q ? 'Nama daerah itu belum terdaftar di jaringan publik kami.' : 'Peta jangkauan sedang diperbarui.'}
              nextAction="Coba tulis nama kota atau kecamatan lain."
            />
          ) : (
            <ul className="esp-list">
              {areas.map((area) => (
                <li
                  className="esp-result"
                  key={`${area.slug ?? area.area_name}-${area.city}-${area.district}`}
                >
                  <div className="esp-result__place">
                    <strong>{area.area_name}</strong>
                    <span className="esp-label">
                      {area.district ? `${area.district}, ${area.city}` : area.city}
                    </span>
                    {area.description && <span>{area.description}</span>}
                  </div>
                  <Badge variant={statusBadge[area.status]} dot={area.status === 'available'}>
                    {statusLabels[area.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </MotionFrame>
  );
}
