/**
 * Locale-safe formatters and error text shared by every Headquarter control page.
 * Dates and numbers resolve against an explicit `en-US` locale so the instrument
 * readouts stay stable across the runtime, matching the app's `lang="en"`.
 */

const LOCALE = 'en-US';

export function describeError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return 'The request could not be completed.';
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return 'Not reported';
  return new Intl.NumberFormat(LOCALE).format(value);
}

export function formatUsd(value: number | null | undefined, digits = 4): string {
  if (value == null || Number.isNaN(value)) return 'Not reported';
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatMs(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return 'Not reported';
  return `${new Intl.NumberFormat(LOCALE).format(value)} ms`;
}

/** Full, human-readable timestamp. Falls back to an honest label, never a blank. */
export function formatTime(value: string | number | Date | null | undefined): string {
  const date = value instanceof Date ? value : value == null ? null : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'medium' }).format(date);
}

/** Clock-only time, for dense log rows. */
export function formatClock(value: string | number | Date | null | undefined): string {
  const date = value instanceof Date ? value : value == null ? null : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat(LOCALE, { timeStyle: 'medium' }).format(date);
}
