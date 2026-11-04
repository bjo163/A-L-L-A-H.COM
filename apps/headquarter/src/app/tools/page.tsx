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
  Textarea,
  StatusMessage,
  RouteShell,
  ToolRegistryCard,
  ToolDetailPanel,
} from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';
import type { McpTool, McpToolCallResult, ToolExecutionRecord } from '@moonwitness/types';

export default function ToolsPage() {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [mcpConnected, setMcpConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sandbox state
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [toolArgs, setToolArgs] = useState('{}');
  const [callResult, setCallResult] = useState<McpToolCallResult | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  // Audit log state
  const [auditLog, setAuditLog] = useState<ToolExecutionRecord[]>([]);
  const [auditError, setAuditError] = useState<string | null>(null);

  const fetchTools = async () => {
    try {
      setError(null);
      const listed = await mwClient.mcp.listTools();
      setTools(listed);
      setMcpConnected(true);
    } catch (err) {
      setMcpConnected(false);
      setError(err instanceof Error ? err.message : 'Unable to reach MCP endpoint');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudit = async () => {
    try {
      setAuditError(null);
      const data = await mwClient.mcp.getAuditLog();
      setAuditLog(data);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Unable to load the execution audit log.');
    }
  };

  useEffect(() => {
    document.title = 'Tool Registry | Headquarter';
    fetchTools();
    fetchAudit();
  }, []);

  const defaultArgsFor = (tool: McpTool): string => {
    const schema = tool.inputSchema as { properties?: Record<string, unknown>; required?: string[] };
    const props = schema?.properties || {};
    const required = schema?.required || [];
    const example: Record<string, unknown> = {};
    for (const [key] of Object.entries(props)) {
      if (required.includes(key)) {
        example[key] = '';
      } else if (key === 'params') {
        example[key] = [];
      } else if (key === 'max_bytes') {
        example[key] = 50000;
      } else if (key === 'limit') {
        example[key] = 5;
      } else if (key === 'min_score') {
        example[key] = 0.7;
      } else {
        example[key] = '';
      }
    }
    return JSON.stringify(example, null, 2);
  };

  const handleSelectTool = (tool: McpTool) => {
    setSelectedTool(tool);
    setToolArgs(defaultArgsFor(tool));
    setCallResult(null);
    setCallError(null);
  };

  const handleCallTool = async () => {
    if (!selectedTool) return;
    setIsCalling(true);
    setCallResult(null);
    setCallError(null);
    let parsed: Record<string, unknown> = {};
    try {
      parsed = toolArgs.trim() ? JSON.parse(toolArgs) : {};
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Arguments must be a JSON object');
      }
    } catch (err) {
      setCallError(`Invalid JSON arguments: ${err instanceof Error ? err.message : 'Values must be valid JSON.'}`);
      setIsCalling(false);
      return;
    }

    try {
      const result = await mwClient.mcp.callTool(selectedTool.name, parsed);
      setCallResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setCallError(message || 'Tool call failed');
    } finally {
      setIsCalling(false);
      await fetchAudit();
    }
  };

  const handleCloseDetail = () => {
    setSelectedTool(null);
    setToolArgs('{}');
    setCallResult(null);
    setCallError(null);
  };

  return (
    <RouteShell as="main" className="hq-route hq-tools flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Tools & Model Context Protocol
              </h1>
              <Badge variant={mcpConnected ? 'active' : loading ? 'default' : 'revoked'} dot>
                {loading ? 'CONNECTING' : mcpConnected ? 'MCP READY' : 'MCP UNAVAILABLE'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Native platform tools & MCP server for external agents & IDEs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back to HQ</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={fetchTools} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Tools'}
            </Button>
          </div>
        </div>

        {error && (
          <StatusMessage tone="danger" title="Tool registry unavailable" action={<Button variant="outline" size="sm" onClick={fetchTools}>Retry</Button>}>
            {error}
          </StatusMessage>
        )}

        {/* MCP Status Card */}
        <section className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">MCP Endpoint</CardTitle>
                <Badge variant={mcpConnected ? 'active' : loading ? 'default' : 'revoked'} dot>
                  {loading ? 'CONNECTING' : mcpConnected ? 'CONNECTED' : 'UNAVAILABLE'}
                </Badge>
              </div>
              <CardDescription className="text-xs font-mono">
                POST /v1/mcp/message &bull; GET /v1/mcp/sse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono text-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ingress:</span>
                <span className="truncate max-w-[260px]">/v1/mcp/message</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stream:</span>
                <span className="truncate max-w-[260px]">/v1/mcp/sse</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registered tools:</span>
                <span className="font-semibold">{tools.length}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tool Registry Catalog - using ToolRegistryCard */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Tool Registry Catalog</h2>
            <span className="text-xs text-muted-foreground font-mono">{tools.length} native platform tool(s)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {tools.length === 0 ? (
              <Card className="col-span-full">
                <CardContent>
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No tools registered. Ensure the Arsy gateway is running with the tools registry loaded.
                  </p>
                </CardContent>
              </Card>
            ) : (
              tools.map((tool) => (
                <ToolRegistryCard
                  key={tool.name}
                  tool={tool}
                  onClick={handleSelectTool}
                />
              ))
            )}
          </div>
        </section>

        {/* Tool Detail Panel - using ToolDetailPanel */}
        {selectedTool && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Tool Detail</h2>
              <Badge variant="gold" dot>SELECTED</Badge>
            </div>
            <ToolDetailPanel
              tool={selectedTool}
              onExecute={handleSelectTool}
              onClose={() => setSelectedTool(null)}
            />
          </section>
        )}

        {/* Interactive Tool Execution Sandbox */}
        <section className="p-6 rounded-xl bg-card border border-border space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">Tool Execution Sandbox</h2>
              <p className="text-xs text-muted-foreground">
                Execute a registered platform tool through the MCP gateway with custom arguments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Select
                label="Tool"
                value={selectedTool?.name || ''}
                onChange={(e) => {
                  const t = tools.find((tool) => tool.name === e.target.value);
                  if (t) handleSelectTool(t);
                }}
                className="w-full text-xs"
              >
                <option value="">Select a tool...</option>
                {tools.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="gold" onClick={handleCallTool} disabled={isCalling || !selectedTool}>
                {isCalling ? 'Executing...' : 'Execute Tool'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              label="Arguments (JSON)"
              value={toolArgs}
              onChange={(e) => setToolArgs(e.target.value)}
              placeholder='{"query": "SELECT count(*) FROM res_users"}'
              className="font-mono text-xs"
            />
          </div>

          {callError && (
            <div role="alert" className="p-3 rounded bg-destructive/10 border border-destructive text-xs">
              {callError}
            </div>
          )}

          {callResult && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-foreground">Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-card border border-border text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {JSON.stringify(callResult, null, 2)}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Tool Execution Audit Log */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Tool Execution Audit Log
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              Last {auditLog.length} execution record(s)
            </span>
          </div>
          {auditError && (
             <p className="text-sm text-destructive" role="alert">
               Audit log unavailable: {auditError}
             </p>
          )}

          <Card className="overflow-hidden">
            <TableScroll>
              <Table>
                <TableCaption>
                  {`Tool executions recorded this session. ${auditLog.length} shown.`}
                </TableCaption>
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
                  {auditLog.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        No tool executions recorded yet. Use the sandbox above to execute a tool.
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLog.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>{entry.tool}</TableCell>
                        <TableCell>{entry.actor || 'Not reported'}</TableCell>
                        <TableCell>{entry.latencyMs}ms</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === 'ok' ? 'active' : 'revoked'}>
                            {entry.status === 'ok' ? 'OK' : 'ERROR'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.error || 'No error'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableScroll>
          </Card>
        </section>
    </RouteShell>
  );
}