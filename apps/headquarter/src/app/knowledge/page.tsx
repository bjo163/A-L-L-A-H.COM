'use client';

import { useState, useEffect } from 'react';
import { mwClient as sdk } from '@allah/sdk';
import { Button, Input, Card } from '@moonwitness/ui';

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  const search = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res: any = await (sdk as any).qorpus?.search({ query, limit: 10 }) || { chunks: [] };
      setResults(res.chunks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (sdk as any).router?.getTelemetry?.().then(setTelemetry).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Knowledge Explorer</h1>
        <p className="text-muted-foreground">Qorpus RAG search and semantic cache telemetry</p>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge base..."
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <Button onClick={search} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Search Results</h2>
            {results.length === 0 ? (
              <p className="text-muted-foreground">No results yet. Try searching.</p>
            ) : (
              <div className="space-y-4">
                {results.map((r, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{r.document_title}</h3>
                      <span className="text-sm text-muted-foreground">Score: {(r.score * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Category: {r.category}</p>
                    <p className="text-sm">{r.content.substring(0, 200)}...</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Semantic Cache Telemetry</h2>
            {telemetry ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-xl font-bold">{telemetry.metrics?.totalRequests || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-xl font-bold">{telemetry.metrics?.totalTokens || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost (USD)</p>
                  <p className="text-xl font-bold">${(telemetry.metrics?.totalCostUsd || 0).toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-xl font-bold">{telemetry.metrics?.avgLatencyMs || 0}ms</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
