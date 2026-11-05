// Self-contained test - no external @moonwitness/types import to avoid server-only issues
// Types are validated by `pnpm typecheck` at compile time

import assert from 'node:assert/strict';
import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import {
  JizzClientAdapter,
  isPhenomenonRecord,
  isPerspectiveRecord,
  isSignalRecord,
  SSRFError,
  createJizzClientFromEnvironment,
} from './client';

// Local type definitions matching @moonwitness/types contracts
interface UpstreamEndpoint {
  base_url: string;
  api_key?: string;
  timeout_ms?: number;
  retry_count?: number;
}

interface ProvenanceRecord {
  captured_at: string;
  captured_by: string;
  verification_status: 'verified' | 'preliminary' | 'unverified';
  source_url?: string;
}

interface PhenomenonRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  observed_at: string;
  tags: string[];
  geographic_scope?: 'global' | 'regional' | 'local';
  source_url?: string;
  provenance: ProvenanceRecord;
}

interface PerspectiveRecord {
  id: string;
  phenomenon_id: string;
  actor_name: string;
  actor_type: 'expert' | 'institution' | 'journalist' | 'citizen' | 'ai';
  framing: string;
  stance: 'supporting' | 'opposing' | 'neutral' | 'critical';
  key_quotes: string[];
  confidence: number;
  published_at: string;
  source_url?: string;
  provenance: ProvenanceRecord;
}

interface SignalRecord {
  id: string;
  phenomenon_id: string;
  signal_type: 'volume' | 'sentiment' | 'emergence' | 'anomaly' | 'trend';
  magnitude: number;
  detected_at: string;
  metadata: Record<string, unknown>;
  provenance: ProvenanceRecord;
}

const mockEndpoint: UpstreamEndpoint = {
  base_url: 'http://localhost:4000',
  api_key: 'test-key',
  timeout_ms: 5000,
  retry_count: 2,
};

const mockPhenomena: PhenomenonRecord[] = [
  {
    id: 'phen-001',
    slug: 'ai-safety-summit-2025',
    title: 'AI Safety Summit 2025: Governance Proposals',
    summary: 'Global summit on AI safety governance.',
    observed_at: '2025-11-01T00:00:00Z',
    tags: ['AI', 'governance'],
    geographic_scope: 'global',
    provenance: {
      captured_at: '2025-11-01T00:00:00Z',
      captured_by: 'test-scraper',
      verification_status: 'verified',
    },
  },
];

const mockPerspectives: PerspectiveRecord[] = [
  {
    id: 'persp-001',
    phenomenon_id: 'phen-001',
    actor_name: 'Dr. Elena Rodriguez',
    actor_type: 'expert',
    framing: 'Technical risk mitigation',
    stance: 'supporting',
    key_quotes: ['We need benchmarks'],
    confidence: 0.92,
    published_at: '2025-11-01T00:00:00Z',
    provenance: {
      captured_at: '2025-11-01T00:00:00Z',
      captured_by: 'test-scraper',
      verification_status: 'verified',
    },
  },
];

const mockSignals: SignalRecord[] = [
  {
    id: 'signal-001',
    phenomenon_id: 'phen-001',
    signal_type: 'sentiment',
    magnitude: 0.75,
    detected_at: '2025-11-01T00:00:00Z',
    metadata: { sample_size: 1000 },
    provenance: {
      captured_at: '2025-11-01T00:00:00Z',
      captured_by: 'test-analyzer',
      verification_status: 'verified',
    },
  },
];

function createMockResponse(data: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

describe('JizzClientAdapter', () => {
  let client: JizzClientAdapter;
  let fetchMock: ReturnType<typeof mock.method>;

  beforeEach(() => {
    client = new JizzClientAdapter(mockEndpoint);
    fetchMock = mock.method(globalThis, 'fetch', async () => createMockResponse([]));
  });

  afterEach(() => {
    fetchMock.mock.restore();
  });

  describe('constructor & SSRF protection', () => {
    test('allows localhost URLs', () => {
      const c = new JizzClientAdapter(mockEndpoint);
      assert.ok(c);
    });

    test('allows the configured Docker Compose host gateway', () => {
      const c = new JizzClientAdapter({
        ...mockEndpoint,
        base_url: 'http://host.docker.internal:4000',
      });
      assert.ok(c);
    });

    test('uses the local default when the runtime URL is blank', () => {
      const c = createJizzClientFromEnvironment({ JIZZ_API_URL: '  ', JIZZ_API_KEY: '' });
      assert.ok(c);
    });

    test('rejects non-allowlisted origins', () => {
      assert.throws(
        () => new JizzClientAdapter({ ...mockEndpoint, base_url: 'https://evil.com' }),
        /SSRF protection/
      );
    });

    test('rejects private IP ranges', () => {
      const blocked = [
        'http://10.0.0.1',
        'http://192.168.1.1',
        'http://172.16.0.1',
        'http://169.254.1.1',
      ];
      for (const url of blocked) {
        assert.throws(
          () => new JizzClientAdapter({ ...mockEndpoint, base_url: url }),
          /SSRF protection/
        );
      }
    });

    test('rejects invalid URL format', () => {
      assert.throws(
        () => new JizzClientAdapter({ ...mockEndpoint, base_url: 'not-a-url' }),
        /Invalid upstream URL/
      );
    });
  });

  describe('listPhenomena', () => {
    test('fetches phenomena with correct query params', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse(mockPhenomena));
      const result = await client.listPhenomena(10, 20);

      assert.equal(fetchMock.mock.calls[0].arguments[0], 'http://localhost:4000/api/phenomena?limit=10&offset=20');
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.length, 1);
        assert.equal(result.data[0].id, 'phen-001');
      }
    });

    test('returns not_found on 404', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse({ error: 'Not found' }, 404));
      const result = await client.listPhenomena();
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.type, 'not_found');
        assert.equal(result.error.retryable, false);
      }
    });

    test('handles 500 as retryable API error', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse({ error: 'Internal' }, 500));
      const result = await client.listPhenomena();
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.type, 'api_error');
        assert.equal(result.error.retryable, true);
      }
    });

    test('handles network errors', async () => {
      fetchMock.mock.mockImplementation(async () => { throw new TypeError('fetch failed'); });
      const result = await client.listPhenomena();
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.type, 'network_error');
      }
    });

    test('handles timeout via AbortError', async () => {
      fetchMock.mock.mockImplementation(async () => { throw new DOMException('Aborted', 'AbortError'); });
      const result = await client.listPhenomena();
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.type, 'network_timeout');
        assert.equal(result.error.retryable, true);
      }
    });

    test('sets Authorization header when apiKey provided', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse([]));
      await client.listPhenomena();
      const init = fetchMock.mock.calls[0].arguments[1] as RequestInit;
      const headers = init.headers as Headers;
      assert.equal(headers.get('Authorization'), 'Bearer test-key');
    });
  });

  describe('getPhenomenon', () => {
    test('fetches a single phenomenon by ID', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse(mockPhenomena[0]));
      const result = await client.getPhenomenon('phen-001');
      assert.equal(fetchMock.mock.calls[0].arguments[0], 'http://localhost:4000/api/phenomena/phen-001');
      assert.equal(result.success, true);
    });

    test('returns not_found for missing ID', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse({}, 404));
      const result = await client.getPhenomenon('nonexistent');
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.type, 'not_found');
      }
    });
  });

  describe('listPerspectives', () => {
    test('fetches perspectives for a phenomenon', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse(mockPerspectives));
      const result = await client.listPerspectives('phen-001');
      assert.equal(fetchMock.mock.calls[0].arguments[0], 'http://localhost:4000/api/phenomena/phen-001/perspectives');
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.length, 1);
      }
    });

    test('handles 401 as unauthorized', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse({}, 401));
      const result = await client.listPerspectives('phen-001');
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.type, 'unauthorized');
        assert.equal(result.error.retryable, false);
      }
    });

    test('handles 403 as forbidden', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse({}, 403));
      const result = await client.listPerspectives('phen-001');
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.type, 'forbidden');
      }
    });
  });

  describe('listSignals', () => {
    test('fetches signals for a phenomenon', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse(mockSignals));
      const result = await client.listSignals('phen-001');
      assert.equal(fetchMock.mock.calls[0].arguments[0], 'http://localhost:4000/api/phenomena/phen-001/signals');
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.length, 1);
      }
    });

    test('handles 429 as rate_limited', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse({}, 429, { 'retry-after': '60' }));
      const result = await client.listSignals('phen-001');
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.type, 'rate_limited');
        assert.equal(result.error.retryable, true);
      }
    });
  });

  describe('healthCheck', () => {
    test('reports healthy when /health returns ok', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse({ status: 'ok' }));
      const result = await client.healthCheck();
      assert.equal(result.healthy, true);
      assert.equal(result.upstream, 'http://localhost:4000');
      assert.equal(typeof result.latencyMs, 'number');
    });

    test('reports unhealthy on error', async () => {
      fetchMock.mock.mockImplementation(async () => { throw new TypeError('fetch failed'); });
      const result = await client.healthCheck();
      assert.equal(result.healthy, false);
    });
  });

  describe('fetchWithRetry', () => {
    test('retries on transient failures', async () => {
      fetchMock.mock
        .mockImplementationOnce(async () => { throw new TypeError('temporary'); })
        .mockImplementationOnce(async () => createMockResponse(mockPhenomena));

      const result = await client.listPhenomena();
      assert.equal(fetchMock.mock.calls.length, 2);
      assert.equal(result.success, true);
    });

    test('gives up after retryCount retries', async () => {
      fetchMock.mock.mockImplementation(async () => { throw new TypeError('persistent'); });
      const result = await client.listPhenomena();
      assert.equal(fetchMock.mock.calls.length, 3); // initial + 2 retries
      assert.equal(result.success, false);
    });

    test('does not retry on 404', async () => {
      fetchMock.mock.mockImplementation(async () => createMockResponse({}, 404));
      await client.getPhenomenon('missing');
      assert.equal(fetchMock.mock.calls.length, 1); // 404 is non-retryable
    });

    test('retries on 500', async () => {
      fetchMock.mock
        .mockImplementationOnce(async () => createMockResponse({}, 500))
        .mockImplementationOnce(async () => createMockResponse(mockPhenomena));
      const result = await client.listPhenomena();
      assert.equal(fetchMock.mock.calls.length, 2);
      assert.equal(result.success, true);
    });
  });

  describe('mockFixtures', () => {
    test('returns valid phenomena fixtures', () => {
      const { phenomena } = JizzClientAdapter.mockFixtures();
      assert.equal(phenomena.length, 2);
      assert.equal(phenomena[0].id, 'phen-001');
      assert.equal(phenomena[0].slug, 'ai-safety-summit-2025');
      assert.ok(phenomena[0].tags.includes('AI'));
      for (const p of phenomena) {
        assert.equal(isPhenomenonRecord(p), true);
      }
    });

    test('returns valid perspective fixtures', () => {
      const { perspectives } = JizzClientAdapter.mockFixtures();
      assert.equal(perspectives.length, 2);
      assert.equal(perspectives[0].id, 'persp-001');
      assert.equal(perspectives[0].actor_type, 'expert');
      assert.equal(perspectives[0].stance, 'supporting');
      assert.equal(perspectives[0].confidence, 0.92);
      for (const p of perspectives) {
        assert.equal(isPerspectiveRecord(p), true);
      }
    });

    test('returns valid signal fixtures', () => {
      const { signals } = JizzClientAdapter.mockFixtures();
      assert.equal(signals.length, 1);
      assert.equal(signals[0].id, 'signal-001');
      assert.equal(signals[0].signal_type, 'sentiment');
      assert.equal(signals[0].magnitude, 0.75);
      for (const s of signals) {
        assert.equal(isSignalRecord(s), true);
      }
    });
  });
});

describe('Type guards', () => {
  test('isPhenomenonRecord returns true for valid record', () => {
    assert.equal(isPhenomenonRecord(mockPhenomena[0]), true);
  });

  test('isPhenomenonRecord returns false for invalid input', () => {
    assert.equal(isPhenomenonRecord(null), false);
    assert.equal(isPhenomenonRecord(undefined), false);
    assert.equal(isPhenomenonRecord({}), false);
    assert.equal(isPhenomenonRecord({ id: 'x' }), false);
  });

  test('isPerspectiveRecord returns true for valid record', () => {
    assert.equal(isPerspectiveRecord(mockPerspectives[0]), true);
  });

  test('isPerspectiveRecord returns false for invalid input', () => {
    assert.equal(isPerspectiveRecord(null), false);
    assert.equal(isPerspectiveRecord({}), false);
  });

  test('isSignalRecord returns true for valid record', () => {
    assert.equal(isSignalRecord(mockSignals[0]), true);
  });

  test('isSignalRecord returns false for invalid input', () => {
    assert.equal(isSignalRecord(null), false);
    assert.equal(isSignalRecord({}), false);
  });
});

describe('SSRFError', () => {
  test('has correct name and type', () => {
    const err = new SSRFError('https://evil.com');
    assert.equal(err.name, 'SSRFError');
    assert.equal((err as any).type, 'ssrf_blocked');
    assert.equal((err as any).retryable, false);
    assert.ok(err.message.includes('https://evil.com'));
  });
});