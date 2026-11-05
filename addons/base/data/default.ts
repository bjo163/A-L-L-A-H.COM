/**
 * Odoo-style default data for the `base` addon.
 *
 * These are the platform-owned reference records (company_id 0) that make a
 * fresh install usable: the ISO country registry, common currencies, and the
 * language catalog the i18n layer reads. Every row here is a real-world fact or
 * an editable configuration record (an operator can add/hide rows per tenant),
 * not fabricated content. Keyed on the model's natural unique field so seeding
 * is idempotent.
 */

export interface DefaultCountry {
  code: string;
  name: string;
  phone_code: string;
}

export interface DefaultCurrency {
  name: string;
  symbol: string;
  rate: number;
  decimal_places: number;
}

export interface DefaultLang {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  date_format: string;
  time_format: string;
  decimal_separator: string;
  thousands_separator: string;
}

// A representative ISO 3166-1 alpha-2 set covering the platform's operating
// regions plus the common trading partners. `code` is unique on res.country.
export const DEFAULT_COUNTRIES: DefaultCountry[] = [
  { code: 'ID', name: 'Indonesia', phone_code: '+62' },
  { code: 'MY', name: 'Malaysia', phone_code: '+60' },
  { code: 'SG', name: 'Singapore', phone_code: '+65' },
  { code: 'TH', name: 'Thailand', phone_code: '+66' },
  { code: 'VN', name: 'Vietnam', phone_code: '+84' },
  { code: 'PH', name: 'Philippines', phone_code: '+63' },
  { code: 'AU', name: 'Australia', phone_code: '+61' },
  { code: 'IN', name: 'India', phone_code: '+91' },
  { code: 'CN', name: 'China', phone_code: '+86' },
  { code: 'JP', name: 'Japan', phone_code: '+81' },
  { code: 'KR', name: 'South Korea', phone_code: '+82' },
  { code: 'AE', name: 'United Arab Emirates', phone_code: '+971' },
  { code: 'SA', name: 'Saudi Arabia', phone_code: '+966' },
  { code: 'GB', name: 'United Kingdom', phone_code: '+44' },
  { code: 'DE', name: 'Germany', phone_code: '+49' },
  { code: 'FR', name: 'France', phone_code: '+33' },
  { code: 'NL', name: 'Netherlands', phone_code: '+31' },
  { code: 'US', name: 'United States', phone_code: '+1' },
  { code: 'CA', name: 'Canada', phone_code: '+1' },
  { code: 'BR', name: 'Brazil', phone_code: '+55' },
];

// Working currencies with a neutral 1.0 base rate the operator maintains;
// `name` (ISO 4217 code) is unique on res.currency.
export const DEFAULT_CURRENCIES: DefaultCurrency[] = [
  { name: 'IDR', symbol: 'Rp', rate: 1, decimal_places: 0 },
  { name: 'USD', symbol: '$', rate: 1, decimal_places: 2 },
  { name: 'EUR', symbol: '€', rate: 1, decimal_places: 2 },
  { name: 'SGD', symbol: 'S$', rate: 1, decimal_places: 2 },
  { name: 'MYR', symbol: 'RM', rate: 1, decimal_places: 2 },
  { name: 'AUD', symbol: 'A$', rate: 1, decimal_places: 2 },
  { name: 'GBP', symbol: '£', rate: 1, decimal_places: 2 },
  { name: 'JPY', symbol: '¥', rate: 1, decimal_places: 0 },
];

// The language catalog the i18n endpoints read; `code` is unique on res.lang.
export const DEFAULT_LANGS: DefaultLang[] = [
  {
    code: 'en_US',
    name: 'English (US)',
    direction: 'ltr',
    date_format: '%m/%d/%Y',
    time_format: '%H:%M:%S',
    decimal_separator: '.',
    thousands_separator: ',',
  },
  {
    code: 'id_ID',
    name: 'Bahasa Indonesia',
    direction: 'ltr',
    date_format: '%d/%m/%Y',
    time_format: '%H:%M:%S',
    decimal_separator: ',',
    thousands_separator: '.',
  },
  {
    code: 'ar_001',
    name: 'Arabic',
    direction: 'rtl',
    date_format: '%d/%m/%Y',
    time_format: '%H:%M:%S',
    decimal_separator: '.',
    thousands_separator: ',',
  },
];

/**
 * A small platform UI-string catalog (`type: 'ui'`, company_id 0, res_id 0). The
 * i18n `GET /v1/i18n/terms/:lang` endpoint reads these so a fresh install has a
 * translated shell before any tenant override is synced. Keyed on
 * `(lang, name, type)` for idempotent seeding; `name` is the term key, `src` the
 * English source, `value` the translation. Tenants add their own override rows
 * without touching these platform-owned records.
 */
export interface DefaultUiTranslation {
  lang: string;
  name: string;
  src: string;
  value: string;
}

export const DEFAULT_UI_TRANSLATIONS: DefaultUiTranslation[] = [
  { lang: 'id_ID', name: 'action.save', src: 'Save', value: 'Simpan' },
  { lang: 'id_ID', name: 'action.cancel', src: 'Cancel', value: 'Batal' },
  { lang: 'id_ID', name: 'action.delete', src: 'Delete', value: 'Hapus' },
  { lang: 'id_ID', name: 'action.search', src: 'Search', value: 'Cari' },
  { lang: 'id_ID', name: 'nav.dashboard', src: 'Dashboard', value: 'Dasbor' },
  { lang: 'id_ID', name: 'nav.settings', src: 'Settings', value: 'Pengaturan' },
  { lang: 'ar_001', name: 'action.save', src: 'Save', value: 'حفظ' },
  { lang: 'ar_001', name: 'action.cancel', src: 'Cancel', value: 'إلغاء' },
  { lang: 'ar_001', name: 'action.delete', src: 'Delete', value: 'حذف' },
  { lang: 'ar_001', name: 'action.search', src: 'Search', value: 'بحث' },
  { lang: 'ar_001', name: 'nav.dashboard', src: 'Dashboard', value: 'لوحة القيادة' },
  { lang: 'ar_001', name: 'nav.settings', src: 'Settings', value: 'الإعدادات' },
];

// Default model access control records (company_id 0).
// Key on (model_name, group_id) for idempotent seeding.
export interface DefaultModelAccess {
  model_name: string;
  group_id: number;
  perm_read: boolean;
  perm_write: boolean;
  perm_create: boolean;
  perm_unlink: boolean;
}

export const DEFAULT_MODEL_ACCESS: DefaultModelAccess[] = [
  {
    model_name: 'res.company',
    group_id: 0,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'res.currency',
    group_id: 0,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'res.country',
    group_id: 0,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'res.lang',
    group_id: 0,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'res.partner',
    group_id: 0,
    perm_read: true,
    perm_write: true,
    perm_create: true,
    perm_unlink: false,
  },
  {
    model_name: 'res.users',
    group_id: 0,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'ir.ui.view',
    group_id: 0,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'ir.translation',
    group_id: 0,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'ir.model.access',
    group_id: 0,
    perm_read: true,
    perm_write: true,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'ir.rule',
    group_id: 0,
    perm_read: true,
    perm_write: true,
    perm_create: false,
    perm_unlink: false,
  },
];

// Default record rule entries (company_id 0).
// Key on (model_name, global) for idempotent seeding.
// `domain_force` is a JSON-encoded Polish-notation DomainNode (the same shape
// `search()` compiles), never raw SQL: the ORM parses and parameterizes it
// through the shared domain compiler, so a rule can only ever narrow rows.
export interface DefaultRule {
  model_name: string;
  name: string;
  domain_force: string;
  group_ids: number[];
  global: boolean;
  perm_read: boolean;
  perm_write: boolean;
  perm_create: boolean;
  perm_unlink: boolean;
}

// Platform-owned catalogs live on the shared tenant (company_id 0), so a global
// rule pins their visibility to company 0. Each value is a DomainNode leaf
// serialized to JSON; the compiler rejects anything it cannot parse (fail closed).
export const DEFAULT_RULE: DefaultRule[] = [
  {
    model_name: 'res.company',
    name: 'Company access',
    domain_force: '["company_id","=",0]',
    group_ids: [],
    global: true,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'res.currency',
    name: 'Currency access',
    domain_force: '["company_id","=",0]',
    group_ids: [],
    global: true,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'res.country',
    name: 'Country access',
    domain_force: '["company_id","=",0]',
    group_ids: [],
    global: true,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'res.lang',
    name: 'Language access',
    domain_force: '["company_id","=",0]',
    group_ids: [],
    global: true,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'res.partner',
    name: 'Partner active only',
    domain_force: '["active","=",true]',
    group_ids: [],
    global: true,
    perm_read: true,
    perm_write: true,
    perm_create: true,
    perm_unlink: false,
  },
  {
    model_name: 'res.users',
    name: 'User active only',
    domain_force: '["active","=",true]',
    group_ids: [],
    global: true,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
  {
    model_name: 'ir.translation',
    name: 'Translation completed only',
    domain_force: '["state","=","translated"]',
    group_ids: [],
    global: true,
    perm_read: true,
    perm_write: false,
    perm_create: false,
    perm_unlink: false,
  },
];
