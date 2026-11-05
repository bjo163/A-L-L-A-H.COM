import 'server-only';
import type { PhenomenonRecord, PerspectiveRecord, SignalRecord, ProvenanceRecord, UpstreamEndpoint } from '@moonwitness/types';

/**
 * SSRF guard: validate upstream endpoint against allowlist before any request.
 * Fail-closed by default: reject if not explicitly allowed.
 */
const ALLOWED_UPSTREAMS = [
  // Local development and the host gateway used by Docker Compose.
  new URL('http://localhost:4000'),
  new URL('http://127.0.0.1:4000'),
  new URL('http://host.docker.internal:4000'),
].map(u => u.origin);

/**
 * Validation result type for API responses.
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: JizzClientError;
};

/**
 * Error categories for JIZZ client operations.
 */
export type JizzClientErrorType =
  | 'ssrf_blocked'
  | 'network_timeout'
  | 'network_error'
  | 'api_error'
  | 'validation_error'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited';

export interface JizzClientError {
  type: JizzClientErrorType;
  message: string;
  retryable: boolean;
  upstream?: string;
  statusCode?: number;
  /** Human-readable cause for UI display */
  cause?: string;
}

/**
 * Specific error instances for common scenarios.
 */
export class SSRFError extends Error {
  public readonly type: JizzClientErrorType = 'ssrf_blocked';
  public readonly retryable: boolean = false;
  public readonly upstream: string;

  constructor(upstream: string) {
    super(`SSRF protection blocked: ${upstream}`);
    this.name = 'SSRFError';
    this.upstream = upstream;
  }
}

export class NetworkTimeoutError extends Error {
  public readonly type: JizzClientErrorType = 'network_timeout';
  public readonly retryable: boolean = true;
  public readonly upstream: string;

  constructor(upstream: string, timeoutMs: number) {
    super(`Network timeout after ${timeoutMs}ms: ${upstream}`);
    this.name = 'NetworkTimeoutError';
    this.upstream = upstream;
    this.message = `Request to ${upstream} timed out after ${timeoutMs}ms`;
  }
}

export class APIError extends Error {
  public readonly type: JizzClientErrorType = 'api_error';
  public readonly retryable: boolean;
  public readonly upstream: string;
  public readonly statusCode: number;

  constructor(status: number, message: string, upstream: string) {
    super(`API error ${status}: ${message}`);
    this.name = 'APIError';
    this.retryable = status >= 500;
    this.upstream = upstream;
    this.statusCode = status;
    this.message = `JIZZ API responded with status ${status}: ${message}`;
  }
}

export class NotFoundError extends Error {
  public readonly type: JizzClientErrorType = 'not_found';
  public readonly retryable: boolean = false;
  public readonly upstream: string;

  constructor(upstream: string, path: string) {
    super(`Not found: ${path} at ${upstream}`);
    this.name = 'NotFoundError';
    this.upstream = upstream;
    this.message = `The requested resource was not found at ${upstream}${path}`;
  }
}

export class UnauthorizedError extends Error {
  public readonly type: JizzClientErrorType = 'unauthorized';
  public readonly retryable: boolean = false;
  public readonly upstream: string;

  constructor(upstream: string) {
    super(`Unauthorized: ${upstream}`);
    this.name = 'UnauthorizedError';
    this.upstream = upstream;
  }
}

export class ForbiddenError extends Error {
  public readonly type: JizzClientErrorType = 'forbidden';
  public readonly retryable: boolean = false;
  public readonly upstream: string;

  constructor(upstream: string) {
    super(`Forbidden: ${upstream}`);
    this.name = 'ForbiddenError';
    this.upstream = upstream;
  }
}

export class RateLimitedError extends Error {
  public readonly type: JizzClientErrorType = 'rate_limited';
  public readonly retryable: boolean = true;
  public readonly upstream: string;

  constructor(upstream: string, retryAfter?: number) {
    super(`Rate limited: ${upstream}${retryAfter ? ` (retry after ${retryAfter}s)` : ''}`);
    this.name = 'RateLimitedError';
    this.upstream = upstream;
    this.message = `JIZZ API rate limited${retryAfter ? `: retry after ${retryAfter}s` : ''}`;
  }
}

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
      throw new SSRFError(u.origin);
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
        throw new SSRFError(hostname);
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
 * Type guard to check if a value is a PhenomenonRecord.
 */
export function isPhenomenonRecord(value: unknown): value is PhenomenonRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'slug' in value &&
    'title' in value &&
    'summary' in value &&
    'observed_at' in value &&
    'tags' in value &&
    'provenance' in value
  );
}

/**
 * Type guard to check if a value is a PerspectiveRecord.
 */
export function isPerspectiveRecord(value: unknown): value is PerspectiveRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'phenomenon_id' in value &&
    'actor_name' in value &&
    'actor_type' in value &&
    'framing' in value &&
    'stance' in value &&
    'key_quotes' in value &&
    'confidence' in value &&
    'published_at' in value &&
    'provenance' in value
  );
}

/**
 * Type guard to check if a value is a SignalRecord.
 */
export function isSignalRecord(value: unknown): value is SignalRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'phenomenon_id' in value &&
    'signal_type' in value &&
    'magnitude' in value &&
    'detected_at' in value &&
    'metadata' in value &&
    'provenance' in value
  );
}

/**
 * Parse and validate API response with type guarding.
 */
async function parseResponse<T>(response: Response): Promise<ValidationResult<T>> {
  const data = response.ok ? response.json() : Promise.reject(new APIError(response.status, response.statusText, ''));

  // For ok responses, try to parse and validate
  if (response.ok) {
    return data.then(json => {
      // Basic validation based on content-type or structure
      if (typeof json === 'object' && json !== null) {
        return { success: true, data: json as T };
      }
      return { success: false, error: { type: 'validation_error', message: 'Invalid response format', retryable: false } };
    });
  }

  return data.catch(err => {
    const apiErr = err as APIError;
    return {
      success: false,
      error: {
        type: apiErr.type || 'api_error',
        message: apiErr.message,
        retryable: apiErr.retryable,
        upstream: apiErr.upstream,
        statusCode: apiErr.statusCode,
      },
    };
  });
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

  /**
   * Fetch with retry logic, exponential backoff, and proper error handling.
   */
  private async fetchWithRetry<T>(path: string, init?: RequestInit): Promise<ValidationResult<T>> {
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
          // Parse specific error types based on status code
          const error: JizzClientError = {
            type: 'api_error',
            message: response.statusText,
            retryable: response.status >= 500,
            upstream: this.baseUrl.origin,
            statusCode: response.status,
          };

          // Map common status codes
          switch (response.status) {
            case 401:
              error.type = 'unauthorized';
              error.retryable = false;
              break;
            case 403:
              error.type = 'forbidden';
              error.retryable = false;
              break;
            case 404:
              error.type = 'not_found';
              error.retryable = false;
              break;
            case 429:
              error.type = 'rate_limited';
              error.retryable = true;
              // Try to get retry-after header
              const retryAfter = response.headers.get('retry-after');
              error.message = `Rate limited: ${this.baseUrl.origin}${
                retryAfter ? ` (retry after ${retryAfter}s)` : ''
              }`;
              break;
            case 500:
            case 502:
            case 503:
            case 504:
              error.type = 'api_error';
              error.retryable = true;
              error.message = `Server error ${response.status}: ${response.statusText}`;
              break;
            default:
              error.retryable = response.status >= 500;
          }

          lastError = new Error(JSON.stringify(error));
          lastError.name = 'JizzClientFetchError';
          continue;
        }

        const data = await response.json();
        return { success: true, data: data as T };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Handle AbortError (timeout)
        if (lastError.name === 'AbortError') {
          return {
            success: false,
            error: {
              type: 'network_timeout',
              message: `Request timed out after ${this.timeoutMs}ms`,
              retryable: true,
              upstream: this.baseUrl.origin,
            },
          };
        }

        // Handle network errors
        if (lastError.name === 'TypeError' || lastError.name === 'DOMException') {
          return {
            success: false,
            error: {
              type: 'network_error',
              message: lastError.message,
              retryable: attempt < this.retryCount,
              upstream: this.baseUrl.origin,
            },
          };
        }
      }

      // Apply exponential backoff (except after last attempt)
      if (attempt < this.retryCount) {
        await new Promise(res => setTimeout(res, 2 ** attempt * 100));
      }
    }

    // Return the last error as a ValidationResult
    if (lastError) {
      const err = lastError as { name?: string; message: string };
      return {
        success: false,
        error: {
          type: err.name === 'JizzClientFetchError' ? 'api_error' : 'network_error',
          message: err.message,
          retryable: true,
          upstream: this.baseUrl.origin,
        },
      };
    }

    return {
      success: false,
      error: {
        type: 'network_error',
        message: 'Unknown fetch error',
        retryable: false,
        upstream: this.baseUrl.origin,
      },
    };
  }

  /**
   * List phenomena (observations) with pagination.
   * Returns typed PhenomenonRecord[] with provenance preserved.
   */
  async listPhenomena(limit = 50, offset = 0): Promise<ValidationResult<PhenomenonRecord[]>> {
    return this.fetchWithRetry<PhenomenonRecord[]>(`/api/phenomena?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get a single phenomenon by ID.
   */
  async getPhenomenon(id: string): Promise<ValidationResult<PhenomenonRecord>> {
    return this.fetchWithRetry<PhenomenonRecord>(`/api/phenomena/${id}`);
  }

  /**
   * List perspectives for a phenomenon.
   */
  async listPerspectives(phenomenonId: string): Promise<ValidationResult<PerspectiveRecord[]>> {
    return this.fetchWithRetry<PerspectiveRecord[]>(`/api/phenomena/${phenomenonId}/perspectives`);
  }

  /**
   * List signals for a phenomenon.
   */
  async listSignals(phenomenonId: string): Promise<ValidationResult<SignalRecord[]>> {
    return this.fetchWithRetry<SignalRecord[]>(`/api/phenomena/${phenomenonId}/signals`);
  }

  /**
   * Health check - verify upstream is reachable.
   */
  async healthCheck(): Promise<{ healthy: boolean; upstream: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const result = await this.fetchWithRetry<{ status: string }>('/health', {
        method: 'GET',
      });
      const latency = Date.now() - start;

      if (result.success && result.data?.status === 'ok') {
        return { healthy: true, upstream: this.baseUrl.origin, latencyMs: latency };
      }
      return { healthy: false, upstream: this.baseUrl.origin, latencyMs: latency };
    } catch (err) {
      const latency = Date.now() - start;
      return { healthy: false, upstream: this.baseUrl.origin, latencyMs: latency };
    }
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
            verification_status: 'verified',
          },
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
            verification_status: 'verified',
          },
        },
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
            'Voluntary commitments are insufficient without verification',
          ],
          confidence: 0.92,
          published_at: now,
          source_url: 'https://example.org/perspectives/rodriguez-ai-safety',
          provenance: {
            captured_at: now,
            captured_by: 'open-source-scraper',
            verification_status: 'verified',
          },
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
            'Risk-based approach allows proportional oversight',
          ],
          confidence: 0.78,
          published_at: now,
          source_url: 'https://example.org/perspectives/coalition-ai-safety',
          provenance: {
            captured_at: now,
            captured_by: 'open-source-scraper',
            verification_status: 'preliminary',
          },
        },
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
            sample_size: 1000,
          },
          provenance: {
            captured_at: now,
            captured_by: 'sentiment-analyzer',
            verification_status: 'verified',
          },
        },
      ],
    };
  }
}

export function createJizzClientFromEnvironment(
  env: {
    JIZZ_API_URL: string | undefined;
    JIZZ_API_KEY: string | undefined;
  } = {
    JIZZ_API_URL: process.env.JIZZ_API_URL,
    JIZZ_API_KEY: process.env.JIZZ_API_KEY,
  },
): JizzClientAdapter {
  const baseUrl = env.JIZZ_API_URL?.trim() || 'http://localhost:4000';
  return new JizzClientAdapter({
    base_url: baseUrl,
    api_key: env.JIZZ_API_KEY,
  });
}