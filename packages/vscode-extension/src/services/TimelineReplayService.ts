/**
 * Timeline Replay Service
 * Provides audit trail, historical analysis, and replay of events
 * Tracks all LLM interactions with full context for debugging and analysis
 */

import { MissionTimelineService, TimelineEvent } from './MissionTimelineService';
import { EventEmitter } from 'events';

export interface ReplayableEvent extends TimelineEvent {
  requestId: string;
  provider?: string;
  model?: string;
  status?: 'success' | 'error' | 'unknown';
  latencyMs?: number;
  estimatedCost?: number;
  tokenCount?: number;
  requestPayload?: Record<string, any>;
  responsePayload?: Record<string, any>;
  context?: {
    user: string;
    workspace: string;
    file?: string;
  };
  metadata?: Record<string, any>;
}

export interface TimelineFilter {
  startTime?: number;
  endTime?: number;
  eventTypes?: string[];
  providers?: string[];
  models?: string[];
  statusCode?: number;
  minCost?: number;
  maxCost?: number;
  searchText?: string;
}

export interface ReplaySession {
  id: string;
  name: string;
  createdAt: number;
  events: ReplayableEvent[];
  totalDuration: number;
  statistics: {
    totalRequests: number;
    totalCost: number;
    totalTokens: number;
    averageLatency: number;
    successRate: number;
  };
}

/**
 * Singleton service for timeline replay and audit trail
 */
export class TimelineReplayService extends EventEmitter {
  private static instance: TimelineReplayService;
  private eventLog: Map<string, ReplayableEvent> = new Map();
  private replaySessions: Map<string, ReplaySession> = new Map();
  private currentSessionId: string | null = null;

  private constructor(private timeline: MissionTimelineService) {
    super();
    this.initializeEventLog();
  }

  public static getInstance(timeline?: MissionTimelineService): TimelineReplayService {
    if (!TimelineReplayService.instance) {
      if (!timeline) {
        throw new Error('MissionTimelineService required for initialization');
      }
      TimelineReplayService.instance = new TimelineReplayService(timeline);
    }
    return TimelineReplayService.instance;
  }

  /**
   * Record a replayable event in the log
   */
  public recordEvent(event: Omit<ReplayableEvent, 'requestId'>): void {
    const requestId = this.generateRequestId();
    const replayableEvent: ReplayableEvent = {
      ...event,
      requestId,
    };

    this.eventLog.set(requestId, replayableEvent);
    this.emit('eventRecorded', replayableEvent);

    // Keep only last 10,000 events
    if (this.eventLog.size > 10000) {
      const firstKey = this.eventLog.keys().next().value;
      if (firstKey !== undefined) this.eventLog.delete(firstKey);
    }
  }

  /**
   * Query events with filters
   */
  public queryEvents(filter: TimelineFilter): ReplayableEvent[] {
    let results = Array.from(this.eventLog.values());

    if (filter.startTime) {
      results = results.filter((e) => e.timestamp >= filter.startTime!);
    }

    if (filter.endTime) {
      results = results.filter((e) => e.timestamp <= filter.endTime!);
    }

    if (filter.eventTypes?.length) {
      results = results.filter((e) => filter.eventTypes!.includes(e.type));
    }

    if (filter.providers?.length) {
      results = results.filter((e) => e.provider && filter.providers!.includes(e.provider));
    }

    if (filter.models?.length) {
      results = results.filter((e) => e.model && filter.models!.includes(e.model));
    }

    if (filter.minCost !== undefined) {
      results = results.filter((e) => (e.estimatedCost ?? 0) >= filter.minCost!);
    }

    if (filter.maxCost !== undefined) {
      results = results.filter((e) => (e.estimatedCost ?? 0) <= filter.maxCost!);
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      results = results.filter((e) => {
        const descLower = (e.description ?? e.title).toLowerCase();
        const payloadStr = JSON.stringify(e.responsePayload ?? {}).toLowerCase();
        return descLower.includes(searchLower) || payloadStr.includes(searchLower);
      });
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Create a replay session from filtered events
   */
  public createReplaySession(name: string, filter: TimelineFilter): ReplaySession {
    const events = this.queryEvents(filter);
    const sessionId = this.generateSessionId();

    const statistics = this.calculateStatistics(events);

    const session: ReplaySession = {
      id: sessionId,
      name,
      createdAt: Date.now(),
      events,
      totalDuration: this.calculateDuration(events),
      statistics,
    };

    this.replaySessions.set(sessionId, session);
    return session;
  }

  /**
   * Get a replay session
   */
  public getReplaySession(sessionId: string): ReplaySession | undefined {
    return this.replaySessions.get(sessionId);
  }

  /**
   * Get all replay sessions
   */
  public getAllReplaySessions(): ReplaySession[] {
    return Array.from(this.replaySessions.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Replay events in a session (simulated)
   */
  public async replaySession(sessionId: string): Promise<void> {
    const session = this.replaySessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    this.currentSessionId = sessionId;
    this.emit('replayStarted', { sessionId, eventCount: session.events.length });

    for (let i = 0; i < session.events.length; i++) {
      const event = session.events[i];

      // Emit event for UI to display
      this.emit('eventReplaying', {
        sessionId,
        eventIndex: i,
        totalEvents: session.events.length,
        event,
        progress: ((i + 1) / session.events.length) * 100,
      });

      // Simulate event duration
      const delay = event.latencyMs || 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.emit('replayStopped', { sessionId });
    this.currentSessionId = null;
  }

  /**
   * Stop current replay session
   */
  public stopReplay(): void {
    if (this.currentSessionId) {
      this.emit('replayStopped', { sessionId: this.currentSessionId });
      this.currentSessionId = null;
    }
  }

  /**
   * Export session as JSON
   */
  public exportSessionAsJSON(sessionId: string): string {
    const session = this.replaySessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    return JSON.stringify(session, null, 2);
  }

  /**
   * Export session as CSV
   */
  public exportSessionAsCSV(sessionId: string): string {
    const session = this.replaySessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const headers = [
      'RequestID',
      'Timestamp',
      'Type',
      'Provider',
      'Model',
      'Status',
      'Latency(ms)',
      'Cost($)',
      'Description',
    ];

    const rows = session.events.map((e) => [
      e.requestId,
      new Date(e.timestamp).toISOString(),
      e.type,
      e.provider || 'N/A',
      e.model || 'N/A',
      e.status || 'unknown',
      e.latencyMs || 0,
      e.estimatedCost?.toFixed(4) || '0.0000',
      `"${(e.description ?? e.title).replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }

  /**
   * Get event by request ID
   */
  public getEventByRequestId(requestId: string): ReplayableEvent | undefined {
    return this.eventLog.get(requestId);
  }

  /**
   * Get timeline statistics for a date range
   */
  public getTimelineStatistics(startTime: number, endTime: number): {
    totalEvents: number;
    totalCost: number;
    averageLatency: number;
    successRate: number;
    topProviders: Array<{ name: string; count: number }>;
    topModels: Array<{ name: string; count: number }>;
  } {
    const events = this.queryEvents({ startTime, endTime });

    const providerCounts = new Map<string, number>();
    const modelCounts = new Map<string, number>();
    let totalCost = 0;
    let totalLatency = 0;
    let successCount = 0;

    for (const event of events) {
      // Provider stats
      if (event.provider) {
        providerCounts.set(event.provider, (providerCounts.get(event.provider) ?? 0) + 1);
      }

      // Model stats
      if (event.model) {
        modelCounts.set(event.model, (modelCounts.get(event.model) ?? 0) + 1);
      }

      // Cost and latency
      totalCost += event.estimatedCost ?? 0;
      totalLatency += event.latencyMs ?? 0;

      // Success rate
      if (event.status === 'success') {
        successCount += 1;
      }
    }

    return {
      totalEvents: events.length,
      totalCost,
      averageLatency: events.length > 0 ? totalLatency / events.length : 0,
      successRate: events.length > 0 ? (successCount / events.length) * 100 : 0,
      topProviders: Array.from(providerCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topModels: Array.from(modelCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }

  /**
   * Delete old events (retention policy)
   */
  public deleteOldEvents(olderThanMs: number): number {
    const cutoffTime = Date.now() - olderThanMs;
    let deletedCount = 0;

    for (const [key, event] of this.eventLog.entries()) {
      if (event.timestamp < cutoffTime) {
        this.eventLog.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Calculate statistics from events
   */
  private calculateStatistics(
    events: ReplayableEvent[]
  ): {
    totalRequests: number;
    totalCost: number;
    totalTokens: number;
    averageLatency: number;
    successRate: number;
  } {
    if (events.length === 0) {
      return {
        totalRequests: 0,
        totalCost: 0,
        totalTokens: 0,
        averageLatency: 0,
        successRate: 0,
      };
    }

    let totalCost = 0;
    let totalTokens = 0;
    let totalLatency = 0;
    let successCount = 0;

    for (const event of events) {
      totalCost += event.estimatedCost ?? 0;
      totalTokens += event.tokenCount ?? 0;
      totalLatency += event.latencyMs ?? 0;
      if (event.status === 'success') successCount++;
    }

    return {
      totalRequests: events.length,
      totalCost,
      totalTokens,
      averageLatency: totalLatency / events.length,
      successRate: (successCount / events.length) * 100,
    };
  }

  /**
   * Calculate total duration of events
   */
  private calculateDuration(events: ReplayableEvent[]): number {
    if (events.length === 0) return 0;

    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const firstEvent = sorted[0];
    const lastEvent = sorted[sorted.length - 1];

    return lastEvent.timestamp - firstEvent.timestamp;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize event log from mission timeline
   */
  private initializeEventLog(): void {
    // Seed with recent events from timeline
    const recentEvents = this.timeline.getCurrentTimeline()?.events.slice(-100) ?? this.timeline.getAllTimelines().flatMap((timeline) => timeline.events).slice(-100);

    for (const tlEvent of recentEvents) {
      this.recordEvent({
        id: tlEvent.id,
        timestamp: tlEvent.timestamp,
        type: tlEvent.type,
        provider: 'unknown',
        model: 'unknown',
        status: 'success',
        title: tlEvent.title,
        description: tlEvent.description,
        latencyMs: 100,
        tokenCount: 0,
        estimatedCost: 0,
      });
    }
  }
}
