'use client';

import { useState, useEffect, useRef } from 'react';
import {
  EcosystemNavbar,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
} from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';
import type {
  AgentThought,
  AgentToolCallEvent,
  AgentToolResultEvent,
  AgentStreamEvent,
  AgentRunRequest,
  AgentRunResponse,
} from '@moonwitness/types';

export default function AgentStudioPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [request, setRequest] = useState<AgentRunRequest | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  interface AgentStepUI {
    step: number;
    thought?: string;
    tool_calls?: AgentToolCallEvent[];
    tool_results?: AgentToolResultEvent[];
    sdui?: any[];
    response?: string;
    finish_reason?: string;
  }

  const [steps, setSteps] = useState<AgentStepUI[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [sseEvents, setSSEEvents] = useState<Array<{ event: string; data: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<ReadableStream | null>(null);

  // Fetch user on mount
  useEffect(() => {
    mwClient.auth.getCurrentUser()
      .then((res) => {
        if (res?.user) setUser(res.user);
      })
      .catch(() => {});
  }, []);

  const handleRunAgent = () => {
    if (!request) return;
    setStatus('running');
    setSteps([]);
    setSSEEvents([]);
    setError(null);

    mwClient.agent.stream(request, (event, data) => {
      setSSEEvents(prev => [...prev, { event, data }]);

      // Parse and update steps based on event type
      try {
        const parsed = JSON.parse(data);
        switch (event) {
          case 'thought': {
            setSteps(prev => {
              const newStep = {
                step: parsed.step,
                thought: parsed.thought,
                finish_reason: undefined,
              };
              // Insert at current position + 1
              const newSteps = [...prev];
              newSteps.splice(currentStep + 1, prev.length - currentStep - 1, newStep);
              return newSteps;
            });
            break;
          }
          case 'tool_call': {
            setSteps(prev => {
              const newCall: AgentToolCallEvent = {
                step: parsed.step,
                call_id: parsed.call_id,
                tool: parsed.tool,
                arguments: parsed.arguments,
              };
              const newSteps = [...prev];
              newSteps.splice(currentStep + 1, newSteps.length - currentStep - 1, {
                ...newSteps[currentStep + 1] || { step: currentStep + 1 },
                tool_calls: [...(newSteps[currentStep + 1]?.tool_calls || []), newCall],
              });
              return newSteps;
            });
            break;
          }
          case 'tool_result': {
            setSteps(prev => {
              const newResult: AgentToolResultEvent = {
                step: parsed.step,
                call_id: parsed.call_id,
                tool: parsed.tool,
                success: parsed.success,
                result: parsed.result,
                error: parsed.error,
                latency_ms: parsed.latency_ms,
              };
              const newSteps = [...prev];
              newSteps.splice(currentStep + 1, newSteps.length - currentStep - 1, {
                ...newSteps[currentStep + 1] || { step: currentStep + 1 },
                tool_results: [...(newSteps[currentStep + 1]?.tool_results || []), newResult],
              });
              return newSteps;
            });
            break;
          }
          case 'sdui': {
            setSteps(prev => {
              const newSdui = parsed.data;
              const newSteps = [...prev];
              newSteps.splice(currentStep + 1, newSteps.length - currentStep - 1, {
                ...newSteps[currentStep + 1] || { step: currentStep + 1 },
                sdui: [...(newSteps[currentStep + 1]?.sdui || []), newSdui],
              });
              return newSteps;
            });
            break;
          }
          case 'chunk': {
            // Token-level response delta
            setSteps(prev => {
              const last = prev[prev.length - 1];
              if (last && last.finish_reason === 'completed') {
                return prev;
              }
              return prev.map((s, i) =>
                i === prev.length - 1
                  ? { ...s, response: (s.response || '') + (parsed.delta || '') }
                  : s
              );
            });
            break;
          }
          case 'done': {
            setStatus('completed');
            setSteps(prev => {
              const finishReason = parsed.finish_reason || 'completed';
              return prev.map(s => ({ ...s, finish_reason: finishReason }));
            });
            break;
          }
        }
      } catch (err) {
        console.error({ err }, 'SSE event parsing failed');
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to process agent stream');
      }
    });
  };

  const cancelAgent = () => {
    setStatus('idle');
    setSteps([]);
    setSSEEvents([]);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setRequest(prev => prev ? { ...prev, [name]: value === '' ? undefined : value } : {
      prompt: value,
      system: undefined,
      max_steps: name === 'max_steps' ? parseInt(value) || 8 : 8,
      timeout_ms: undefined,
      allowed_tools: undefined,
      temperature: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <EcosystemNavbar
        currentApp="headquarter"
        userName={user?.name}
        userEmail={user?.email}
        onSignOut={async () => {
          await mwClient.auth.signOut();
          setUser(null);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        {/* Agent Controls */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Agent Studio
              </h2>
              <p className="text-zinc-400 mt-1">
                Autonomous cognitive agent loop with generative SDUI synthesis
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-300 font-medium">Max Steps:</label>
              <input
                type="number"
                name="max_steps"
                min="1"
                max="20"
                value={request?.max_steps ?? 8}
                onChange={handleChange}
                className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 w-24"
              />
              <span className="text-xs text-zinc-500">1-20</span>
            </div>
          </div>
        </section>

        {/* Mission Input */}
        <section className="mb-6">
          <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">Mission Goal</label>
          <Input
            placeholder="Enter your agent mission (e.g. 'Check attachment in CAS and summarize in SDUI card')"
            value={request?.prompt || ''}
            onChange={(e) => handleChange(e)}
            disabled={status === 'running'}
          />
        </section>

        {/* Controls */}
        <section className="mb-6 flex gap-2">
          <Button
            variant={status === 'running' ? 'gold' : 'default'}
            disabled={status === 'running'}
            onClick={handleRunAgent}
          >
            {status === 'running' ? 'Running...' : 'Run Agent'}
          </Button>
          <Button
            variant="destructive"
            disabled={status !== 'running'}
            onClick={cancelAgent}
          >
            Terminate
          </Button>
        </section>

        {/* Status */}
        {status === 'running' && (
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Badge variant="active" dot className="text-emerald-400">
                LIVE
              </Badge>
              <span className="text-sm text-zinc-400">Reasoning...</span>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Max steps: {request?.max_steps ?? 8}
            </div>
          </div>
        )}

        {/* Live Reasoning Timeline */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-100 mb-3">
            Reasoning Timeline
          </h3>
          {status === 'idle' && steps.length === 0 && (
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/60 text-zinc-500 text-center">
              No steps yet. Enter a mission goal and click "Run Agent".
            </div>
          )}
          {status === 'running' || steps.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg transition-colors ${
                    i <= currentStep ? 'bg-zinc-800' : 'bg-zinc-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-300">
                      Step {step.step}
                    </span>
                    {step.finish_reason && (
                      <Badge
                        variant={step.finish_reason === 'completed' ? 'active' : 'revoked'}
                        className="text-[10px]"
                      >
                        {step.finish_reason}
                      </Badge>
                    )}
                  </div>

                  {step.thought && (
                    <div className="text-[10px] text-zinc-500 mb-1">
                      <Badge
                        variant="active"
                        className="inline-block px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 animate-pulse"
                      >
                        Thinking
                      </Badge>
                      {step.thought}
                    </div>
                  )}

                  {step.tool_calls && step.tool_calls.length > 0 && (
                    <div className="text-[10px] text-zinc-400 mb-1">
                      <span className="font-medium">Tools:</span>
                      {step.tool_calls.map((tc, j) => (
                        <span
                          key={j}
                          className="mr-1 text-[10px] bg-zinc-700/50 border border-zinc-700/60 rounded px-1.5 py-0.5"
                        >
                          {tc.tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.tool_results && step.tool_results.length > 0 && (
                    <div className="text-[10px] text-zinc-400 mb-1">
                      <span className="font-medium">Results:</span>
                      {step.tool_results.map((tr, j) => (
                        <span
                          key={j}
                          className="mr-1 text-[10px] bg-zinc-900/50 rounded px-1 py-0.5"
                        >
                          {tr.success ? 'OK' : 'ERR'}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.sdui && step.sdui.length > 0 && (
                    <div className="text-[10px] text-zinc-400 mb-1">
                      <span className="font-medium">SDUI:</span>
                      {step.sdui.map((s, j) => (
                        <span
                          key={j}
                          className="mr-1 text-[10px] bg-zinc-900/50 rounded px-1 py-0.5"
                        >
                          {s.title || 'view'}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.response && (
                    <div className="mt-2 text-[10px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {step.response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SDUI Preview */}
        <section>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-100 mb-3">
            SDUI Preview
          </h3>
          {steps.some(s => s.sdui && s.sdui.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Generated View</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] overflow-auto bg-zinc-800/50 border border-zinc-700/60">
                <pre className="text-[10px] text-zinc-400 whitespace-pre-wrap leading-relaxed">
{/* SDUI schema would be rendered here */}
SDUI view rendering - preview not yet connected to backend
</pre>
              </CardContent>
            </Card>
          )}
          {!(steps.some(s => s.sdui && s.sdui.length > 0)) && (
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/60 text-zinc-500 text-center">
              No SDUI views yet. Run an agent to generate dynamic views.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}