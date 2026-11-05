'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  RouteShell,
  StatePanel,
  StatusMessage,
} from '@moonwitness/ui';
import { mwClient, type SwarmRole, type SwarmExecutionResult } from '@allah/sdk';
import { RouteHeader } from '@/components/route-header';
import { useDocumentTitle } from '@/lib/use-document-title';
import { formatClock, formatMs } from '@/lib/hq-format';
import { SWARM_UI } from '@/lib/strings';

interface RoleMeta {
  label: string;
  description: string;
  /** A token-driven text utility: a hex here would escape the skin. */
  tone: string;
}

const ROLE_META: Record<SwarmRole, RoleMeta> = {
  planner: { label: 'Supervisor', description: 'Decomposes goals into subtasks and dispatches workers.', tone: 'text-ring' },
  researcher: { label: 'Researcher', description: 'Retrieves Qorpus context, schemas, and API contracts.', tone: 'text-accent' },
  builder: { label: 'Builder', description: 'Executes executive tools and generates artifacts.', tone: 'text-success' },
  verifier: { label: 'Reviewer', description: 'Verifies against acceptance criteria and signs off.', tone: 'text-primary' },
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

export default function SwarmOperationsPage() {
  useDocumentTitle('Swarm Operations | Headquarter');

  const [goal, setGoal] = useState('');
  const [maxTurns, setMaxTurns] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState<string>(SWARM_UI.ready);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<SwarmExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sequence lives in a ref so two mounted instances can never share a counter.
  const logSeqRef = useRef(0);

  const pushLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    logSeqRef.current += 1;
    setLog((prev) => [...prev, { ...entry, id: logSeqRef.current, timestamp: new Date().toISOString() }]);
  }, []);

  const handleRun = async () => {
    if (!goal.trim() || isRunning) return;

    setIsRunning(true);
    setStatusText(SWARM_UI.runningState);
    setLog([]);
    setResult(null);
    setError(null);
    logSeqRef.current = 0;

    try {
      const res = await mwClient.swarm.run({ goal, max_turns: maxTurns });
      setResult(res);
      setStatusText(res.success ? SWARM_UI.completed : `${SWARM_UI.stopped}: ${res.finish_reason}`);
      for (const step of res.steps) {
        pushLog({ event: 'swarm_agent_step', agent: step.agent, action: step.action, latency_ms: step.latency_ms, payload: { output: step.output } });
      }
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Unable to run the swarm.');
      setStatusText(SWARM_UI.failed);
    } finally {
      setIsRunning(false);
    }
  };

  const renderAgentCard = (role: SwarmRole, cardStatus: 'active' | 'idle' | 'done') => {
    const meta = ROLE_META[role];
    const badgeLabel = cardStatus === 'active' ? SWARM_UI.badge.active : cardStatus === 'done' ? SWARM_UI.badge.done : SWARM_UI.badge.idle;
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar name={meta.label} />
              <CardTitle className="text-sm font-semibold">{meta.label}</CardTitle>
            </div>
            <Badge variant={cardStatus === 'active' ? 'active' : cardStatus === 'done' ? 'gold' : 'default'} dot={cardStatus === 'active'}>
              {badgeLabel}
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
    <RouteShell as="main" className="hq-route hq-swarm">
      <RouteHeader
        title={SWARM_UI.title}
        summary={SWARM_UI.summary}
        status={
          <div className="flex items-center gap-2">
            <span className="hq-micro">{SWARM_UI.missionStatus}</span>
            <Badge variant={isRunning ? 'active' : result?.success ? 'active' : 'default'} dot={isRunning}>{statusText}</Badge>
          </div>
        }
      />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Mission Goal</CardTitle>
          <CardDescription>Enter an operational goal. The swarm will plan, research, build, and report its result.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-0">
              <Input label="Mission goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Describe the task for the swarm" disabled={isRunning} />
            </div>
            <div className="w-36">
              <Input type="number" label="Max turns" min={1} max={24} value={maxTurns} onChange={(e) => setMaxTurns(parseInt(e.target.value, 10) || 8)} disabled={isRunning} />
            </div>
            <Button onClick={handleRun} disabled={isRunning || !goal.trim()}>
              {isRunning ? SWARM_UI.runningButton : SWARM_UI.launchButton}
            </Button>
          </div>
          {error && <StatusMessage tone="danger" title="Swarm run failed">{error}</StatusMessage>}
        </CardContent>
      </Card>

      <section className="hq-section" aria-labelledby="swarm-roles-title">
        <div className="hq-section__heading">
          <h2 id="swarm-roles-title">Agent Roles</h2>
        </div>
        <div className="hq-metric-grid">
          {renderAgentCard('planner', isRunning ? 'active' : result?.success ? 'done' : 'idle')}
          {renderAgentCard('researcher', isRunning ? 'active' : 'idle')}
          {renderAgentCard('builder', isRunning ? 'active' : 'idle')}
          {renderAgentCard('verifier', isRunning ? 'active' : result?.success ? 'done' : 'idle')}
        </div>
      </section>

      <section className="hq-section" aria-labelledby="swarm-log-title">
        <div className="hq-section__heading">
          <h2 id="swarm-log-title">Inter-Agent Message Log</h2>
          <span className="hq-section__meta">{log.length} event(s)</span>
        </div>
        {log.length === 0 ? (
          <StatePanel kind="empty" title="No swarm activity yet" cause={SWARM_UI.emptyLog} />
        ) : (
          <ul className="hq-log-list" aria-live="polite">
            {log.map((entry) => {
              const meta = entry.agent ? ROLE_META[entry.agent] : null;
              return (
                <li className="hq-log-item" key={entry.id}>
                  <div className="hq-log-item__head">
                    <div className="flex items-center gap-2">
                      {meta && <span className={`hq-micro hq-mono ${meta.tone}`}>{meta.label}</span>}
                      <span className="hq-micro hq-mono">{entry.action || entry.event}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.latency_ms !== undefined && <span className="hq-micro hq-mono">{formatMs(entry.latency_ms)}</span>}
                      <span className="hq-micro hq-mono">{formatClock(entry.timestamp)}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded hq-mono text-xs overflow-x-auto">
                    {typeof entry.payload === 'object' ? JSON.stringify(entry.payload, null, 2) : String(entry.payload)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {result && (
        <section className="hq-section" aria-labelledby="swarm-result-title">
          <div className="hq-section__heading">
            <h2 id="swarm-result-title">Mission Result</h2>
          </div>
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant={result.success ? 'active' : 'revoked'} dot>{result.success ? SWARM_UI.success : result.finish_reason}</Badge>
                <span className="hq-micro hq-mono">{result.mission_id}</span>
              </div>
              <p className="text-sm">{result.summary}</p>
              <div className="p-3 rounded hq-mono text-xs overflow-x-auto">{JSON.stringify(result, null, 2)}</div>
            </CardContent>
          </Card>
        </section>
      )}
    </RouteShell>
  );
}
