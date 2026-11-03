'use client';

import { useState, useEffect } from 'react';
import {
  EcosystemNavbar,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
} from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';
import type { McpTool, McpToolCallResult } from '@moonwitness/types';

export default function ToolsPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
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
  const [auditLog, setAuditLog] = useState<any[]>([]);

  const fetchTools = async () => {
    try {
      setError(null);
      const listed = await mwClient.mcp.listTools().catch(() => [] as McpTool[]);
      setTools(Array.isArray(listed) ? listed : []);
      setMcpConnected(true);
    } catch (err: any) {
      setMcpConnected(false);
      setError(err.message || 'Unable to reach MCP endpoint');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudit = async () => {
    try {
      const data = await mwClient.mcp.getAuditLog().catch(() => [] as any[]);
      if (Array.isArray(data)) setAuditLog(data);
    } catch {
      // Audit endpoint may not be available yet; keep empty log
    }
  };

  useEffect(() => {
    mwClient.auth.getCurrentUser()
      .then((res) => {
        if (res?.user) setUser(res.user);
      })
      .catch(() => {});

    fetchTools();
    fetchAudit();
  }, []);

  const defaultArgsFor = (tool: McpTool): string => {
    const schema = tool.inputSchema as any;
    const props = schema?.properties || {};
    const required = schema?.required || [];
    const example: Record<string, unknown> = {};
    for (const [key] of Object.entries(props)) {
      if (required.includes(key)) {
        if (key === 'query') example[key] = tool.name === 'qorpus_retrieve' ? 'MoonWitness architecture' : 'SELECT count(*) FROM res_users';
        else if (key === 'url') example[key] = 'https://example.com';
        else if (key === 'action') example[key] = 'put';
        else if (key === 'content') example[key] = 'hello world';
        else if (key === 'digest') example[key] = '';
        else example[key] = '';
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
    } catch (err: any) {
      setCallError(`Invalid JSON arguments: ${err.message}`);
      setIsCalling(false);
      return;
    }

    try {
      const result = await mwClient.mcp.callTool(selectedTool, parsed);
      setCallResult(result);
    } catch (err: any) {
      setCallError(err.message || 'Tool call failed');
    } finally {
      setIsCalling(false);
      await fetchAudit();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      <EcosystemNavbar
        currentApp="headquarter"
        userName={user?.name}
        userEmail={user?.email}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Tools & Model Context Protocol
              </h1>
              <Badge variant={mcpConnected ? 'active' : 'revoked'} dot>
                {mcpConnected ? 'MCP READY' : 'MCP OFFLINE'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Native platform tools & MCP server for external agents & IDEs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/">
              <Button variant="outline" size="sm">Back to HQ</Button>
            </a>
            <Button variant="outline" size="sm" onClick={fetchTools} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Tools'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-sm flex items-center justify-between">
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
                <Badge variant={mcpConnected ? 'active' : 'revoked'} dot>
                  {mcpConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </Badge>
              </div>
              <CardDescription className="text-xs font-mono">
                POST /v1/mcp/message &bull; GET /v1/mcp/sse &bull; Protocol {mcpConnected ? '2025-06-12' : '—'}
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
              <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Tool</label>
              <select
                value={selectedTool}
                onChange={(e) => {
                  const t = tools.find((tool) => tool.name === e.target.value);
                  if (t) handleSelectTool(t);
                }}
                className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 w-full"
              >
                <option value="">Select a tool...</option>
                {tools.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="gold" onClick={handleCallTool} disabled={isCalling || !selectedTool}>
                {isCalling ? 'Executing...' : 'Execute Tool'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Arguments (JSON)</label>
            <Input
              value={toolArgs}
              onChange={(e) => setToolArgs(e.target.value)}
              placeholder='{"query": "SELECT count(*) FROM res_users"}'
              className="font-mono text-xs min-h-[200px] resize-y"
            />
          </div>

          {callError && (
            <div className="p-3 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs">
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

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-4">Tool</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">Latency</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {auditLog.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No tool executions recorded yet. Use the sandbox above to execute a tool.
                      </td>
                    </tr>
                  ) : (
                    auditLog.map((entry) => (
                      <tr key={entry.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-2.5 px-4 text-zinc-500">{new Date(entry.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2.5 px-4 text-zinc-100 font-semibold">{entry.tool}</td>
                        <td className="py-2.5 px-4 text-zinc-500">{entry.actor || '—'}</td>
                        <td className="py-2.5 px-4 text-zinc-400">{entry.latencyMs}ms</td>
                        <td className="py-2.5 px-4">
                          <Badge variant={entry.status === 'ok' ? 'active' : 'revoked'}>
                            {entry.status === 'ok' ? 'OK' : 'ERROR'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-zinc-500 truncate max-w-[200px]">
                          {entry.error || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
