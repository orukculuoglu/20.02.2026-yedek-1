/**
 * Data Engine Event Queue
 * Resilient client-side delivery pipeline for Data Engine events
 * 
 * Features:
 * - In-memory + localStorage persistence
 * - Exponential backoff retry (5s * 2^attempts, max 60min)
 * - Queue cap: 500 events (FIFO drop oldest)
 * - PII-safe: Redacts VIN/plate/phone/email before storing
 * - Observable: DEV-only stats (size, oldest, newest)
 * 
 * Usage:
 * - enqueueEvent(payload) → Add to queue
 * - flushQueue(sender) → Attempt to send queued events
 * - startQueueWorker(sender, opts) → Auto-retry on interval
 */

import { sanitizeMeta } from "./utils/sanitizeMeta";

export interface QueuedEvent {
  id: string;                    // Unique event ID
  createdAt: string;             // ISO timestamp when queued
  attempts: number;              // Number of send attempts so far
  nextRetryAt: string;           // ISO timestamp for next retry (exponential backoff)
  payload: any;                  // Event payload (PII-redacted before storage)
  lastError?: string;            // Last error message (safe, non-PII)
}

export interface FlushResult {
  sent: number;                  // Events successfully sent
  failed: number;                // Events with retryable errors
  remaining: number;             // Events still in queue after flush
}

// LocalStorage key for persistence
const QUEUE_STORAGE_KEY = "DATA_ENGINE_EVENT_QUEUE_V1";
const MAX_QUEUE_SIZE = 500;
const MAX_RETRIES = 12;          // 12 retries = ~68 minutes total backoff

// In-memory queue (persisted to localStorage)
let eventQueue: QueuedEvent[] = [];

/**
 * Initialize queue from localStorage on module load
 */
function initializeQueue(): void {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      eventQueue = Array.isArray(parsed) ? parsed : [];

      if (import.meta.env.DEV && eventQueue.length > 0) {
        console.debug(`[DataEngineEventQueue] Loaded ${eventQueue.length} queued events from storage`);
      }
    }
  } catch (err) {
    console.warn("[DataEngineEventQueue] Failed to restore from localStorage:", err);
    eventQueue = [];
  }
}

/**
 * Persist queue to localStorage
 */
function persistQueue(): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(eventQueue));
  } catch (err) {
    console.warn("[DataEngineEventQueue] Failed to persist to localStorage:", err);
  }
}

/**
 * Generate unique event ID (timestamp + random)
 */
function generateQueueId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Calculate next retry timestamp with exponential backoff
 * Formula: min(60 minutes, 5 seconds * 2^attempts)
 */
function calculateNextRetryAt(attempts: number): string {
  const baseDelayMs = 5000;  // 5 seconds
  const multiplier = Math.pow(2, attempts);
  const delayMs = Math.min(60 * 60 * 1000, baseDelayMs * multiplier); // Cap at 60 minutes
  const nextRetry = new Date(Date.now() + delayMs);
  return nextRetry.toISOString();
}

/**
 * Enqueue an event for later delivery
 * Automatically persists to localStorage and redacts PII
 *
 * @param payload Event payload (will be PII-redacted before storage)
 */
export function enqueueEvent(payload: any): void {
  // Redact PII from payload before storing
  const sanitized = sanitizeMeta(payload);

  const queuedEvent: QueuedEvent = {
    id: generateQueueId(),
    createdAt: new Date().toISOString(),
    attempts: 0,
    nextRetryAt: new Date().toISOString(), // Ready to retry immediately
    payload: sanitized,
  };

  // Add to queue
  eventQueue.unshift(queuedEvent); // Add to front (reverse chronological)

  // Enforce cap: drop oldest events if exceeding MAX_QUEUE_SIZE
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    const dropped = eventQueue.splice(MAX_QUEUE_SIZE);
    if (import.meta.env.DEV) {
      console.warn(
        `[DataEngineEventQueue] Queue exceeded ${MAX_QUEUE_SIZE} events, dropped ${dropped.length} oldest`
      );
    }
  }

  // Persist to localStorage
  persistQueue();

  if (import.meta.env.DEV) {
    console.debug("[DataEngineEventQueue] Event queued:", {
      eventId: queuedEvent.id,
      queueSize: eventQueue.length,
      payload: queuedEvent.payload, // Safe to log (PII-redacted)
    });
  }
}

/**
 * Get all queued events (newest first)
 */
export function getQueuedEvents(): QueuedEvent[] {
  return [...eventQueue]; // Return copy to prevent mutation
}

/**
 * Get queue diagnostics (DEV-only stats)
 */
export function getQueueStats(): {
  size: number;
  oldestAt?: string;
  newestAt?: string;
  oldestRetryAt?: string;
} {
  const stats = {
    size: eventQueue.length,
    oldestAt: undefined as string | undefined,
    newestAt: undefined as string | undefined,
    oldestRetryAt: undefined as string | undefined,
  };

  if (eventQueue.length > 0) {
    // Newest first (earliest in array)
    stats.newestAt = eventQueue[0]?.createdAt;
    // Oldest last (latest in array)
    stats.oldestAt = eventQueue[eventQueue.length - 1]?.createdAt;
    // Find oldest retry time
    const oldestResume = eventQueue.reduce(
      (min, evt) => (evt.nextRetryAt < min ? evt.nextRetryAt : min),
      eventQueue[0].nextRetryAt
    );
    stats.oldestRetryAt = oldestResume;
  }

  return stats;
}

/**
 * Flush queue: attempt to send all queued events
 * Respects nextRetryAt timing and exponential backoff
 *
 * @param sendFn Async function that sends event, throws on error
 * @returns Result with sent/failed/remaining counts
 */
export async function flushQueue(
  sendFn: (payload: any) => Promise<void>
): Promise<FlushResult> {
  const now = new Date();
  let sent = 0;
  let failed = 0;

  // Filter events that are ready to retry
  const readyToRetry = eventQueue.filter((evt) => new Date(evt.nextRetryAt) <= now);

  if (import.meta.env.DEV) {
    console.debug("[DataEngineEventQueue] Flushing queue:", {
      ready: readyToRetry.length,
      total: eventQueue.length,
    });
  }

  // Attempt to send each event
  for (const evt of readyToRetry) {
    try {
      await sendFn(evt.payload);
      sent++;

      // Remove from queue on successful send
      eventQueue = eventQueue.filter((e) => e.id !== evt.id);

      if (import.meta.env.DEV) {
        console.debug("[DataEngineEventQueue] Event sent successfully:", {
          eventId: evt.id,
          attempts: evt.attempts,
        });
      }
    } catch (error) {
      failed++;

      // Update event with next retry time and error message
      const eventIndex = eventQueue.findIndex((e) => e.id === evt.id);
      if (eventIndex !== -1) {
        const updatedEvent = eventQueue[eventIndex];
        updatedEvent.attempts += 1;
        updatedEvent.lastError = error instanceof Error ? error.message : String(error);

        // Check if max retries exceeded
        if (updatedEvent.attempts > MAX_RETRIES) {
          eventQueue.splice(eventIndex, 1); // Remove from queue
          if (import.meta.env.DEV) {
            console.warn("[DataEngineEventQueue] Event exceeded max retries, removing:", {
              eventId: evt.id,
              attempts: updatedEvent.attempts,
            });
          }
        } else {
          // Calculate next retry time
          updatedEvent.nextRetryAt = calculateNextRetryAt(updatedEvent.attempts);

          if (import.meta.env.DEV) {
            console.warn("[DataEngineEventQueue] Event send failed, will retry:", {
              eventId: evt.id,
              attempts: updatedEvent.attempts,
              nextRetryAt: updatedEvent.nextRetryAt,
              error: updatedEvent.lastError,
            });
          }
        }
      }
    }
  }

  // Persist updated queue
  persistQueue();

  const result: FlushResult = {
    sent,
    failed,
    remaining: eventQueue.length,
  };

  if (import.meta.env.DEV) {
    console.debug("[DataEngineEventQueue] Flush complete:", result);
  }

  return result;
}

/**
 * Start automatic queue worker
 * Periodically checks for events ready to retry and flushes them
 *
 * @param sendFn Async function to send event payload
 * @param opts Configuration options
 * @returns Object with stop() method to cancel the worker
 */
export function startQueueWorker(
  sendFn: (payload: any) => Promise<void>,
  opts?: { intervalMs?: number }
): { stop(): void } {
  const intervalMs = opts?.intervalMs || 15000; // 15 seconds default

  const intervalId = setInterval(async () => {
    try {
      const result = await flushQueue(sendFn);
      if (import.meta.env.DEV && result.sent > 0) {
        console.debug("[DataEngineEventQueue] Worker sent events:", result);
      }
    } catch (err) {
      console.warn("[DataEngineEventQueue] Worker error:", err);
    }
  }, intervalMs);

  return {
    stop() {
      clearInterval(intervalId);
      if (import.meta.env.DEV) {
        console.debug("[DataEngineEventQueue] Worker stopped");
      }
    },
  };
}

// Initialize queue on module load
initializeQueue();
