import 'server-only';
import { createClient, type PublicIspPlan, type PublicIspCoverageArea } from '@allah/sdk';

// The hub origin is server-only. Browsers never reach it: RSC pages read through
// this helper and the coverage checker goes via the same-origin /api/isp proxy.
const hubBaseUrl = () => process.env.ARSY_INTERNAL_URL ?? 'http://localhost:5150';

export async function getPlans(): Promise<PublicIspPlan[]> {
  const client = createClient({ baseUrl: hubBaseUrl() });
  return client.publicIsp.listPlans();
}

export async function getCoverage(query?: string): Promise<PublicIspCoverageArea[]> {
  const client = createClient({ baseUrl: hubBaseUrl() });
  return client.publicIsp.listCoverage(query);
}

export function formatMbps(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency.toUpperCase() === 'IDR' ? 'IDR' : currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value);
}
