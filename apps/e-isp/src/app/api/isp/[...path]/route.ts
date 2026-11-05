import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@allah/sdk';

/**
 * Same-origin, read-only proxy for the public ISP catalog served by ARSY.
 *
 * The hub lives behind a server-only origin (ARSY_INTERNAL_URL); browsers only
 * ever talk to this route, so the upstream is never exposed and no credential
 * ships to the client. Only a closed set of GET paths is reachable — this is a
 * proxy, not a general forwarding endpoint.
 */
const hub = () => createClient({ baseUrl: process.env.ARSY_INTERNAL_URL ?? 'http://localhost:5150' });

function notFound() {
  return NextResponse.json({ error: 'Unknown ISP resource' }, { status: 404 });
}

async function handle(segments: string[], request: NextRequest): Promise<Response> {
  const [head] = segments;

  if (head === 'plans' && segments.length === 1) {
    return NextResponse.json(await hub().publicIsp.listPlans());
  }

  if (head === 'coverage' && segments.length === 1) {
    const query = request.nextUrl.searchParams.get('q') ?? undefined;
    return NextResponse.json(await hub().publicIsp.listCoverage(query));
  }

  return notFound();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  try {
    const { path } = await params;
    return await handle(path ?? [], request);
  } catch {
    return NextResponse.json({ error: 'Upstream catalog unavailable' }, { status: 502 });
  }
}
