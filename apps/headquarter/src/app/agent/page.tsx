'use client';

import { useState } from 'react';
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

interface AgentStepItem {
  step: number;
  thought?: string;
  tool?: string;
  arguments?: string;
  result?: any;
  latency_ms?: number;
  success?: boolean;
}

export default function AgentStudioPage() {
  const [prompt, setPrompt] = useState('Analisis kesehatan database dan render ringkasan SDUI');
  const [maxSteps, setMaxSteps] = useState(6);
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState('Idle');
  const [steps, setSteps] = useState<AgentStepItem[]>([]);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [sduiPayload, setSduiPayload] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAgentStream = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setStatusText('Memulai cognitive reasoning...');
    setSteps([]);
    setFinalAnswer('');
    setSduiPayload(null);
    setError(null);

    try {
      await mwClient.agent.stream(
        {
          prompt,
          max_steps: maxSteps,
        },
        (event, data) => {
          if (event === 'thought') {
            setStatusText(`Step ${data.step}: Berpikir...`);
            setSteps((prev) => [
              ...prev,
              { step: data.step, thought: (data.message as string) || 'Reasoning...' },
            ]);
          } else if (event === 'tool_call') {
            setStatusText(`Step ${data.step}: Memanggil ${data.tool}...`);
            setSteps((prev) => [
              ...prev,
              {
                step: data.step,
                tool: data.tool as string,
                arguments: typeof data.arguments === 'string' ? data.arguments : JSON.stringify(data.arguments),
              },
            ]);
          } else if (event === 'tool_result') {
            setStatusText(`Step ${data.step}: Observasi selesai (${data.latency_ms || 0}ms)`);
            setSteps((prev) =>
              prev.map((s, idx) =>
                idx === prev.length - 1
                  ? {
                      ...s,
                      result: data.data,
                      latency_ms: data.latency_ms,
                      success: data.success,
                    }
                  : s
              )
            );
          } else if (event === 'sdui') {
            setSduiPayload(data.payload);
          } else if (event === 'chunk') {
            setFinalAnswer((prev) => prev + (data.delta || ''));
          } else if (event === 'done') {
            setStatusText(`Selesai (${data.finish_reason || 'completed'})`);
            setIsRunning(false);
          } else if (event === 'error') {
            setError(data.error as string);
            setIsRunning(false);
          }
        }
      );
    } catch (err: any) {
      setError(err.message || 'Gagal menjalankan cognitive agent loop');
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-zinc-100 flex flex-col font-sans">
      <EcosystemNavbar
        currentApp="headquarter"
        userName={undefined}
        userEmail={undefined}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Autonomous Cognitive Agent Studio
              </h1>
              <Badge variant="active" dot>
                AGI Phase 4
              </Badge>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Multi-step ReAct cognitive loop with native executive tool execution and generative SDUI synthesis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Status Loop:</span>
            <Badge
              variant={isRunning ? 'active' : 'default'}
              dot={isRunning}
            >
              {statusText}
            </Badge>
          </div>
        </div>

        {/* Mission Input Form */}
        <Card className="bg-zinc-900/60 border-zinc-800 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white">Mission Goal & Instructions</CardTitle>
            <CardDescription className="text-zinc-400">
              Instruksikan tujuan kepada agen kognitif. Agen akan memilih tools (SQL, Storage CAS, Web Fetch, Qorpus, SDUI) secara otonom.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Masukkan target misi otonom..."
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500"
                  disabled={isRunning}
                />
              </div>
              <div className="w-full md:w-36 flex items-center gap-2">
                <span className="text-xs text-zinc-400 whitespace-nowrap">Max Steps:</span>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={maxSteps}
                  onChange={(e) => setMaxSteps(parseInt(e.target.value) || 6)}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 text-center"
                  disabled={isRunning}
                />
              </div>
              <Button
                onClick={startAgentStream}
                disabled={isRunning || !prompt.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 whitespace-nowrap"
              >
                {isRunning ? 'Menjalankan Loop...' : 'Jalankan Agen'}
              </Button>
            </div>
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-md text-sm text-red-400">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Execution Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cognitive Reasoning Steps Timeline */}
          <Card className="bg-zinc-900/60 border-zinc-800 shadow-xl">
            <CardHeader className="pb-3 border-b border-zinc-800/80">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white">Cognitive Trajectory</CardTitle>
                <Badge variant="default">
                  {steps.length} Actions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 max-h-[500px] overflow-y-auto">
              {steps.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm">
                  Belum ada eksekusi. Masukkan tujuan di atas lalu tekan "Jalankan Agen".
                </div>
              ) : (
                steps.map((st, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-cyan-400">Step {st.step}</span>
                      {st.tool && (
                        <Badge
                          variant={st.success === false ? 'revoked' : 'active'}
                        >
                          Tool: {st.tool} {st.latency_ms ? `(${st.latency_ms}ms)` : ''}
                        </Badge>
                      )}
                    </div>
                    {st.thought && (
                      <p className="text-zinc-300 text-xs italic">💭 {st.thought}</p>
                    )}
                    {st.arguments && (
                      <div className="bg-black/40 p-2 rounded text-xs font-mono text-zinc-400 overflow-x-auto">
                        <span className="text-zinc-500">args:</span> {st.arguments}
                      </div>
                    )}
                    {st.result && (
                      <div className="bg-black/60 p-2 rounded text-xs font-mono text-emerald-300/90 overflow-x-auto">
                        <span className="text-zinc-500">observation:</span>{' '}
                        {typeof st.result === 'object' ? JSON.stringify(st.result) : String(st.result)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Generative SDUI Viewport & Final Answer */}
          <div className="space-y-6">
            {/* Generative SDUI Viewport */}
            <Card className="bg-zinc-900/60 border-zinc-800 shadow-xl">
              <CardHeader className="pb-3 border-b border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-white">
                    Generative SDUI Viewport
                  </CardTitle>
                  {sduiPayload && (
                    <Badge variant="gold">
                      {sduiPayload.view_type} synthesized
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {sduiPayload ? (
                  <div className="p-4 rounded-lg bg-zinc-950 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-base">{sduiPayload.title}</h4>
                      <span className="text-xs text-zinc-500 font-mono">{sduiPayload.id}</span>
                    </div>
                    {sduiPayload.props && (
                      <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded">
                        {Object.entries(sduiPayload.props).map(([k, v]) => (
                          <div key={k} className="flex flex-col">
                            <span className="text-zinc-500">{k}</span>
                            <span className="text-zinc-200 font-medium">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500 text-sm">
                    Viewport SDUI kosong. Agen akan merender UI secara generatif saat alat `render_sdui` dipanggil.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Final Answer Stream */}
            <Card className="bg-zinc-900/60 border-zinc-800 shadow-xl">
              <CardHeader className="pb-3 border-b border-zinc-800/80">
                <CardTitle className="text-base font-semibold text-white">Agent Answer & Synthesis</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {finalAnswer ? (
                  <div className="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {finalAnswer}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    Menunggu sintesis kesimpulan akhir dari agen...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
