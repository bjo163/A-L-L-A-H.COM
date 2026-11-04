'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Avatar,
} from '@moonwitness/ui';
import { mwClient, type SwarmRole, type SwarmExecutionResult } from '@allah/sdk';

interface RoleMeta {
  label: string;
  description: string;
  color: string;
  icon: string;
}

const ROLE_META: Record<SwarmRole, RoleMeta> = {
  planner: {
    label: 'Supervisor',
    description: 'Decomposes goals into subtasks and dispatches workers.',
    color: '#f59e0b',
    icon: '🧭',
  },
  researcher: {
    label: 'Researcher',
    description: 'Retrieves Qorpus context, schemas, and API contracts.',
    color: '#38bdf8',
    icon: '🔍',
  },
  builder: {
    label: 'Builder',
    description: 'Executes executive tools and generates artifacts.',
    color: '#a3e635',
    icon: '🔨',
  },
  verifier: {
    label: 'Reviewer',
    description: 'Verifies against acceptance criteria and signs off.',
    color: '#f472b6',
    icon: '✅',
  },
};

interface LogEntry {
  id: number;
  event: string;
  agent?: SwarmRole;
  action?: string;
  payload: unknown;
  timestamp: string;
  latency_ms?: number;
}

let logSeq = 0;

export default function SwarmOperationsPage() {
  const [goal, setGoal] = useState('');
  const [maxTurns, setMaxTurns] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState('Ready');
  const [log, setLog] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<SwarmExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Swarm Operations | Headquarter';
  }, []);

  const pushLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLog((prev) => [...prev, { ...entry, id: ++logSeq, timestamp: new Date().toISOString() }]);
  }, []);

  const handleRun = async () => {
    if (!goal.trim() || isRunning) return;

    setIsRunning(true);
    setStatusText('Running swarm orchestration...');
    setLog([]);
    setResult(null);
    setError(null);

    try {
      const res = await mwClient.swarm.run({
        goal,
        max_turns: maxTurns,
      });
      setResult(res);
      setStatusText(res.success ? 'Completed' : `Stopped: ${res.finish_reason}`);
      for (const step of res.steps) {
        pushLog({
          event: 'swarm_agent_step',
          agent: step.agent,
          action: step.action,
          latency_ms: step.latency_ms,
          payload: { output: step.output },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to run the swarm.');
      setStatusText('Failed');
    } finally {
      setIsRunning(false);
    }
  };

  const renderAgentCard = (role: SwarmRole, status: 'active' | 'idle' | 'done') => {
    const meta = ROLE_META[role];
    return (
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={meta.label} />
              <CardTitle className="text-sm font-semibold text-white">{meta.label}</CardTitle>
            </div>
            <Badge variant={status === 'active' ? 'active' : status === 'done' ? 'gold' : 'default'} dot={status === 'active'}>
              {status === 'active' ? 'AKTIF' : status === 'done' ? 'SELESAI' : 'SIAP'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{meta.description}</CardDescription>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="hq-route hq-swarm">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Swarm Operations</h1>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Hierarchical multi-agent orchestration with supervisor, researcher, builder, and reviewer roles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Mission Status:</span>
            <Badge variant={isRunning ? 'active' : result?.success ? 'active' : 'default'} dot={isRunning}>
              {statusText}
            </Badge>
          </div>
        </div>

        {/* Mission Input */}
        <Card className="bg-zinc-900/60 border-zinc-800 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white">Mission Goal</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter an operational goal. The swarm will plan, research, build, and report its result.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  label="Mission goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Describe the task for the swarm"
                  disabled={isRunning}
                />
              </div>
              <div className="w-full md:w-36">
                <Input
                  type="number"
                  label="Max turns"
                  min={1}
                  max={24}
                  value={maxTurns}
                  onChange={(e) => setMaxTurns(parseInt(e.target.value) || 8)}
                  disabled={isRunning}
                />
              </div>
              <Button
                onClick={handleRun}
                disabled={isRunning || !goal.trim()}
              >
                {isRunning ? 'Running Swarm...' : 'Run Swarm'}
              </Button>
            </div>
            {error && (
              <div role="alert" className="p-3 bg-red-950/40 border border-red-500/20 rounded-md text-sm text-red-400">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Role Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Agent Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderAgentCard('planner', isRunning ? 'active' : result?.success ? 'done' : 'idle')}
            {renderAgentCard('researcher', isRunning ? 'active' : 'idle')}
            {renderAgentCard('builder', isRunning ? 'active' : 'idle')}
            {renderAgentCard('verifier', isRunning ? 'active' : result?.success ? 'done' : 'idle')}
          </div>
        </section>

        {/* Live Inter-Agent Message Log */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Inter-Agent Message Log</h2>
            <span className="text-xs text-zinc-500 font-mono">{log.length} event(s)</span>
          </div>
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="pt-6 space-y-3 max-h-[500px] overflow-y-auto">
              {log.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm">
                  Belum ada aktivitas swarm. Masukkan tujuan di atas lalu "Luncurkan Swarm".
                </div>
              ) : (
                log.map((entry) => {
                  const meta = entry.agent ? ROLE_META[entry.agent] : null;
                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {meta && (
                            <span className="font-mono text-xs" style={{ color: meta.color }}>
                              {meta.icon} {meta.label}
                            </span>
                          )}
                          <span className="font-mono text-xs text-zinc-500">{entry.action || entry.event}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.latency_ms !== undefined && (
                            <span className="text-[10px] font-mono text-zinc-500">{entry.latency_ms}ms</span>
                          )}
                          <span className="text-[10px] font-mono text-zinc-600">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="bg-black/50 p-2 rounded text-xs font-mono text-emerald-300/90 overflow-x-auto">
                        {typeof entry.payload === 'object'
                          ? JSON.stringify(entry.payload, null, 2)
                          : String(entry.payload)}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </section>

        {/* Mission Result */}
        {result && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Mission Result</h2>
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant={result.success ? 'active' : 'revoked'} dot>
                    {result.success ? 'SUKSES' : result.finish_reason}
                  </Badge>
                  <span className="font-mono text-xs text-zinc-500">{result.mission_id}</span>
                </div>
                <p className="text-sm text-zinc-300">{result.summary}</p>
                <div className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-400 overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}