/**
 * Request Queue
 * Manages queuing and replay of failed requests for offline mode
 */

export interface QueuedRequest {
  id: string;
  timestamp: number;
  provider: string;
  operation: 'chat' | 'stream' | 'listModels';
  payload: unknown;
  retries: number;
}

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private readonly maxQueueSize = 50;
  private processing = false;

  /**
   * Add request to queue
   */
  enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): QueuedRequest {
    const queued: QueuedRequest = {
      ...request,
      id: `req-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queued);

    // Enforce max queue size
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift(); // Remove oldest
    }

    return queued;
  }

  /**
   * Get next request from queue
   */
  dequeue(): QueuedRequest | undefined {
    return this.queue.shift();
  }

  /**
   * Requeue a failed request
   */
  requeue(request: QueuedRequest): void {
    request.retries++;

    if (request.retries > 3) {
      // Max retries reached
      return;
    }

    this.queue.unshift(request); // Put back at front
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Get all queued requests
   */
  getAll(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Start processing queue
   */
  async process(
    processor: (request: QueuedRequest) => Promise<boolean>
  ): Promise<number> {
    if (this.processing) return 0;
    this.processing = true;

    let processed = 0;

    try {
      while (!this.isEmpty()) {
        const request = this.dequeue();
        if (!request) break;

        try {
          const success = await processor(request);
          if (success) {
            processed++;
          } else {
            this.requeue(request);
            break; // Stop processing if one fails
          }
        } catch (error) {
          this.requeue(request);
          break;
        }
      }
    } finally {
      this.processing = false;
    }

    return processed;
  }

  /**
   * Get statistics
   */
  getStats(): {
    queueSize: number;
    oldestRequestAgeMs: number;
    averageRetriesPerRequest: number;
  } {
    const queueSize = this.queue.length;
    const now = Date.now();

    const oldestRequestAgeMs = this.queue.length > 0
      ? now - this.queue[0].timestamp
      : 0;

    const averageRetriesPerRequest =
      this.queue.length > 0
        ? this.queue.reduce((sum, r) => sum + r.retries, 0) / this.queue.length
        : 0;

    return {
      queueSize,
      oldestRequestAgeMs,
      averageRetriesPerRequest,
    };
  }
}
