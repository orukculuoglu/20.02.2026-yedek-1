import type { CircuitState } from "../resilience/circuitBreaker";

/**
 * Data Engine Telemetry
 * Lightweight runtime metrics for event delivery observability
 * 
 * Features:
 * - Event delivery counters (sent, queued, failed)
 * - Latency tracking (last 100 samples)
 * - Average latency calculation
 * - Last error message (non-PII)
 * - Circuit breaker state tracking
 * - Rate limit rejection tracking
 * - DEV-only diagnostics
 */

/**
 * TelemetrySnapshot - Point-in-time metrics
 */
export interface TelemetrySnapshot {
  totalSent: number;
  totalQueued: number;
  totalFailed: number;
  averageLatencyMs: number;
  queueSize: number;
  lastError?: string;
  successRate: number;              // % of sent vs (sent + queued + failed)
  circuitState?: CircuitState;      // CLOSED | OPEN | HALF_OPEN
  rateLimitedCount?: number;        // Number of rate limit rejections
}

/**
 * Internal telemetry state
 */
interface TelemetryState {
  sentCount: number;
  queuedCount: number;
  failedCount: number;
  rateLimitedCount: number;
  latencySamples: number[];         // Last 100 samples
  lastErrorMessage?: string;
  queueSize: number;
  circuitState: CircuitState;
}

const MAX_LATENCY_SAMPLES = 100;

// Singleton state
const telemetryState: TelemetryState = {
  sentCount: 0,
  queuedCount: 0,
  failedCount: 0,
  rateLimitedCount: 0,
  latencySamples: [],
  lastErrorMessage: undefined,
  queueSize: 0,
  circuitState: "CLOSED",
};

/**
 * Record successful send event
 * Called after event is sent to backend
 */
export function recordSent(latencyMs: number): void {
  telemetryState.sentCount++;
  
  // Track latency sample
  telemetryState.latencySamples.push(latencyMs);
  if (telemetryState.latencySamples.length > MAX_LATENCY_SAMPLES) {
    telemetryState.latencySamples.shift();
  }

  if (import.meta.env.DEV) {
    console.debug("[DE-Telemetry] Event sent", {
      latencyMs,
      sentCount: telemetryState.sentCount,
    });
  }
}

/**
 * Record queue addition
 * Called when event added to queue (fallback)
 */
export function recordQueued(): void {
  telemetryState.queuedCount++;
  telemetryState.queueSize++;

  if (import.meta.env.DEV) {
    console.debug("[DE-Telemetry] Event queued", {
      queuedCount: telemetryState.queuedCount,
      queueSize: telemetryState.queueSize,
    });
  }
}

/**
 * Record queue removal on successful flush
 * Reduces queue size as events are processed
 */
export function recordQueueProcessed(): void {
  if (telemetryState.queueSize > 0) {
    telemetryState.queueSize--;
  }

  if (import.meta.env.DEV) {
    console.debug("[DE-Telemetry] Event processed from queue", {
      queueSize: telemetryState.queueSize,
    });
  }
}

/**
 * Record failure
 * Called on permanent failure (rare)
 */
export function recordFailed(errorMessage: string): void {
  telemetryState.failedCount++;

  // Track rate limit rejections separately
  if (errorMessage === "RATE_LIMITED") {
    telemetryState.rateLimitedCount++;
  }

  telemetryState.lastErrorMessage = sanitizeErrorMessage(errorMessage);

  if (import.meta.env.DEV) {
    console.debug("[DE-Telemetry] Event failed", {
      error: telemetryState.lastErrorMessage,
      failedCount: telemetryState.failedCount,
      isRateLimited: errorMessage === "RATE_LIMITED",
    });
  }
}

/**
 * Update circuit breaker state
 * Called by HttpSender to sync state
 */
export function updateCircuitState(state: CircuitState): void {
  telemetryState.circuitState = state;

  if (import.meta.env.DEV) {
    console.debug("[DE-Telemetry] Circuit state changed", {
      circuitState: state,
    });
  }
}

/**
 * Get current telemetry snapshot
 * Safe to call from UI
 */
export function getTelemetrySnapshot(): TelemetrySnapshot {
  const total = telemetryState.sentCount + telemetryState.queuedCount + telemetryState.failedCount;
  const successRate = total > 0 ? (telemetryState.sentCount / total) * 100 : 0;

  // Calculate average latency
  let averageLatencyMs = 0;
  if (telemetryState.latencySamples.length > 0) {
    const sum = telemetryState.latencySamples.reduce((a, b) => a + b, 0);
    averageLatencyMs = sum / telemetryState.latencySamples.length;
  }

  return {
    totalSent: telemetryState.sentCount,
    totalQueued: telemetryState.queuedCount,
    totalFailed: telemetryState.failedCount,
    averageLatencyMs: Math.round(averageLatencyMs * 10) / 10,  // 1 decimal place
    queueSize: telemetryState.queueSize,
    lastError: telemetryState.lastErrorMessage,
    successRate: Math.round(successRate * 10) / 10,
    circuitState: telemetryState.circuitState,
    rateLimitedCount: telemetryState.rateLimitedCount,
  };
}

/**
 * Reset telemetry (DEV only)
 * Useful for test isolation
 */
export function resetTelemetry(): void {
  telemetryState.sentCount = 0;
  telemetryState.queuedCount = 0;
  telemetryState.failedCount = 0;
  telemetryState.rateLimitedCount = 0;
  telemetryState.latencySamples = [];
  telemetryState.lastErrorMessage = undefined;
  telemetryState.queueSize = 0;
  telemetryState.circuitState = "CLOSED";

  if (import.meta.env.DEV) {
    console.debug("[DE-Telemetry] Telemetry reset");
  }
}

/**
 * Sanitize error messages to remove PII
 * Remove VIN, plate, email, phone, etc.
 */
function sanitizeErrorMessage(message: string): string {
  // Patterns to redact
  const patterns = [
    /vin[:=\s]+[a-z0-9]+/gi,
    /plate[:=\s]+[a-z0-9]+/gi,
    /plaka[:=\s]+[a-z0-9]+/gi,
    /email[:=\s]+[\w@.]+/gi,
    /phone[:=\s]+[\d\s\-()]+/gi,
    /tckn[:=\s]+[\d\s]+/gi,
  ];

  let sanitized = message;
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  return sanitized;
}

/**
 * Format telemetry for logging
 * DEV only
 */
export function formatTelemetryForLog(snapshot: TelemetrySnapshot): string {
  return `
    📊 Data Engine Telemetry
    ├─ Sent: ${snapshot.totalSent}
    ├─ Queued: ${snapshot.totalQueued}
    ├─ Failed: ${snapshot.totalFailed}
    ├─ Success Rate: ${snapshot.successRate}%
    ├─ Avg Latency: ${snapshot.averageLatencyMs}ms
    ├─ Queue Size: ${snapshot.queueSize}
    ${snapshot.lastError ? `└─ Last Error: ${snapshot.lastError}` : ""}
  `.trim();
}
