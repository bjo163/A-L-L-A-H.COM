'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  RouteShell,
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
  Textarea,
  ToolDetailPanel,
  ToolRegistryCard,
} from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';
import type { McpTool, McpToolCallResult, ToolExecutionRecord } from '@moonwitness/types';
import { RouteHeader } from '@/components/route-header';
import { useAsyncData } from '@/lib/use-async-data';
import { useDocumentTitle } from '@/lib/use-document-title';
import { formatClock, formatMs } from '@/lib/hq-format';
import { COMMON_UI } from '@/lib/strings';

interface ToolSnapshot {
  tools: McpTool[];
  auditLog: ToolExecutionRecord[];
}

const AUDIT_PREVIEW = 15;

function defaultArgsFor(tool: McpTool): string {
  const schema = tool.inputSchema as { properties?: Record<string, unknown>; required?: string[] };
  const props = schema?.properties || {};
  const required = schema?.required || [];
  const example: Record<string, unknown> = {};
  for (const [key] of Object.entries(props)) {
    if (required.includes(key)) example[key] = '';
    else if (key === 'params') example[key] = [];
    else if (key === 'max_bytes') example[key] = 50000;
    else if (key === 'limit') example[key] = 5;
    else if (key === 'min_score') example[key] = 0.7;
    else example[key] = '';
  }
  return JSON.stringify(example, null, 2);
}

export default function ToolsPage() {
  useDocumentTitle('Tool Registry | Headquarter');

  const { data, loading, error, refresh } = useAsyncData<ToolSnapshot>(async () => {
    const [tools, auditLog] = await Promise.all([mwClient.mcp.listTools(), mwClient.mcp.getAuditLog()]);
    return { tools, auditLog };
  });

  const tools = data?.tools ?? [];
  const auditLog = data?.auditLog ?? [];
  const mcpConnected = !error && data !== null;

  // Execution state for the currently selected tool.
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [toolArgs, setToolArgs] = useState('{}');
  const [callResult, setCallResult] = useState<McpToolCallResult | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [showAllAudit, setShowAllAudit] = useState(false);

  const handleSelectTool = (tool: McpTool) => {
    setSelectedTool(tool);
    setToolArgs(defaultArgsFor(tool));
    setCallResult(null);
    setCallError(null);
  };

  const handleCloseDetail = () => {
    setSelectedTool(null);
    setToolArgs('{}');
    setCallResult(null);
    setCallError(null);
  };

  const handleCallTool = async () => {
    if (!selectedTool || isCalling) return;
    setIsCalling(true);
    setCallResult(null);
    setCallError(null);

    let parsed: Record<string, unknown>;
    try {
      const candidate: unknown = toolArgs.trim() ? JSON.parse(toolArgs) : {};
      if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
        throw new Error('Arguments must be a JSON object');
      }
      parsed = candidate as Record<string, unknown>;
    } catch (parseError) {
      setCallError(`Invalid JSON arguments: ${parseError instanceof Error ? parseError.message : 'Values must be valid JSON.'}`);
      setIsCalling(false);
      return;
    }

    try {
      const result = await mwClient.mcp.callTool(selectedTool.name, parsed);
      setCallResult(result);
    } catch (callFailure) {
      setCallError(callFailure instanceof Error && callFailure.message ? callFailure.message : 'Tool call failed');
    } finally {
      setIsCalling(false);
      refresh();
    }
  };

  const visibleAudit = showAllAudit ? auditLog : auditLog.slice(0, AUDIT_PREVIEW);
  const connectionBadge = useMemo(() => {
    if (loading && !data) return { variant: 'default' as const, label: 'CONNECTING' };
    if (error) return { variant: 'revoked' as const, label: 'MCP UNAVAILABLE' };
    return { variant: 'active' as const, label: 'MCP READY' };
  }, [loading, data, error]);

  return (
    <RouteShell as="main" className="hq-route hq-tools">
      <RouteHeader
        title="Tools & Model Context Protocol"
        summary="Native platform tools and the MCP server for external agents and IDEs."
        status={<Badge variant={connectionBadge.variant} dot>{connectionBadge.label}</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            {loading ? COMMON_UI.refreshing : COMMON_UI.refresh}
          </Button>
        }
      />

      {error && (
        <StatusMessage tone="danger" title="Tool registry unavailable" action={<Button variant="outline" size="sm" onClick={refresh}>Retry</Button>}>
          {error}
        </StatusMessage>
      )}

      <section className="hq-section" aria-labelledby="mcp-endpoint-title">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle id="mcp-endpoint-title" className="text-sm font-medium">MCP Endpoint</CardTitle>
            <CardDescription className="hq-mono text-xs">POST /v1/mcp/message &bull; GET /v1/mcp/sse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <dl className="hq-kv-row"><dt>Ingress</dt><dd className="hq-mono">/v1/mcp/message</dd></dl>
            <dl className="hq-kv-row"><dt>Stream</dt><dd className="hq-mono">/v1/mcp/sse</dd></dl>
            <dl className="hq-kv-row"><dt>Registered tools</dt><dd className="hq-mono">{tools.length}</dd></dl>
          </CardContent>
        </Card>
      </section>

      <section className="hq-section" aria-labelledby="tool-catalog-title">
        <div className="hq-section__heading">
          <h2 id="tool-catalog-title">Tool Registry Catalog</h2>
          <span className="hq-section__meta">{tools.length} native platform tool(s)</span>
        </div>

        {loading && !data ? (
          <StatePanel as="h3" kind="loading" title="Loading tools" cause="Reading the registered MCP tool list." />
        ) : tools.length === 0 ? (
          <StatePanel
            as="h3"
            kind="empty"
            title="No tools registered"
            cause="The gateway returned an empty tool registry."
            nextAction="Ensure the Arsy gateway is running with the tools registry loaded."
          />
        ) : (
          <div className="hq-metric-grid" role="list" aria-label="Registered tools">
            {tools.map((tool) => (
              <div role="listitem" key={tool.name}>
                <ToolRegistryCard tool={tool} onClick={handleSelectTool} />
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedTool && (
        <section className="hq-section" aria-labelledby="tool-detail-title">
          <div className="hq-section__heading">
            <h2 id="tool-detail-title">Tool Detail &amp; Execution</h2>
            <Badge variant="gold" dot>Selected</Badge>
          </div>

          <ToolDetailPanel tool={selectedTool} onExecute={() => void handleCallTool()} onClose={handleCloseDetail} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Arguments (JSON)</CardTitle>
              <CardDescription>Provide a JSON object matching the tool schema, then execute it through the MCP gateway.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                label="Arguments (JSON)"
                value={toolArgs}
                onChange={(e) => setToolArgs(e.target.value)}
                placeholder='{"key": "value"}'
                className="font-mono text-xs"
              />
              <Button variant="gold" onClick={handleCallTool} disabled={isCalling}>
                {isCalling ? 'Executing…' : 'Execute Tool'}
              </Button>

              {callError && <StatusMessage tone="danger" title="Tool call failed">{callError}</StatusMessage>}

              {callResult && (
                <div className="p-3 rounded-lg border border-border text-xs font-mono whitespace-pre-wrap leading-relaxed" aria-live="polite">
                  {JSON.stringify(callResult, null, 2)}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      <section className="hq-section" aria-labelledby="tool-audit-title">
        <div className="hq-section__heading">
          <h2 id="tool-audit-title">Tool Execution Audit Log</h2>
          <span className="hq-section__meta">{visibleAudit.length} of {auditLog.length} record(s)</span>
        </div>

        {auditLog.length === 0 ? (
          <StatePanel
            as="h3"
            kind="empty"
            title="No executions recorded"
            cause="No tool has been executed this session."
            nextAction="Select a tool and execute it to record an audit entry."
          />
        ) : (
          <>
            <Card className="overflow-hidden">
              <TableScroll>
                <Table>
                  <TableCaption>Tool executions recorded this session, newest last. Showing {visibleAudit.length} of {auditLog.length}.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Tool</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleAudit.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatClock(entry.timestamp)}</TableCell>
                        <TableCell>{entry.tool}</TableCell>
                        <TableCell>{entry.actor || COMMON_UI.notReported}</TableCell>
                        <TableCell>{formatMs(entry.latencyMs)}</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === 'ok' ? 'active' : 'revoked'}>{entry.status === 'ok' ? 'OK' : 'ERROR'}</Badge>
                        </TableCell>
                        <TableCell>{entry.error || 'No error'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableScroll>
            </Card>
            {auditLog.length > AUDIT_PREVIEW && (
              <Button variant="outline" size="sm" onClick={() => setShowAllAudit((prev) => !prev)}>
                {showAllAudit ? 'Show fewer' : `Show all ${auditLog.length} records`}
              </Button>
            )}
          </>
        )}
      </section>
    </RouteShell>
  );
}
