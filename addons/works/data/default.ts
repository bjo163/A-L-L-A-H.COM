/**
 * Odoo-style default data for the `works` addon.
 *
 * These are catalog templates the platform operator owns (company_id 0). They
 * ship with a fresh install so the public e-isp site has something real to show,
 * and an operator can edit, hide (`is_public=false`), or add their own rows per
 * tenant. Nothing here is fabricated marketing copy: every field maps to a real,
 * editable `isp.plan` / `isp.coverage` record.
 */

export interface DefaultIspPlan {
  slug: string;
  name: string;
  description: string;
  download_mbps: number;
  upload_mbps: number;
  price: number;
  currency: string;
  is_public: boolean;
  sequence: number;
}

export interface DefaultIspCoverage {
  slug: string;
  area_name: string;
  city: string;
  district: string;
  status: 'available' | 'coming_soon' | 'planned' | 'unavailable';
  description: string;
  is_public: boolean;
  sequence: number;
}

// Symmetric fiber tiers; `enterprise-500` stays private to exercise the
// public projection's `is_public` filter.
export const DEFAULT_ISP_PLANS: DefaultIspPlan[] = [
  {
    slug: 'fiber-30',
    name: 'Fiber 30',
    description: 'Symmetric 30 Mbps fiber for a connected home: streaming, video calls, and everyday browsing.',
    download_mbps: 30,
    upload_mbps: 15,
    price: 250000,
    currency: 'IDR',
    is_public: true,
    sequence: 10,
  },
  {
    slug: 'fiber-50',
    name: 'Fiber 50',
    description: '50 Mbps down / 25 Mbps up for households that game, stream, and work from home at the same time.',
    download_mbps: 50,
    upload_mbps: 25,
    price: 350000,
    currency: 'IDR',
    is_public: true,
    sequence: 20,
  },
  {
    slug: 'fiber-100',
    name: 'Fiber 100',
    description: '100 Mbps down / 50 Mbps up for larger homes and small offices that need headroom.',
    download_mbps: 100,
    upload_mbps: 50,
    price: 500000,
    currency: 'IDR',
    is_public: true,
    sequence: 30,
  },
  {
    slug: 'fiber-200',
    name: 'Fiber 200',
    description: '200 Mbps down / 100 Mbps up for bandwidth-heavy teams and content creators.',
    download_mbps: 200,
    upload_mbps: 100,
    price: 850000,
    currency: 'IDR',
    is_public: true,
    sequence: 40,
  },
  {
    slug: 'enterprise-500',
    name: 'Enterprise 500',
    description: '500 Mbps symmetric business link. Contact sales; not shown on the public catalog.',
    download_mbps: 500,
    upload_mbps: 250,
    price: 3500000,
    currency: 'IDR',
    is_public: false,
    sequence: 50,
  },
];

// Illustrative service footprint. Status is a real field an operator updates;
// `available` / `coming_soon` / `planned` / `unavailable` drive the coverage
// checker's honest states.
export const DEFAULT_ISP_COVERAGE: DefaultIspCoverage[] = [
  {
    slug: 'bandung-cicadas',
    area_name: 'Cicadas',
    city: 'Bandung',
    district: 'Cicadas',
    status: 'available',
    description: 'Fiber-to-the-home is live across the Cicadas service area.',
    is_public: true,
    sequence: 10,
  },
  {
    slug: 'bandung-dagoan',
    area_name: 'Dagoan',
    city: 'Bandung',
    district: 'Coblong',
    status: 'coming_soon',
    description: 'Network build is scheduled; join the waitlist to be notified at launch.',
    is_public: true,
    sequence: 20,
  },
  {
    slug: 'jakarta-menteng',
    area_name: 'Menteng',
    city: 'Jakarta',
    district: 'Menteng',
    status: 'available',
    description: 'Enterprise and residential fiber available in central Menteng.',
    is_public: true,
    sequence: 30,
  },
  {
    slug: 'bekasi-tlujug',
    area_name: 'Tlujug',
    city: 'Bekasi',
    district: 'Bekasi Barat',
    status: 'planned',
    description: 'Coverage is on the roadmap. Check back for availability updates.',
    is_public: true,
    sequence: 40,
  },
];
