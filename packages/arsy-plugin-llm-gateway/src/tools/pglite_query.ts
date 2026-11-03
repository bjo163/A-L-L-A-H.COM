import { dbEngine } from '@allah/arsy-orm';
import { logger } from '@allah/arsy-core';
import type { Tool, ToolContext, ToolResult } from './base';

const MUTATING_KEYWORDS = [
  'DROP',
  'DELETE',
  'UPDATE',
  'INSERT',
  'ALTER',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'CREATE',
  'MERGE',
];

export class PgLiteQueryTool implements Tool {
  readonly name = 'pglite_query';
  readonly description = 'Execute a safe, parameterized read-only SQL query against the embedded PGlite database.';
  readonly inputSchema: Record<string, unknown> = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'SQL SELECT query to execute. Only read-only statements are permitted.',
      },
      params: {
        type: 'array',
        description: 'Optional parameterized values bound to $1, $2, etc. in the query.',
        items: {},
      },
    },
    required: ['query'],
  };

  async execute(args: Record<string, unknown>, _context?: ToolContext): Promise<ToolResult> {
    const query = typeof args.query === 'string' ? args.query : '';
    const params = Array.isArray(args.params) ? args.params : [];

    if (!query.trim()) {
      return { success: false, error: 'query is required', output: null };
    }

    const upperQuery = query.toUpperCase();

    // Reject state-mutating / DDL / DCL keywords anywhere in the statement
    for (const kw of MUTATING_KEYWORDS) {
      const regex = new RegExp(`\\b${kw}\\b`);
      if (regex.test(upperQuery)) {
        return {
          success: false,
          error: `UNSAFE_SQL_QUERY: '${kw}' statements are not permitted by the read-only guard`,
          output: null,
        };
      }
    }

    // Must begin with SELECT (read-only enforcement)
    const trimmed = query.trimStart();
    if (!/^SELECT\b/i.test(trimmed)) {
      return {
        success: false,
        error: 'UNSAFE_SQL_QUERY: only SELECT statements are permitted',
        output: null,
      };
    }

    try {
      const rows = (await dbEngine.query(query, params)) as unknown[];
      return { success: true, output: { rows, rowCount: rows.length }, error: null };
    } catch (err: any) {
      logger.error({ err, query }, 'pglite_query execution failed');
      return { success: false, error: err.message || 'SQL query execution failed', output: null };
    }
  }
}

export const pgliteQueryTool = new PgLiteQueryTool();
