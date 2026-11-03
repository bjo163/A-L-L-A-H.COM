import { request as undiciRequest } from 'undici';
import { validateUrlSsrf } from '../ssrf';
import { logger } from '@allah/arsy-core';
import type { Tool, ToolContext, ToolResult } from './base';

const DEFAULT_MAX_BYTES = 50000;

export class WebFetchTool implements Tool {
  readonly name = 'web_fetch';
  readonly description = 'Fetch an external web page or JSON endpoint with SSRF protection. Only public HTTP/HTTPS URLs are allowed.';
  readonly inputSchema: Record<string, unknown> = {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Target HTTP/HTTPS URL to fetch.',
      },
      max_bytes: {
        type: 'number',
        description: 'Maximum number of bytes to read from the response body.',
        default: DEFAULT_MAX_BYTES,
      },
    },
    required: ['url'],
  };

  async execute(args: Record<string, unknown>, _context?: ToolContext): Promise<ToolResult> {
    const url = typeof args.url === 'string' ? args.url : '';
    const maxBytes = typeof args.max_bytes === 'number' && args.max_bytes > 0 ? args.max_bytes : DEFAULT_MAX_BYTES;

    if (!url) {
      return { success: false, error: 'url is required', output: null };
    }

    if (!validateUrlSsrf(url)) {
      return {
        success: false,
        error: 'SSRF_GUARD: URL blocked (only public http/https URLs are allowed; localhost and private IPs are rejected)',
        output: null,
      };
    }

    try {
      const response = await undiciRequest(url, {
        method: 'GET',
      });

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return {
          success: false,
          error: `Upstream returned HTTP ${response.statusCode}`,
          output: null,
        };
      }

      const chunks: Buffer[] = [];
      let total = 0;
      const body = response.body as any;

      for await (const chunk of body) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        if (total + buf.length > maxBytes) {
          chunks.push(buf.slice(0, maxBytes - total));
          total = maxBytes;
          break;
        }
        chunks.push(buf);
        total += buf.length;
      }

      const content = Buffer.concat(chunks).toString('utf-8');

      return {
        success: true,
        output: {
          url,
          statusCode: response.statusCode,
          contentType: response.headers['content-type'] || '',
          content,
          truncated: total >= maxBytes,
        },
        error: null,
      };
    } catch (err: any) {
      logger.error({ err, url }, 'web_fetch failed');
      return { success: false, error: err.message || 'Web fetch failed', output: null };
    }
  }
}

export const webFetchTool = new WebFetchTool();
