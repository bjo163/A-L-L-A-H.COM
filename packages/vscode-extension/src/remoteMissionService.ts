import * as vscode from 'vscode';
import type { RemoteAgentMission } from './contracts';
import { MoonWitnessClient } from './client';
import { LocalAgentWorkbenchProvider } from './localAgentWorkbench';

function finalEvent(state: string | undefined): 'completed' | 'cancelled' | 'failed' | 'blocked' {
  if (state === 'completed' || state === 'cancelled' || state === 'blocked') return state;
  return 'failed';
}

export class RemoteMissionService implements vscode.Disposable {
  private readonly output = vscode.window.createOutputChannel('A-L-L-A-H Agent');
  private timer: ReturnType<typeof setTimeout> | undefined;
  private activeMission: { id: string; controller: AbortController } | undefined;
  private disposed = false;
  private lastError = '';

  constructor(
    private readonly client: MoonWitnessClient,
    private readonly localAgent: LocalAgentWorkbenchProvider
  ) {}

  start(): void {
    this.schedule(0);
  }

  dispose(): void {
    this.disposed = true;
    if (this.timer) clearTimeout(this.timer);
    this.activeMission?.controller.abort();
    this.output.dispose();
  }

  private schedule(delayMs: number): void {
    if (this.disposed) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.poll();
    }, delayMs);
  }

  private async poll(): Promise<void> {
    if (this.disposed) return;
    try {
      const deviceToken = await this.client.getAgentDeviceToken();
      if (!deviceToken) {
        this.schedule(15_000);
        return;
      }

      const result = await this.client.pollAgentMission(deviceToken);
      this.lastError = '';
      const mission = result.mission;
      if (!mission) {
        this.schedule(3_000);
        return;
      }

      if (mission.state === 'cancel_requested') {
        if (this.activeMission?.id === mission.id) {
          this.activeMission?.controller.abort();
        } else {
          await this.reportEvent(deviceToken, mission.id, 'cancelled');
        }
        this.schedule(3_000);
        return;
      }

      if (mission.state === 'running') {
        if (this.activeMission?.id !== mission.id) {
          this.startMission(deviceToken, mission);
        }
      }
      this.schedule(3_000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message !== this.lastError) {
        this.output.appendLine(`Remote mission connection failed: ${message}`);
        this.lastError = message;
      }
      this.schedule(15_000);
    }
  }

  private startMission(deviceToken: string, mission: RemoteAgentMission): void {
    if (this.activeMission) {
      this.output.appendLine(`Mission ${mission.id} could not start because another local session is active.`);
      void this.reportEvent(deviceToken, mission.id, 'blocked');
      return;
    }

    const controller = new AbortController();
    this.activeMission = { id: mission.id, controller };
    void vscode.window.showInformationMessage(
      `Headquarter started a ${mission.mode} mission on this paired device. Review the local workspace and context-consent prompts.`
    );
    void this.executeMission(deviceToken, mission, controller);
  }

  private async executeMission(
    deviceToken: string,
    mission: RemoteAgentMission,
    controller: AbortController
  ): Promise<void> {
    try {
      const state = await this.localAgent.executeRemoteMission(mission, controller.signal);
      await this.reportEvent(deviceToken, mission.id, finalEvent(state));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.output.appendLine(`Remote mission ${mission.id} failed: ${message}`);
      await this.reportEvent(deviceToken, mission.id, 'failed');
    } finally {
      if (this.activeMission?.id === mission.id) this.activeMission = undefined;
      this.schedule(0);
    }
  }

  private async reportEvent(deviceToken: string, missionId: string, event: string): Promise<void> {
    try {
      await this.client.reportAgentMissionEvent(deviceToken, missionId, event);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.output.appendLine(`Could not report ${event} for remote mission ${missionId}: ${message}`);
    }
  }
}
