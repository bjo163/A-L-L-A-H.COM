import crypto from 'crypto';
import { logger } from '@allah/arsy-core';
import { SmartRouter } from '../router';
import { toolRegistry } from '../tools';
import type {
  SwarmRole,
  SwarmAgentMessage,
  SwarmStep,
  SwarmRunRequest,
  SwarmExecutionResult,
} from './types';
import type { ChatMessage } from '../types';

const MAX_TURNS_DEFAULT = 12;
const MAX_TURNS_CAP = 24;
const MAX_VERIFIER_REJECTIONS = 3;

type SSEEmitter = (event: string, data: unknown) => void;

interface WorkerRoleConfig {
  role: SwarmRole;
  systemPrompt: string;
  tools: string[];
}

const ROLE_CONFIGS: Record<SwarmRole, WorkerRoleConfig> = {
  planner: {
    role: 'planner',
    systemPrompt:
      'You are the Supervisor & Planner. Deconstruct the goal into specialized subtasks and delegate to researcher, builder, then verifier. Emit a concise execution plan.',
    tools: [],
  },
  researcher: {
    role: 'researcher',
    systemPrompt:
      'You are the Researcher Agent. Retrieve contextual schema, API contracts, and prior memories using qorpus_retrieve and pglite_query. Return findings for the builder.',
    tools: ['qorpus_retrieve', 'pglite_query', 'web_fetch'],
  },
  builder: {
    role: 'builder',
    systemPrompt:
      'You are the Builder Agent. Execute tools, generate code, and render SDUI components. Produce concrete artifacts for the verifier to check.',
    tools: ['pglite_query', 'storage_cas', 'render_sdui', 'web_fetch'],
  },
  verifier: {
    role: 'verifier',
    systemPrompt:
      'You are the Reviewer / QA Agent. Verify the outcome against acceptance criteria: documentation contract, architectural invariants, and typechecks. Sign off only if requirements are fully satisfied, otherwise emit a rejection verdict.',
    tools: [],
  },
};

interface SwarmMission {
  id: string;
  goal: string;
  companyId: string;
  maxTurns: number;
  allowedTools: string[];
  temperature: number;
  step: number;
  messages: SwarmAgentMessage[];
  steps: SwarmStep[];
  verifierRejections: number;
  status: 'running' | 'completed' | 'max_turns' | 'human_intervention' | 'error';
  summary: string;
  error?: string;
}

export class SwarmCoordinator {
  private missions = new Map<string, SwarmMission>();
  private onEvent?: SSEEmitter;

  async run(request: SwarmRunRequest, onEvent?: SSEEmitter): Promise<SwarmExecutionResult> {
    this.onEvent = onEvent;
    const mission = this.createMission(request);
    this.missions.set(mission.id, mission);

    try {
      await this.execute(mission);
    } catch (err: any) {
      logger.error({ err, mission: mission.id }, 'Swarm mission failed');
      mission.status = 'error';
      mission.error = err.message || 'Swarm execution failed';
    }

    const result = this.buildResult(mission);
    this.missions.delete(mission.id);
    return result;
  }

  createMission(request: SwarmRunRequest): SwarmMission {
    const maxTurns = Math.min(request.max_turns ?? MAX_TURNS_DEFAULT, MAX_TURNS_CAP);
    return {
      id: `swarm_${crypto.randomBytes(6).toString('hex')}`,
      goal: request.goal,
      companyId: request.company_id ?? 'default',
      maxTurns,
      allowedTools: request.allowed_tools ?? [],
      temperature: request.temperature ?? 0.2,
      step: 1,
      messages: [],
      steps: [],
      verifierRejections: 0,
      status: 'running',
      summary: '',
    };
  }

  private async execute(mission: SwarmMission): Promise<void> {
    const router = new SmartRouter({});
    await router.initialize();

    const planStep = this.startStep(mission, 'planner', 'decompose', { goal: mission.goal });
    const planVerdict = await this.askModel(router, ROLE_CONFIGS.planner, mission, planStep, false);
    planStep.output = planVerdict;

    const researchStep = this.startStep(mission, 'researcher', 'retrieve', { plan: planVerdict });
    const research = await this.askModel(router, ROLE_CONFIGS.researcher, mission, researchStep, false);
    researchStep.output = research;

    const buildStep = this.startStep(mission, 'builder', 'execute', { research });
    let built = await this.askModel(router, ROLE_CONFIGS.builder, mission, buildStep, true);
    buildStep.output = built;

    while (mission.status === 'running') {
      if (mission.step > mission.maxTurns) {
        mission.status = 'max_turns';
        mission.summary = `Max turns (${mission.maxTurns}) reached without verifier consensus.`;
        return;
      }

      const verifyStep = this.startStep(mission, 'verifier', 'verify', { built });
      const verdict = await this.askModel(router, ROLE_CONFIGS.verifier, mission, verifyStep, false);
      verifyStep.output = verdict;

      const approved = this.parseApproval(verdict);
      this.emit('swarm_verdict', {
        ...verifyStep,
        thought: approved ? 'Mission signed off' : 'Mission rejected by verifier',
        success: approved,
      });

      if (approved) {
        mission.status = 'completed';
        mission.summary = typeof built === 'string' ? built : 'Mission completed and verified.';
        return;
      }

      mission.verifierRejections += 1;
      if (mission.verifierRejections >= MAX_VERIFIER_REJECTIONS) {
        mission.status = 'human_intervention';
        mission.summary = 'Builder/Verifier cycle exceeded max rejections. Human operator intervention required.';
        this.emit('swarm_verdict', {
          ...verifyStep,
          thought: 'Human intervention required',
          success: false,
        });
        return;
      }

      const reviseStep = this.startStep(mission, 'builder', 'revise', { built, verdict });
      built = await this.askModel(router, ROLE_CONFIGS.builder, mission, reviseStep, true);
      reviseStep.output = built;
    }
  }

  private startStep(
    mission: SwarmMission,
    agent: SwarmRole,
    action: string,
    input: Record<string, unknown>
  ): SwarmStep {
    const step: SwarmStep = {
      step: mission.step,
      agent,
      action,
      input,
      success: false,
      timestamp: new Date().toISOString(),
    };
    mission.step += 1;
    mission.steps.push(step);
    this.emit('swarm_agent_step', step);
    return step;
  }

  private async askModel(
    router: SmartRouter,
    config: WorkerRoleConfig,
    mission: SwarmMission,
    step: SwarmStep,
    allowTools: boolean
  ): Promise<string> {
    const startTime = Date.now();
    const resolution = await router.resolveRoute('dx-default');
    const model = resolution.targetChain[0]?.adapter;

    const messages: ChatMessage[] = [
      { role: 'system', content: config.systemPrompt },
      {
        role: 'user',
        content: `Mission: ${mission.goal}\nStep ${step.step} (${step.action}): ${JSON.stringify(
          step.input ?? {}
        )}\nRecent swarm messages:\n${JSON.stringify(
          mission.messages.slice(-6).map((m) => ({ from: m.from, to: m.to, payload: m.payload }))
        )}`,
      },
    ];

    const toolDefinitions = allowTools
      ? toolRegistry
          .list()
          .filter((t) => config.tools.includes(t.name))
          .map((t) => ({
            type: 'function' as const,
            function: { name: t.name, description: t.description, parameters: t.inputSchema },
          }))
      : undefined;

    const response = await model.chat(
      {
        model: resolution.targetChain[0]?.model?.model_id || 'dx-default',
        messages,
        temperature: mission.temperature,
        stream: false,
        tools: toolDefinitions as any,
      },
      resolution.targetChain[0]?.model?.model_id || 'dx-default'
    );

    const toolCalls = this.extractToolCalls(response);
    if (toolCalls.length > 0) {
      for (const tc of toolCalls) {
        const result = await toolRegistry.execute(tc.name, tc.arguments, {
          virtualKeyId: 1,
          actor: config.role,
        });
        const msg: SwarmAgentMessage = {
          id: `msg_${crypto.randomBytes(5).toString('hex')}`,
          from: config.role,
          to: config.role === 'planner' ? 'researcher' : config.role === 'researcher' ? 'builder' : 'verifier',
          role: config.role,
          payload: { tool: tc.name, result: result.output ?? result.error },
          timestamp: new Date().toISOString(),
          latency_ms: result.latencyMs,
        };
        mission.messages.push(msg);
        this.emit('swarm_message', msg);
      }
    }

    step.success = true;
    step.latency_ms = Date.now() - startTime;
    const content = response.choices?.[0]?.message?.content || '';
    step.output = content;
    this.emit('swarm_agent_step', { ...step });

    return content;
  }

  private extractToolCalls(response: any): Array<{ name: string; arguments: Record<string, unknown> }> {
    const choices = response?.choices || [];
    const message = choices[0]?.message;
    if (!message?.tool_calls) return [];
    return message.tool_calls.map((tc: any) => ({
      name: tc.function?.name || '',
      arguments: (() => {
        try {
          return JSON.parse(tc.function?.arguments || '{}');
        } catch {
          return {};
        }
      })(),
    }));
  }

  private parseApproval(output: string): boolean {
    const low = output.toLowerCase();
    if (
      low.includes('approved') ||
      low.includes('sign-off') ||
      low.includes('signoff') ||
      low.includes('pass') ||
      low.includes('verified')
    ) {
      return true;
    }
    if (low.includes('reject') || low.includes('revision') || low.includes('failed') || low.includes('needs')) {
      return false;
    }
    return false;
  }

  private buildResult(mission: SwarmMission): SwarmExecutionResult {
    const finishReason =
      mission.status === 'completed'
        ? 'completed'
        : mission.status === 'human_intervention'
          ? 'human_intervention'
          : mission.status === 'max_turns'
            ? 'max_turns'
            : mission.status === 'error'
              ? 'error'
              : 'verifier_rejected';

    return {
      success: mission.status === 'completed',
      mission_id: mission.id,
      goal: mission.goal,
      summary: mission.summary,
      steps: mission.steps,
      messages: mission.messages,
      finish_reason: finishReason,
      error: mission.error,
    };
  }

  private emit(event: string, data: unknown): void {
    if (this.onEvent) {
      try {
        this.onEvent(event, data);
      } catch {
        // Client disconnected
      }
    }
  }
}

export const swarmCoordinator = new SwarmCoordinator();