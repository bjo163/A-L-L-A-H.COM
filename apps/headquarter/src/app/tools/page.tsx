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
} from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';
import type { McpTool, McpToolCallResult, ToolExecutionRecord } from '@moonwitness/types';

export default function ToolsPage() {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [mcpConnected, setMcpConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sandbox state
  const [selectedTool, setSelectedTool] = useState<string>('');
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
    setSelectedTool(tool.name);
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
      const result = await mwClient.mcp.callTool(selectedTool, parsed);
      setCallResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setCallError(message || 'Tool call failed');
    } finally {
      setIsCalling(false);
      await fetchAudit();
    }
  };

  return (
    <div className="hq-route hq-tools">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Tools & Model Context Protocol
              </h1>
              <Badge variant={mcpConnected ? 'active' : loading ? 'default' : 'revoked'} dot>
                {loading ? 'CONNECTING' : mcpConnected ? 'MCP READY' : 'MCP UNAVAILABLE'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
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
          <div role="alert" className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchTools}>Retry</Button>
          </div>
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
            <CardContent className="space-y-2 text-xs font-mono text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Ingress:</span>
                <span className="truncate max-w-[260px]">/v1/mcp/message</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Stream:</span>
                <span className="truncate max-w-[260px]">/v1/mcp/sse</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Registered tools:</span>
                <span className="font-semibold">{tools.length}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tool Registry Catalog */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Tool Registry Catalog</h2>
            <span className="text-xs text-zinc-500 font-mono">{tools.length} native platform tool(s)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {tools.length === 0 ? (
              <Card className="col-span-full">
                <CardContent>
                  <p className="text-xs text-zinc-500 text-center py-4">
                    No tools registered. Ensure the Arsy gateway is running with the tools registry loaded.
                  </p>
                </CardContent>
              </Card>
            ) : (
              tools.map((tool) => (
                <Card key={tool.name} className="cursor-pointer hover:border-amber-500/40 transition-colors group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{tool.name}</CardTitle>
                      <Badge variant="gold" dot>NATIVE</Badge>
                    </div>
                    <CardDescription className="text-xs text-zinc-400">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2">
                      Schema: {Object.keys(tool.inputSchema?.properties || {}).join(', ') || 'none'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectTool(tool)}
                      className="w-full text-[10px] px-3"
                    >
                      Test in Sandbox
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Interactive Tool Execution Sandbox */}
        <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Tool Execution Sandbox</h2>
              <p className="text-xs text-zinc-400">
                Execute a registered platform tool through the MCP gateway with custom arguments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Select
                label="Tool"
                value={selectedTool}
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
            <div role="alert" className="p-3 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {callError}
            </div>
          )}

          {callResult && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-zinc-100">Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {JSON.stringify(callResult, null, 2)}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Tool Execution Audit Log */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              Tool Execution Audit Log
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              Last {auditLog.length} execution record(s)
            </span>
          </div>
          {auditError && (
             <p className="text-sm text-red-400" role="alert">
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
      </main>
    </div>
  );
}
