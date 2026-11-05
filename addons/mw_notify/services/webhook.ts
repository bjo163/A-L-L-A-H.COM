import { ssrfSafeFetch, validatePublicUrlSsrf } from '@allah/arsy-core';

/**
 * Outbound delivery uses the shared SSRF guard for URL validation and the
 * DNS lookup bound to the socket. Redirects are rejected.
 */

export class NotifySsrfBlockedError extends Error {
  readonly code = 'NOTIFY_SSRF_BLOCKED';
  constructor(reason: string) {
    super(`notify SSRF guard: ${reason}`);
    this.name = 'NotifySsrfBlockedError';
  }
}

/**
 * Throw `NotifySsrfBlockedError` unless `rawUrl` is a public http(s) endpoint.
 * Returns the validated URL string for the caller to use.
 */
export function assertSafeBaseUrl(rawUrl: string): string {
  if (!validatePublicUrlSsrf(rawUrl)) {
    throw new NotifySsrfBlockedError('base_url must target a public HTTP(S) endpoint');
  }
  return new URL(rawUrl).toString();
}

/** Substitute `{{key}}` placeholders from `vars` into a template string. */
export function renderTemplate(text: string, vars: Record<string, unknown>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => String(vars[key] ?? ''));
}

export function isLiveDeliveryEnabled(): boolean {
  return process.env.ARSY_NOTIFY_DELIVERY === 'live';
}

export interface DeliverResult {
  delivered: boolean;
  transport: 'record' | 'http';
  error?: string;
}

/**
 * Deliver one rendered event to its channel. In record mode (default) it writes
 * nothing outbound and returns delivered=true so the dispatch loop can advance
 * the event deterministically; the caller records the render either way.
 */
export async function deliver(
  baseUrl: string | undefined,
  body: Record<string, unknown>,
  bearerToken?: string
): Promise<DeliverResult> {
  if (!isLiveDeliveryEnabled()) {
    return { delivered: true, transport: 'record' };
  }
  if (!baseUrl) {
    return { delivered: false, transport: 'http', error: 'channel has no base_url for live delivery' };
  }
  const safeUrl = assertSafeBaseUrl(baseUrl);
  const response = await ssrfSafeFetch(safeUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(bearerToken ? { authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    return { delivered: false, transport: 'http', error: `endpoint returned HTTP ${response.status}` };
  }
  return { delivered: true, transport: 'http' };
}
