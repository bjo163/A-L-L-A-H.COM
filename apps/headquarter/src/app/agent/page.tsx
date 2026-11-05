'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  RouteShell,
  StatePanel,
  StatusMessage,
} from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';
import type { AgentRunInput } from '@moonwitness/types';
import { RemoteAgentControlPanel } from '@/components/remote-agent-control-panel';
import { RouteHeader } from '@/components/route-header';
import { SDUINodeView } from '@/components/sdui-node';
import {
  agentStepsReducer,
  eventToAction,
  initialAgentSteps,
  type AgentStepUI,
} from '@/lib/agent-steps-reducer';
import { useDocumentTitle } from '@/lib/use-document-title';
import { describeError } from '@/lib/hq-format';

type RunStatus = 'idle' | 'running' | 'completed' | 'error';

export default function AgentStudioPage() {
  useDocumentTitle('Agent Studio | Headquarter');

  const [request, setRequest] = useState<AgentRunInput | null>(null);
  const [status, setStatus] = useState<RunStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [steps, dispatch] = useReducer(agentStepsReducer, initialAgentSteps);

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const isRunning = status === 'running';

  const handleRunAgent = async () => {
    if (!request?.prompt?.trim() || isRunning) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('running');
    dispatch({ type: 'reset' });
    setError(null);

    try {
      await mwClient.agent.stream(
        request,
        (event, data) => {
          const action = eventToAction(event, data);
          if (action) dispatch(action);
          if (event === 'done') setStatus('completed');
        },
        controller.signal,
      );
      // The stream resolved without an explicit 'done' event: settle as completed.
      setStatus((current) => (current === 'running' ? 'completed' : current));
    } catch (streamError) {
      if (controller.signal.aborted) {
        setStatus('idle');
      } else {
        setStatus('error');
        setError(describeError(streamError));
      }
    } finally {
      controllerRef.current = null;
    }
  };

  const terminateAgent = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus('idle');
    dispatch({ type: 'reset' });
    setError(null);
  };

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRequest((prev) => {
      const base: AgentRunInput = prev ?? { prompt: '', max_steps: 8 };
      if (name === 'max_steps') {
        return { ...base, max_steps: value === '' ? 8 : parseInt(value, 10) || 8 };
      }
      return { ...base, prompt: value };
    });
  }, []);

  const sduiNodes = steps.flatMap((step: AgentStepUI) => step.sdui);

  return (
    <RouteShell as="main" className="hq-route hq-agent">
      <RouteHeader
        title="Agent Studio"
        summary="Autonomous cognitive agent loop with generative SDUI synthesis."
        status={isRunning ? <Badge variant="active" dot>Running</Badge> : null}
      />

      <section className="hq-section" aria-label="Agent controls">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Mission Goal"
            name="prompt"
            placeholder="Enter your agent mission (e.g. 'Check attachment in CAS and summarize in an SDUI card')"
            value={request?.prompt || ''}
            onChange={handleChange}
            disabled={isRunning}
            className="flex-1 min-w-0"
          />
          <div className="flex items-end gap-2">
            <Input
              type="number"
              label="Max Steps"
              name="max_steps"
              min="1"
              max="20"
              value={request?.max_steps ?? 8}
              onChange={handleChange}
              disabled={isRunning}
              className="w-24"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant={isRunning ? 'gold' : 'default'} disabled={isRunning || !request?.prompt?.trim()} onClick={handleRunAgent}>
            {isRunning ? 'Running…' : 'Run Agent'}
          </Button>
          <Button variant="destructive" disabled={!isRunning} onClick={terminateAgent}>Terminate</Button>
        </div>
      </section>

      {error && (
        <StatusMessage tone="danger" title="Agent run failed" action={<Button variant="outline" size="sm" onClick={handleRunAgent}>Retry</Button>}>
          {error}
        </StatusMessage>
      )}

      <section className="hq-section" aria-labelledby="agent-timeline-title">
        <div className="hq-section__heading">
          <h2 id="agent-timeline-title">Reasoning Timeline</h2>
          {isRunning && <span className="hq-section__meta">Reasoning…</span>}
        </div>

        {steps.length === 0 ? (
          <StatePanel
            kind="empty"
            title="No steps yet"
            cause="The agent has not streamed any events."
            nextAction="Enter a mission goal and click Run Agent."
          />
        ) : (
          <ul className="hq-log-list" aria-live="polite">
            {steps.map((step) => (
              <li className="hq-log-item" key={step.step}>
                <div className="hq-log-item__head">
                  <span className="text-sm font-medium">Step {step.step}</span>
                  {step.finish_reason && (
                    <Badge variant={step.finish_reason === 'completed' ? 'active' : 'revoked'}>{step.finish_reason}</Badge>
                  )}
                </div>

                {step.thought && (
                  <div className="space-y-1">
                    <Badge variant="active">Thinking</Badge>
                    <p className="text-sm">{step.thought}</p>
                  </div>
                )}

                {step.tool_calls.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {step.tool_calls.map((call, index) => (
                      <span className="hq-micro hq-mono" key={`${call.call_id}-${index}`}>{call.tool}</span>
                    ))}
                  </div>
                )}

                {step.tool_results.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {step.tool_results.map((result, index) => (
                      <Badge variant={result.success ? 'active' : 'revoked'} key={`${result.call_id}-${index}`}>
                        {result.success ? 'OK' : 'ERR'}
                      </Badge>
                    ))}
                  </div>
                )}

                {step.response && (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{step.response}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="hq-section" aria-labelledby="agent-sdui-title">
        <div className="hq-section__heading">
          <h2 id="agent-sdui-title">SDUI Preview</h2>
        </div>

        {sduiNodes.length === 0 ? (
          <StatePanel
            kind="empty"
            title="No SDUI views yet"
            cause="The agent has not emitted any server-driven UI."
            nextAction="Run an agent that produces an SDUI card to preview it here."
          />
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Generated View</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sduiNodes.map((node, index) => <SDUINodeView key={index} node={node} />)}
            </CardContent>
          </Card>
        )}
      </section>

      <RemoteAgentControlPanel />
    </RouteShell>
  );
}
