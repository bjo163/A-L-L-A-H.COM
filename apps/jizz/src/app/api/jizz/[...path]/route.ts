import { NextResponse, type NextRequest } from 'next/server';
import { JizzClientAdapter } from '@/lib/jizz/client';

/**
 * Server-side proxy for the JIZZ upstream observatory API.
 *
 * The upstream key lives in server-only environment variables
 * (JIZZ_API_URL / JIZZ_API_KEY); browsers only ever talk to this
 * same-origin route, so the credential never ships in a bundle.
 * Only a closed set of read-only paths is reachable — this is a
 * proxy, not a general forwarding endpoint.
 */

// The adapter owns the SSRF allowlist; the base url must be present for
// production deployments and defaults to the documented local upstream.
const client = new JizzClientAdapter({
  base_url: process.env.JIZZ_API_URL ?? 'http://localhost:4000',
  api_key: process.env.JIZZ_API_KEY,
});

type Segment = string;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function notFound() {
  return NextResponse.json({ error: 'Unknown jizz resource' }, { status: 404 });
}

// Upstream identifiers are interpolated into the upstream path, so they must
// never carry separators or traversal sequences.
const SAFE_ID = /^[A-Za-z0-9_-]+$/;

async function handle(segments: Segment[], request: NextRequest): Promise<Response> {
  const [head, second, third] = segments;
  const query = request.nextUrl.searchParams;

  if (head === 'phenomena' && segments.length === 1) {
    const limit = Number.parseInt(query.get('limit') ?? '50', 10);
    const offset = Number.parseInt(query.get('offset') ?? '0', 10);
    if (!Number.isFinite(limit) || !Number.isFinite(offset)) return badRequest('limit and offset must be integers');
    const result = await client.listPhenomena(limit, offset);
    return result.success ? NextResponse.json(result.data) : NextResponse.json({ error: result.error }, { status: result.error.statusCode ?? 502 });
  }

  if (head === 'phenomena' && second && (third === 'perspectives' || third === 'signals') && segments.length === 3) {
    if (!SAFE_ID.test(second)) return badRequest('Invalid phenomenon id');
    const result = third === 'perspectives' ? await client.listPerspectives(second) : await client.listSignals(second);
    return result.success ? NextResponse.json(result.data) : NextResponse.json({ error: result.error }, { status: result.error.statusCode ?? 502 });
  }

  if (head === 'phenomena' && second && segments.length === 2) {
    if (!SAFE_ID.test(second)) return badRequest('Invalid phenomenon id');
    const result = await client.getPhenomenon(second);
    return result.success ? NextResponse.json(result.data) : NextResponse.json({ error: result.error }, { status: result.error.statusCode ?? 404 });
  }

  if (head === 'health' && segments.length === 1) {
    return NextResponse.json(await client.healthCheck());
  }

  return notFound();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return handle(path ?? [], request);
}
