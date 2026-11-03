import { modelRegistry, BaseRepository } from '@allah/arsy-orm';
import { logger } from '@allah/arsy-core';
import type { Tool, ToolContext, ToolResult } from './base';

export class QorpusRetrieveTool implements Tool {
  readonly name = 'qorpus_retrieve';
  readonly description = 'Query knowledge chunks from the MoonWitness Qorpus vector/hybrid search index.';
  readonly inputSchema: Record<string, unknown> = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Question or search terms to match against knowledge chunks.',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of chunks to return.',
        default: 5,
      },
      min_score: {
        type: 'number',
        description: 'Minimum relevance score (0.0 to 1.0).',
        default: 0.7,
      },
    },
    required: ['query'],
  };

  async execute(args: Record<string, unknown>, _context?: ToolContext): Promise<ToolResult> {
    const query = typeof args.query === 'string' ? args.query : '';
    const limit = typeof args.limit === 'number' && args.limit > 0 ? args.limit : 5;
    const minScore = typeof args.min_score === 'number' ? args.min_score : 0.7;

    if (!query.trim()) {
      return { success: false, error: 'query is required', output: null };
    }

    const docModel = modelRegistry.get('qorpus.document');
    const chunkModel = modelRegistry.get('qorpus.chunk');
    if (!docModel || !chunkModel) {
      return {
        success: false,
        error: 'Qorpus models are not registered',
        output: null,
      };
    }

    try {
      const docRepo = new BaseRepository(docModel);
      const chunkRepo = new BaseRepository(chunkModel);

      const docs = (await docRepo.find({ limit: 100 })) as any[];
      const chunks = (await chunkRepo.find({ limit: 1000 })) as any[];

      const queryLower = query.toLowerCase();
      const queryTerms = queryLower.split(/\s+/).filter(Boolean);
      const results: Array<{
        id: any;
        document_title: string;
        content: string;
        score: number;
        category: string;
      }> = [];

      for (const chunk of chunks) {
        const content = chunk.content || '';
        const contentLower = content.toLowerCase();
        let score = 0;
        if (contentLower.includes(queryLower)) score += 0.5;
        for (const term of queryTerms) {
          if (contentLower.includes(term)) score += 0.1;
        }
        if (score >= minScore) {
          const doc = docs.find((d: any) => d.id === chunk.document_id);
          results.push({
            id: chunk.id,
            document_title: doc?.title || 'Unknown',
            content,
            score: Math.min(score, 1.0),
            category: doc?.category || 'unknown',
          });
        }
      }

      results.sort((a, b) => b.score - a.score);
      const top = results.slice(0, limit);

      return {
        success: true,
        output: { query, chunks: top, total: top.length },
        error: null,
      };
    } catch (err: any) {
      logger.error({ err, query }, 'qorpus_retrieve failed');
      return { success: false, error: err.message || 'Knowledge retrieval failed', output: null };
    }
  }
}

export const qorpusRetrieveTool = new QorpusRetrieveTool();
