'use client';

import { useState } from 'react';
import { mwClient } from '@allah/sdk';
import type { GatewayTelemetry } from '@moonwitness/types';
import { Button, Card, Form, Input, RouteShell, StatePanel } from '@moonwitness/ui';
import { RouteHeader } from '@/components/route-header';
import { useAsyncData } from '@/lib/use-async-data';
import { useDocumentTitle } from '@/lib/use-document-title';
import { formatMs, formatNumber, formatUsd } from '@/lib/hq-format';

interface KnowledgeChunk {
  id: number | string;
  document_title: string;
  category: string;
  content: string;
  score: number;
}

function isKnowledgeResponse(value: unknown): value is { chunks: KnowledgeChunk[] } {
  if (typeof value !== 'object' || value === null || !('chunks' in value)) return false;
  const chunks = value.chunks;

  return Array.isArray(chunks) && chunks.every((chunk: unknown) => {
    if (typeof chunk !== 'object' || chunk === null) return false;
    return (
      'id' in chunk &&
      (typeof chunk.id === 'number' || typeof chunk.id === 'string') &&
      'document_title' in chunk &&
      typeof chunk.document_title === 'string' &&
      'category' in chunk &&
      typeof chunk.category === 'string' &&
      'content' in chunk &&
      typeof chunk.content === 'string' &&
      'score' in chunk &&
      typeof chunk.score === 'number'
    );
  });
}

export default function KnowledgePage() {
  useDocumentTitle('Knowledge Explorer | Headquarter');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KnowledgeChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: telemetry, loading: telemetryLoading, error: telemetryError } =
    useAsyncData<GatewayTelemetry>(() => mwClient.router.getTelemetry());

  const search = async () => {
    const term = query.trim();
    if (!term || loading) return;

    setLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const response: unknown = await mwClient.qorpus.search({ query: term, limit: 10 });
      if (!isKnowledgeResponse(response)) {
        throw new Error('The knowledge service returned an unexpected response.');
      }
      setResults(response.chunks);
    } catch (error) {
      setResults([]);
      setSearchError(error instanceof Error ? error.message : 'Knowledge search failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteShell as="main" className="hq-route hq-knowledge">
      <RouteHeader title="Knowledge Explorer" summary="Qorpus index — search indexed records and inspect gateway telemetry." />

      <Card className="p-4">
        <Form
          layout="grid"
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            label="Search the connected knowledge base"
            placeholder="Search indexed records"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void search();
              }
            }}
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? 'Searching…' : 'Search'}
          </Button>
        </Form>
      </Card>

      <div className="hq-content-grid">
        <section aria-labelledby="knowledge-results-title">
          <Card className="p-4">
            <h2 id="knowledge-results-title" className="text-lg font-semibold mb-4">Search Results</h2>

            <div aria-live="polite">
              {searchError ? (
                <StatePanel kind="error" title="Search failed" cause={searchError} nextAction="Adjust the query or retry once the knowledge service is reachable." />
              ) : loading ? (
                <StatePanel kind="loading" title="Searching indexed records" cause="Reading matching chunks from Qorpus." />
              ) : results.length === 0 ? (
                <StatePanel
                  kind="empty"
                  title={hasSearched ? 'No records matched' : 'No search yet'}
                  cause={hasSearched ? 'This query returned no indexed chunks.' : 'Enter a search term to inspect indexed records.'}
                  nextAction={hasSearched ? 'Try a broader term or a different phrasing.' : undefined}
                />
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <article key={result.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="font-medium">{result.document_title}</h3>
                        <span className="shrink-0 text-sm text-muted-foreground">Score: {(result.score * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Category: {result.category}</p>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {result.content.length > 200 ? `${result.content.slice(0, 200)}…` : result.content}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </section>

        <section aria-labelledby="knowledge-telemetry-title">
          <Card className="p-4">
            <h2 id="knowledge-telemetry-title" className="text-lg font-semibold mb-4">Gateway Telemetry</h2>

            {telemetryError ? (
              <StatePanel kind="offline" title="Telemetry unavailable" cause={telemetryError} />
            ) : telemetryLoading ? (
              <StatePanel kind="loading" title="Loading telemetry" cause="Reading gateway metrics." />
            ) : telemetry ? (
              <dl className="space-y-3">
                <div className="hq-kv-row"><dt>Total Requests</dt><dd className="text-xl font-bold">{formatNumber(telemetry.metrics.totalRequests)}</dd></div>
                <div className="hq-kv-row"><dt>Total Tokens</dt><dd className="text-xl font-bold">{formatNumber(telemetry.metrics.totalTokens)}</dd></div>
                <div className="hq-kv-row"><dt>Total Cost (USD)</dt><dd className="text-xl font-bold">{formatUsd(telemetry.metrics.totalCostUsd)}</dd></div>
                <div className="hq-kv-row"><dt>Average Latency</dt><dd className="text-xl font-bold">{formatMs(telemetry.metrics.avgLatencyMs)}</dd></div>
              </dl>
            ) : (
              <StatePanel kind="empty" title="No telemetry returned" cause="The gateway did not return a metrics payload." />
            )}
          </Card>
        </section>
      </div>
    </RouteShell>
  );
}
