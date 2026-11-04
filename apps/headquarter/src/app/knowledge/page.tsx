'use client';

import { useEffect, useState } from 'react';
import { mwClient } from '@allah/sdk';
import type { GatewayTelemetry } from '@moonwitness/types';
import { Button, Form, Input, Card, RouteShell } from '@moonwitness/ui';

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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KnowledgeChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<GatewayTelemetry | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(true);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

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

  useEffect(() => {
    document.title = 'Knowledge Explorer | Headquarter';
    let active = true;

    mwClient.router.getTelemetry()
      .then((data) => {
        if (active) setTelemetry(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setTelemetryError(error instanceof Error ? error.message : 'Unable to load gateway telemetry.');
        }
      })
      .finally(() => {
        if (active) setTelemetryLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <RouteShell as="main" className="hq-route hq-knowledge p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <p className="hq-kicker">QORPUS / KNOWLEDGE INDEX</p>
        <h1 className="text-2xl font-bold mb-2">Knowledge Explorer</h1>
        <p className="text-muted-foreground">Search indexed records and inspect gateway telemetry.</p>
      </header>

      <Card className="p-4 mb-6">
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
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2" aria-labelledby="knowledge-results-title">
          <Card className="p-4">
            <h2 id="knowledge-results-title" className="text-lg font-semibold mb-4">Search Results</h2>
            {searchError ? (
              <p className="text-sm text-destructive" role="alert">{searchError}</p>
            ) : results.length === 0 ? (
              <p className="text-muted-foreground">
                {loading
                  ? 'Searching indexed records...'
                  : hasSearched
                    ? 'No records matched this query.'
                    : 'Enter a search term to inspect indexed records.'}
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <article key={result.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-medium">{result.document_title}</h3>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        Score: {(result.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Category: {result.category}</p>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {result.content.length > 200 ? `${result.content.slice(0, 200)}…` : result.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section aria-labelledby="knowledge-telemetry-title">
          <Card className="p-4">
            <h2 id="knowledge-telemetry-title" className="text-lg font-semibold mb-4">Gateway Telemetry</h2>
            {telemetryError ? (
              <p className="text-sm text-destructive" role="alert">
                Telemetry unavailable: {telemetryError}
              </p>
            ) : telemetryLoading ? (
              <p className="text-muted-foreground" role="status">Loading telemetry...</p>
            ) : telemetry ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Total Requests</dt>
                  <dd className="text-xl font-bold">{telemetry.metrics.totalRequests.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Total Tokens</dt>
                  <dd className="text-xl font-bold">{telemetry.metrics.totalTokens.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Total Cost (USD)</dt>
                  <dd className="text-xl font-bold">${telemetry.metrics.totalCostUsd.toFixed(4)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Average Latency</dt>
                  <dd className="text-xl font-bold">{telemetry.metrics.avgLatencyMs}ms</dd>
                </div>
              </dl>
            ) : (
              <p className="text-muted-foreground">No telemetry response was returned.</p>
            )}
          </Card>
        </section>
      </div>
    </RouteShell>
  );
}