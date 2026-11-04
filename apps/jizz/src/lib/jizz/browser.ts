import type { PhenomenonRecord, PerspectiveRecord, SignalRecord } from '@moonwitness/types';

/**
 * Browser-side reader for the JIZZ observatory data.
 *
 * Pages never hold the upstream credential: they call the same-origin
 * proxy route (/api/jizz/…), which runs server-side with the secret.
 * The relative fetch is deliberate — it is the app talking to its own
 * server, not a hub bypass (see UNIVERSAL_SDK_CLIENT).
 */
async function request<T>(path: string, query?: Record<string, string | number>): Promise<T> {
  const search = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) search.set(key, String(value));
  }
  const qs = search.toString();
  const response = await fetch(`/api/jizz/${path}${qs ? `?${qs}` : ''}`);
  if (!response.ok) {
    throw new Error(`Jizz data request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export const jizzBrowser = {
  listPhenomena: (limit = 50, offset = 0) =>
    request<PhenomenonRecord[]>('phenomena', { limit, offset }),
  getPhenomenon: (id: string) =>
    request<PhenomenonRecord>(`phenomena/${encodeURIComponent(id)}`),
  listPerspectives: (phenomenonId: string) =>
    request<PerspectiveRecord[]>(`phenomena/${encodeURIComponent(phenomenonId)}/perspectives`),
  listSignals: (phenomenonId: string) =>
    request<SignalRecord[]>(`phenomena/${encodeURIComponent(phenomenonId)}/signals`),
};
