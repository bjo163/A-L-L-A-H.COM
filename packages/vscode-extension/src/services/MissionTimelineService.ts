/**
 * Mission Timeline Service
 * Manages mission execution timeline and events
 */

export type TimelineEventType =
  | 'mission.started'
  | 'mission.completed'
  | 'mission.failed'
  | 'mission.cancelled'
  | 'context.selected'
  | 'thinking'
  | 'tool_use'
  | 'response.received'
  | 'edits.previewed'
  | 'edits.applied'
  | 'validation.started'
  | 'validation.passed'
  | 'validation.failed';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: number;
  durationMs?: number;
  title: string;
  description?: string;
  details?: Record<string, unknown>;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost?: number;
  metadata?: Record<string, unknown>;
}

export interface MissionTimeline {
  missionId: string;
  startedAt: number;
  endedAt?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  events: TimelineEvent[];
  totalTokens: number;
  totalCost: number;
  model: string;
  provider: string;
}

export class MissionTimelineService {
  private static instance: MissionTimelineService;
  private currentTimeline: MissionTimeline | null = null;
  private timelines: Map<string, MissionTimeline> = new Map();
  private maxTimelineSize = 100;

  private constructor() {}

  static getInstance(): MissionTimelineService {
    if (!MissionTimelineService.instance) {
      MissionTimelineService.instance = new MissionTimelineService();
    }
    return MissionTimelineService.instance;
  }

  /**
   * Start a new mission timeline
   */
  startMission(missionId: string, model: string, provider: string): MissionTimeline {
    this.currentTimeline = {
      missionId,
      startedAt: Date.now(),
      status: 'running',
      events: [],
      totalTokens: 0,
      totalCost: 0,
      model,
      provider,
    };

    this.addEvent('mission.started', `Started ${provider}/${model}`, `Mission started with ${model}`);

    return this.currentTimeline;
  }

  /**
   * Add event to timeline
   */
  addEvent(
    type: TimelineEventType,
    title: string,
    description?: string,
    details?: Record<string, unknown>
  ): TimelineEvent | null {
    if (!this.currentTimeline) return null;

    const event: TimelineEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      type,
      timestamp: Date.now(),
      title,
      description,
      details,
    };

    this.currentTimeline.events.push(event);
    return event;
  }

  /**
   * Update last event with token usage and cost
   */
  recordTokenUsage(
    inputTokens: number,
    outputTokens: number,
    totalTokens: number,
    cost: number
  ): void {
    if (!this.currentTimeline || this.currentTimeline.events.length === 0) return;

    const lastEvent = this.currentTimeline.events[this.currentTimeline.events.length - 1];
    lastEvent.tokenUsage = { inputTokens, outputTokens, totalTokens };
    lastEvent.cost = cost;

    this.currentTimeline.totalTokens += totalTokens;
    this.currentTimeline.totalCost += cost;
  }

  /**
   * Mark thinking event
   */
  addThinkingEvent(step: string): TimelineEvent | null {
    return this.addEvent('thinking', `Thinking: ${step}`, `Agent is analyzing: ${step}`, {
      step,
    });
  }

  /**
   * Mark tool use
   */
  addToolUseEvent(toolName: string, toolInput?: Record<string, unknown>): TimelineEvent | null {
    return this.addEvent('tool_use', `Using ${toolName}`, `Tool: ${toolName}`, {
      tool: toolName,
      input: toolInput,
    });
  }

  /**
   * Mark response received
   */
  addResponseEvent(content: string): TimelineEvent | null {
    return this.addEvent('response.received', 'Response received', content.substring(0, 100), {
      contentLength: content.length,
    });
  }

  /**
   * Mark edits previewed
   */
  addEditsPreviewedEvent(editCount: number, fileCount: number): TimelineEvent | null {
    return this.addEvent('edits.previewed', `${editCount} edits in ${fileCount} files`, `Previewed ${editCount} changes`, {
      editCount,
      fileCount,
    });
  }

  /**
   * Mark edits applied
   */
  addEditsAppliedEvent(editCount: number): TimelineEvent | null {
    return this.addEvent('edits.applied', `${editCount} edits applied`, `Changes applied to workspace`, {
      editCount,
    });
  }

  /**
   * Complete mission
   */
  completeMission(status: 'completed' | 'failed' | 'cancelled'): MissionTimeline | null {
    if (!this.currentTimeline) return null;

    this.currentTimeline.status = status;
    this.currentTimeline.endedAt = Date.now();

    this.addEvent(`mission.${status}`, `Mission ${status}`, `Total: ${this.currentTimeline.totalTokens} tokens, $${this.currentTimeline.totalCost.toFixed(4)}`);

    // Store timeline
    this.timelines.set(this.currentTimeline.missionId, this.currentTimeline);

    // Enforce max size
    if (this.timelines.size > this.maxTimelineSize) {
      const oldest = this.timelines.keys().next().value;
      if (oldest !== undefined) {
        this.timelines.delete(oldest);
      }
    }

    const completed = this.currentTimeline;
    this.currentTimeline = null;
    return completed;
  }

  /**
   * Get current mission timeline
   */
  getCurrentTimeline(): MissionTimeline | null {
    return this.currentTimeline;
  }

  /**
   * Get mission timeline by ID
   */
  getTimeline(missionId: string): MissionTimeline | undefined {
    return this.timelines.get(missionId);
  }

  /**
   * Get all timelines
   */
  getAllTimelines(): MissionTimeline[] {
    return Array.from(this.timelines.values());
  }

  /**
   * Calculate duration of mission
   */
  getMissionDurationMs(missionId: string): number | null {
    const timeline = this.timelines.get(missionId);
    if (!timeline || !timeline.endedAt) return null;
    return timeline.endedAt - timeline.startedAt;
  }

  /**
   * Export timeline as JSON
   */
  exportTimeline(missionId: string): string | null {
    const timeline = this.timelines.get(missionId);
    if (!timeline) return null;
    return JSON.stringify(timeline, null, 2);
  }

  /**
   * Export with redaction for sharing
   */
  exportTimelineRedacted(missionId: string): string | null {
    const timeline = this.timelines.get(missionId);
    if (!timeline) return null;

    const redacted = { ...timeline };
    redacted.events = redacted.events.map((e) => ({
      ...e,
      description: e.description ? e.description.substring(0, 50) + '...' : undefined,
      details: undefined, // Remove sensitive details
    }));

    return JSON.stringify(redacted, null, 2);
  }

  /**
   * Clear old timelines
   */
  clearOldTimelines(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoffTime = Date.now() - maxAgeMs;
    let removed = 0;

    for (const [missionId, timeline] of this.timelines) {
      if (timeline.startedAt < cutoffTime) {
        this.timelines.delete(missionId);
        removed++;
      }
    }

    return removed;
  }
}
