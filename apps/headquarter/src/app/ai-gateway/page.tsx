'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Select,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableScroll,
  TableRow,
} from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';
import type {
  GatewayTelemetry,
  GatewayProviderInfo,
  GatewayUsageLog,
} from '@moonwitness/types';

export default function AiGatewayPage() {
  const [telemetry, setTelemetry] = useState<GatewayTelemetry | null>(null);
  const [providers, setProviders] = useState<GatewayProviderInfo[]>([]);
  const [usageLogs, setUsageLogs] = useState<GatewayUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test Console State
  const [testModel, setTestModel] = useState('dx-default');
  const [testPrompt, setTestPrompt] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tData, pData, uData] = await Promise.all([
        mwClient.router.getTelemetry(),
        mwClient.router.getProviders(),
        mwClient.router.getUsageLogs(),
      ]);

      setTelemetry(tData);
      setProviders(pData);
      setUsageLogs(uData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed connecting to Arsy AI Gateway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'AI Gateway | Headquarter';
    fetchData();
  }, []);

  const handleTestChatStream = async () => {
    if (!testPrompt.trim()) return;
    setIsStreaming(true);
    setTestOutput('');
    setTestStatus('Initiating SSE stream...');

    try {
      await mwClient.router.chatStream(
        {
          model: testModel,
          messages: [{ role: 'user', content: testPrompt }],
        },
        (chunk) => {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            setTestOutput((prev) => prev + delta);
          }
        }
      );
      setTestStatus('Stream completed');
      // Refresh telemetry & logs after test call
      fetchData();
    } catch (err) {
      setTestStatus(`Stream failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="hq-route hq-ai-gateway">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                AI Gateway Control Plane
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Multi-provider routing, zero-copy streaming, virtual keys, and cost telemetry
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back to HQ</Link>
            </Button>
            <Button variant="default" size="sm" onClick={fetchData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Telemetry'}
            </Button>
          </div>
        </div>

        {error && (
          <div role="alert" className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
          </div>
        )}

        {/* Telemetry Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Routed Requests</CardDescription>
              <CardTitle className="text-2xl font-mono text-zinc-100">
                {loading ? 'Loading...' : telemetry ? telemetry.metrics.totalRequests.toLocaleString() : 'Not reported'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-[10px] text-zinc-500">Reported by connected gateway</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tokens Processed</CardDescription>
              <CardTitle className="text-2xl font-mono text-amber-400">
                {loading ? 'Loading...' : telemetry ? telemetry.metrics.totalTokens.toLocaleString() : 'Not reported'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-[10px] text-zinc-500">Prompt + completion tokens</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Accrued Cost (USD)</CardDescription>
              <CardTitle className="text-2xl font-mono text-emerald-400">
                {loading ? 'Loading...' : telemetry ? `$${telemetry.metrics.totalCostUsd.toFixed(4)}` : 'Not reported'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-[10px] text-zinc-500">Model tariff calculation</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Response Latency</CardDescription>
              <CardTitle className="text-2xl font-mono text-zinc-100">
                {loading ? 'Loading...' : telemetry ? `${telemetry.metrics.avgLatencyMs}ms` : 'Not reported'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-[10px] text-zinc-500">TTFT & total elapsed roundtrip</span>
            </CardContent>
          </Card>
        </section>

        {/* Active Providers & Circuit Breaker Status */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              Active Providers & Fallback Pipeline
            </h2>
          </div>

          {providers.length === 0 ? (
            <p className="text-sm text-zinc-400">
              {loading ? 'Loading provider records...' : 'No providers were returned by the connected gateway.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {providers.map((p) => {
                const circuit = telemetry?.circuits?.[p.slug];
                const isAvailable = circuit ? circuit.healthy : p.is_healthy;

                return (
                  <Card key={p.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{p.name}</CardTitle>
                        <Badge variant={isAvailable ? 'active' : 'revoked'} dot>
                          {isAvailable ? 'HEALTHY' : 'CIRCUIT OPEN'}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs font-mono">{p.slug}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs font-mono text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Type:</span>
                        <span>{p.provider_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Priority:</span>
                        <span>Tier {p.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Endpoint:</span>
                        <span className="truncate max-w-[140px] text-zinc-400">{p.base_url}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Interactive Gateway Test Console */}
        <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Interactive Gateway Tester
              </h2>
              <p className="text-xs text-zinc-400">
                Live Server-Sent Events (SSE) streaming validation directly against the Arsy AI Gateway
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                label="Route Alias"
                value={testModel}
                onChange={(e) => setTestModel(e.target.value)}
                className="text-xs"
              >
                <option value="dx-default">dx-default (Fallback sequence)</option>
                <option value="dx-fast">dx-fast (Lowest latency/cost)</option>
                <option value="dx-reasoning">dx-reasoning (Deep intelligence)</option>
                <option value="gpt-4o">gpt-4o (Direct upstream)</option>
                <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet (Anthropic)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (Google)</option>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                label="Prompt to stream"
                placeholder="Enter prompt to stream..."
                className="flex-1 font-mono text-xs"
              />
              <Button
                variant="gold"
                onClick={handleTestChatStream}
                disabled={isStreaming || !testPrompt.trim()}
              >
                {isStreaming ? 'Streaming...' : 'Stream Completion'}
              </Button>
            </div>

            {testStatus && (
              <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
                <span>Status:</span>
                <span className={testStatus.includes('failed') ? 'text-red-400' : 'text-emerald-400'}>
                  {testStatus}
                </span>
              </div>
            )}

            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 min-h-[90px] text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {testOutput || (
                <span className="text-zinc-600 italic">
                  Stream output will render here in real-time...
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Live Persistent Usage Log Table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              Live Gateway Usage Logs (PGlite)
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              Last {usageLogs.length} audit records
            </span>
          </div>

          <Card className="overflow-hidden">
            <TableScroll>
              <Table>
                <TableCaption>
                  {`Gateway audit records, newest last. ${usageLogs.length} shown.`}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Log ID</TableHead>
                    <TableHead>Model / Provider</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Cost (USD)</TableHead>
                    <TableHead>Cache</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        No requests logged yet. Issue a chat completion above to generate audit logs.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usageLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>#{log.id}</TableCell>
                        <TableCell>
                          <span>{log.model_name || 'Not reported'}</span>
                          {log.provider_name && (
                            <span className="block">{log.provider_name}</span>
                          )}
                        </TableCell>
                        <TableCell>{log.key_name || 'Not reported'}</TableCell>
                        <TableCell>
                          <span>{log.total_tokens}</span>
                          <span className="block">
                            {log.prompt_tokens} in / {log.completion_tokens} out
                          </span>
                        </TableCell>
                        <TableCell>{log.latency_ms}ms</TableCell>
                        <TableCell>
                          ${Number(log.cost_usd || 0).toFixed(5)}
                        </TableCell>
                        <TableCell>
                          {log.is_cached ? (
                            <Badge variant="gold">CACHE HIT</Badge>
                          ) : (
                            <span>PASS</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.status_code === 200 ? 'active' : 'revoked'}>
                            {log.status_code}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableScroll>
          </Card>
        </section>
      </main>
    </div>
  );
}
