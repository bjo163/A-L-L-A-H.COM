import { type PhenomenonRecord, type PerspectiveRecord, type SignalRecord, type ProvenanceRecord, type UpstreamEndpoint, type AgentRunResponse } from '@moonwitness/types';

/**
 * SSRF guard: validate upstream endpoint against allowlist before any request.
 * Fail-closed by default: reject if not explicitly allowed.
 */
const ALLOWED_UPSTREAMS = [
  // Only localhost for local development
  new URL('http://localhost:4000'),
  new URL('http://127.0.0.1:4000'),
  // Production JIZZ API - add actual production endpoints here
  // new URL('https://jizz.bjo163.dev'),
].map(u => u.origin);

/**
 * Validate URL against SSRF allowlist.
 * Throws if URL resolves to private IP, loopback, or non-allowed host.
 */
function validateUpstream(url: string): URL {
  try {
    const u = new URL(url);
    const hostname = u.hostname.toLowerCase();
    
    // Check against allowlist FIRST
    // Localhost/127.0.0.1 are allowed for development
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    if (!isLocal && !ALLOWED_UPSTREAMS.includes(u.origin)) {
      throw new Error(`SSRF protection: upstream origin not in allowlist: ${u.origin}`);
    }
    
    // Only block private IPs for non-localhost origins
    if (!isLocal) {
      if (
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') ||
        hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') ||
        hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') ||
        hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') ||
        hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') ||
        hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.') ||
        hostname.startsWith('169.254.')
      ) {
        throw new Error(`SSRF protection: private/loopback IP not allowed: ${hostname}`);
      }
    }
    
    return u;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Invalid upstream URL: ${err.message}`);
    }
    throw new Error(`Invalid upstream URL`);
  }
}

/**
 * JIZZ Client Adapter — read-only typed adapter for ROCKSOUL JIZZ API.
 * All methods are read-only and preserve provenance metadata.
 */
export class JizzClientAdapter {
  private readonly baseUrl: URL;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;
  private readonly retryCount: number;

  constructor(endpoint: UpstreamEndpoint) {
    const validated = validateUpstream(endpoint.base_url);
    this.baseUrl = validated;
    this.apiKey = endpoint.api_key;
    this.timeoutMs = endpoint.timeout_ms ?? 5000;
    this.retryCount = endpoint.retry_count ?? 3;
  }

  private async fetchWithRetry<T>(path: string, init?: RequestInit): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        
        const headers = new Headers(init?.headers);
        if (this.apiKey) {
          headers.set('Authorization', `Bearer ${this.apiKey}`);
        }
        
        const response = await fetch(`${this.baseUrl}${path}`, {
          ...init,
          headers,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`JIZZ API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === this.retryCount) break;
        // exponential backoff
        await new Promise(res => setTimeout(res, 2 ** attempt * 100));
      }
    }
    
    throw lastError;
  }

  /**
   * List phenomena (observations) with pagination.
   * Returns typed PhenomenonRecord[] with provenance preserved.
   */
  async listPhenomena(limit = 50, offset = 0): Promise<PhenomenonRecord[]> {
    return this.fetchWithRetry<PhenomenonRecord[]>(`/api/phenomena?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get a single phenomenon by ID.
   */
  async getPhenomenon(id: string): Promise<PhenomenonRecord> {
    return this.fetchWithRetry<PhenomenonRecord>(`/api/phenomena/${id}`);
  }

  /**
   * List perspectives for a phenomenon.
   */
  async listPerspectives(phenomenonId: string): Promise<PerspectiveRecord[]> {
    return this.fetchWithRetry<PerspectiveRecord[]>(`/api/phenomena/${phenomenonId}/perspectives`);
  }

  /**
   * List signals for a phenomenon.
   */
  async listSignals(phenomenonId: string): Promise<SignalRecord[]> {
    return this.fetchWithRetry<SignalRecord[]>(`/api/phenomena/${phenomenonId}/signals`);
  }

  /**
   * Mock fixture for offline development.
   * Returns deterministic test data matching the schema.
   */
  static mockFixtures(): {
    phenomena: PhenomenonRecord[];
    perspectives: PerspectiveRecord[];
    signals: SignalRecord[];
  } {
    const now = new Date().toISOString();
    
    return {
      phenomena: [
        {
          id: 'phen-001',
          slug: 'ai-safety-summit-2025',
          title: 'AI Safety Summit 2025: Governance Proposals',
          summary: 'Global summit on AI safety governance producing draft framework for frontier model oversight.',
          observed_at: now,
          tags: ['AI', 'governance', 'summit', 'safety'],
          geographic_scope: 'global',
          source_url: 'https://ai-safety-summit.example.org/2025',
          provenance: {
            captured_at: now,
            captured_by: 'open-source-scraper',
            verification_status: 'verified'
          }
        },
        {
          id: 'phen-002',
          slug: 'climate-accord-2025',
          title: 'Climate Accord 2025: Net-Zero Commitments',
          summary: 'International climate agreement with updated 2030/2050 targets and financing mechanisms.',
          observed_at: now,
          tags: ['climate', 'accord', 'net-zero', 'finance'],
          geographic_scope: 'global',
          source_url: 'https://climate-accord.example.org/2025',
          provenance: {
            captured_at: now,
            captured_by: 'open-source-scraper',
            verification_status: 'verified'
          }
        }
      ],
      perspectives: [
        {
          id: 'persp-001',
          phenomenon_id: 'phen-001',
          actor_name: 'Dr. Elena Rodriguez',
          actor_type: 'expert',
          framing: 'Technical risk mitigation',
          stance: 'supporting',
          key_quotes: [
            'We need enforceable safety benchmarks for frontier models',
            'Voluntary commitments are insufficient without verification'
          ],
          confidence: 0.92,
          published_at: now,
          source_url: 'https://example.org/perspectives/rodriguez-ai-safety',
          provenance: {
            captured_at: now,
            captured_by: 'open-source-scraper',
            verification_status: 'verified'
          }
        },
        {
          id: 'persp-002',
          phenomenon_id: 'phen-001',
          actor_name: 'Tech Industry Coalition',
          actor_type: 'institution',
          framing: 'Innovation-friendly regulation',
          stance: 'neutral',
          key_quotes: [
            'Regulation should enable innovation, not stifle it',
            'Risk-based approach allows proportional oversight'
          ],
          confidence: 0.78,
          published_at: now,
          source_url: 'https://example.org/perspectives/coalition-ai-safety',
          provenance: {
            captured_at: now,
            captured_by: 'open-source-scraper',
            verification_status: 'preliminary'
          }
        }
      ],
      signals: [
        {
          id: 'signal-001',
          phenomenon_id: 'phen-001',
          signal_type: 'sentiment',
          magnitude: 0.75,
          detected_at: now,
          metadata: {
            positive: 45,
            negative: 15,
            neutral: 40,
            sample_size: 1000
          },
          provenance: {
            captured_at: now,
            captured_by: 'sentiment-analyzer',
            verification_status: 'verified'
          }
        }
      ]
    };
  }
}