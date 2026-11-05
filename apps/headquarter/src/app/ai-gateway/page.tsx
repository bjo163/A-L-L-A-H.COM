'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  RouteShell,
  Select,
  StatePanel,
  StatusMessage,
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
  ChatCompletionChunk,
  GatewayModelInfo,
  GatewayProviderInfo,
  GatewayTelemetry,
  GatewayUsageLog,
} from '@moonwitness/types';
import { RouteHeader } from '@/components/route-header';
import { useAsyncData } from '@/lib/use-async-data';
import { useDocumentTitle } from '@/lib/use-document-title';
import { formatMs, formatNumber, formatUsd } from '@/lib/hq-format';
import { COMMON_UI } from '@/lib/strings';

interface GatewaySnapshot {
  telemetry: GatewayTelemetry;
  providers: GatewayProviderInfo[];
  logs: GatewayUsageLog[];
  models: GatewayModelInfo[];
}

const LOG_PREVIEW = 20;

export default function AiGatewayPage() {
  useDocumentTitle('AI Gateway | Headquarter');

  const { data, loading, error, refresh } = useAsyncData<GatewaySnapshot>(async (signal) => {
    const [telemetry, providers, logs, models] = await Promise.all([
      mwClient.router.getTelemetry(),
      mwClient.router.getProviders(),
      mwClient.router.getUsageLogs(),
      mwClient.router.listModels().catch(() => [] as GatewayModelInfo[]),
    ]);
    if (signal.aborted) throw new Error('aborted');
    return { telemetry, providers, logs, models };
  });

  // Test console state
  const [testModel, setTestModel] = useState('dx-default');
  const [testPrompt, setTestPrompt] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const streamControllerRef = useRef<AbortController | null>(null);
  const outputBufferRef = useRef('');
  const flushHandleRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      streamControllerRef.current?.abort();
      if (flushHandleRef.current !== null) cancelAnimationFrame(flushHandleRef.current);
    };
  }, []);

  // Buffer tokens in a ref and paint once per animation frame, so a fast stream
  // does not trigger a React render for every delta.
  const scheduleFlush = useCallback(() => {
    if (flushHandleRef.current !== null) return;
    flushHandleRef.current = requestAnimationFrame(() => {
      flushHandleRef.current = null;
      setTestOutput(outputBufferRef.current);
    });
  }, []);

  const handleStreamChunk = useCallback((chunk: ChatCompletionChunk) => {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) {
      outputBufferRef.current += delta;
      scheduleFlush();
    }
  }, [scheduleFlush]);

  const runTestChatStream = async () => {
    if (!testPrompt.trim() || isStreaming) return;
    const controller = new AbortController();
    streamControllerRef.current = controller;
    outputBufferRef.current = '';
    setTestOutput('');
    setIsStreaming(true);
    setTestStatus('Initiating SSE stream…');

    try {
      await mwClient.router.chatStream(
        { model: testModel, messages: [{ role: 'user', content: testPrompt }] },
        handleStreamChunk,
        controller.signal,
      );
      setTestOutput(outputBufferRef.current);
      setTestStatus('Stream completed');
      refresh();
    } catch (streamError) {
      if (controller.signal.aborted) {
        setTestStatus('Stream stopped');
      } else {
        setTestOutput(outputBufferRef.current);
        setTestStatus(streamError instanceof Error ? `Stream failed: ${streamError.message}` : 'Stream failed');
      }
    } finally {
      setIsStreaming(false);
      streamControllerRef.current = null;
    }
  };

  const stopStream = () => {
    streamControllerRef.current?.abort();
  };

  const modelOptions = data?.models ?? [];
  const visibleLogs = data ? (showAllLogs ? data.logs : data.logs.slice(0, LOG_PREVIEW)) : [];

  return (
    <RouteShell as="main" className="hq-route hq-ai-gateway">
      <RouteHeader
        title="AI Gateway Control Plane"
        summary="Multi-provider routing, zero-copy streaming, virtual keys, and cost telemetry."
        actions={
          <Button variant="default" size="sm" onClick={refresh} disabled={loading}>
            {loading ? COMMON_UI.refreshing : COMMON_UI.refresh}
          </Button>
        }
      />

      {error && (
        <StatusMessage tone="danger" title="Telemetry unavailable" action={<Button variant="outline" size="sm" onClick={refresh}>Retry</Button>}>
          {error}
        </StatusMessage>
      )}

      {loading && !data ? (
        <StatePanel kind="loading" title="Reading gateway telemetry" cause="Collecting metrics, providers, models, and usage logs from the connected gateway." />
      ) : data ? (
        <section className="hq-metric-grid" aria-label="Gateway telemetry metrics">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Routed Requests</CardDescription>
              <CardTitle className="text-2xl hq-mono">{formatNumber(data.telemetry?.metrics?.totalRequests)}</CardTitle>
            </CardHeader>
            <CardContent><span className="hq-micro">Reported by connected gateway</span></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tokens Processed</CardDescription>
              <CardTitle className="text-2xl hq-mono text-ring">{formatNumber(data.telemetry?.metrics?.totalTokens)}</CardTitle>
            </CardHeader>
            <CardContent><span className="hq-micro">Prompt + completion tokens</span></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Accrued Cost (USD)</CardDescription>
              <CardTitle className="text-2xl hq-mono text-success">{formatUsd(data.telemetry?.metrics?.totalCostUsd)}</CardTitle>
            </CardHeader>
            <CardContent><span className="hq-micro">Model tariff calculation</span></CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Response Latency</CardDescription>
              <CardTitle className="text-2xl hq-mono">{formatMs(data.telemetry?.metrics?.avgLatencyMs)}</CardTitle>
            </CardHeader>
            <CardContent><span className="hq-micro">TTFT &amp; total elapsed roundtrip</span></CardContent>
          </Card>
        </section>
      ) : null}

      <section className="hq-section" aria-labelledby="gateway-providers-title">
        <div className="hq-section__heading">
          <h2 id="gateway-providers-title">Active Providers &amp; Fallback Pipeline</h2>
        </div>

        {loading && !data ? (
          <StatePanel as="h3" kind="loading" title="Loading provider records" cause="Reading the provider list from the gateway." />
        ) : data && data.providers.length === 0 ? (
          <StatePanel
            as="h3"
            kind="empty"
            title="No providers returned"
            cause="The connected gateway reported no providers."
            nextAction="Confirm the gateway is configured with at least one upstream provider."
          />
        ) : data ? (
          <div className="hq-metric-grid">
            {data.providers.map((provider) => {
              const circuit = data.telemetry?.circuits?.[provider.slug];
              const isAvailable = circuit ? circuit.healthy : provider.is_healthy;
              return (
                <Card key={provider.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium">{provider.name}</CardTitle>
                      <Badge variant={isAvailable ? 'active' : 'revoked'} dot>
                        {isAvailable ? 'HEALTHY' : 'CIRCUIT OPEN'}
                      </Badge>
                    </div>
                    <CardDescription className="hq-mono text-xs">{provider.slug}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <dl className="hq-kv-row"><dt>Type</dt><dd className="hq-mono">{provider.provider_type}</dd></dl>
                    <dl className="hq-kv-row"><dt>Priority</dt><dd className="hq-mono">Tier {provider.priority}</dd></dl>
                    <dl className="hq-kv-row"><dt>Endpoint</dt><dd className="hq-mono min-w-0 flex-1 justify-end truncate" title={provider.base_url}>{provider.base_url}</dd></dl>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="hq-section" aria-labelledby="gateway-tester-title">
        <div className="hq-section__heading">
          <div>
            <h2 id="gateway-tester-title">Interactive Gateway Tester</h2>
            <p className="hq-micro">Live Server-Sent Events (SSE) streaming validation directly against the Arsy AI Gateway.</p>
          </div>
          <Select label="Route Alias" value={testModel} onChange={(e) => setTestModel(e.target.value)} className="text-xs">
            <option value="dx-default">dx-default (Fallback sequence)</option>
            {modelOptions
              .filter((model) => model.id !== 'dx-default')
              .map((model) => (
                <option key={model.id} value={model.id}>
                  {model.displayName ? `${model.id} (${model.displayName})` : model.id}
                </option>
              ))}
          </Select>
        </div>

        <div className="flex gap-2">
          <Input
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            label="Prompt to stream"
            placeholder="Enter prompt to stream…"
            className="flex-1"
          />
          {isStreaming ? (
            <Button variant="destructive" onClick={stopStream}>Stop</Button>
          ) : (
            <Button variant="gold" onClick={runTestChatStream} disabled={!testPrompt.trim()}>Stream Completion</Button>
          )}
        </div>

        {testStatus && (
          <p className="hq-micro hq-mono" role="status">
            <span>Status: </span>
            <span className={testStatus.toLowerCase().includes('fail') ? 'text-destructive' : 'text-success'}>{testStatus}</span>
          </p>
        )}

        <div className="p-4 rounded-lg border border-border min-h-[90px] text-sm whitespace-pre-wrap leading-relaxed" aria-live="polite">
          {testOutput || <span className="text-muted-foreground italic">Stream output will render here in real-time…</span>}
        </div>
      </section>

      <section className="hq-section" aria-labelledby="gateway-logs-title">
        <div className="hq-section__heading">
          <h2 id="gateway-logs-title">Live Gateway Usage Logs (PGlite)</h2>
          {data && data.logs.length > 0 && (
            <span className="hq-section__meta">
              {visibleLogs.length} of {data.logs.length} records
            </span>
          )}
        </div>

        {loading && !data ? (
          <StatePanel as="h3" kind="loading" title="Loading usage logs" cause="Reading audit records from PGlite." />
        ) : data && data.logs.length === 0 ? (
          <StatePanel
            as="h3"
            kind="empty"
            title="No requests logged yet"
            cause="The gateway has not recorded any chat completions."
            nextAction="Issue a chat completion above to generate an audit record."
          />
        ) : data ? (
          <>
            <Card className="overflow-hidden">
              <TableScroll>
                <Table>
                  <TableCaption>Gateway audit records, newest last. Showing {visibleLogs.length} of {data.logs.length}.</TableCaption>
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
                    {visibleLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>#{log.id}</TableCell>
                        <TableCell>
                          <span>{log.model_name || COMMON_UI.notReported}</span>
                          {log.provider_name && <span className="block">{log.provider_name}</span>}
                        </TableCell>
                        <TableCell>{log.key_name || COMMON_UI.notReported}</TableCell>
                        <TableCell>
                          <span>{formatNumber(log.total_tokens)}</span>
                          <span className="block">{formatNumber(log.prompt_tokens)} in / {formatNumber(log.completion_tokens)} out</span>
                        </TableCell>
                        <TableCell>{formatMs(log.latency_ms)}</TableCell>
                        <TableCell>{formatUsd(log.cost_usd, 5)}</TableCell>
                        <TableCell>{log.is_cached ? <Badge variant="gold">CACHE HIT</Badge> : <span>PASS</span>}</TableCell>
                        <TableCell>
                          <Badge variant={log.status_code === 200 ? 'active' : 'revoked'}>{log.status_code}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableScroll>
            </Card>
            {data.logs.length > LOG_PREVIEW && (
              <Button variant="outline" size="sm" onClick={() => setShowAllLogs((prev) => !prev)}>
                {showAllLogs ? 'Show fewer' : `Show all ${data.logs.length} records`}
              </Button>
            )}
          </>
        ) : null}
      </section>
    </RouteShell>
  );
}
