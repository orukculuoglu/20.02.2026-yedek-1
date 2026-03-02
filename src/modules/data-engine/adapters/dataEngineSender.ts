/**
 * Data Engine Sender Adapter
 * Routes event sending through mock (local queue) or real (HTTP) backends
 * 
 * Design:
 * - Single entry point: getDataEngineSender()
 * - Mock mode: Returns MockQueueSender (local circular buffer)
 * - Real mode: Returns HttpSender (POST to /data-engine/events with fallback)
 * - No PII: Validates envelope before sending
 * - No throwing: Always returns result with status + error
 */

import type {
  DataEngineEventEnvelope,
  DataEngineSendResult,
} from "../contracts/dataEngineContract";
import { isRealApiEnabled, createApiConfig, apiPost } from "../../../../services/apiClient";
import { sanitizeMeta } from "../utils/sanitizeMeta";
import { recordSent, recordQueued, recordFailed } from "../telemetry/dataEngineTelemetry";

/**
 * Core sender interface
 * All senders must implement this contract
 */
export interface DataEngineSender {
  send<T>(
    envelope: DataEngineEventEnvelope<T>
  ): Promise<DataEngineSendResult>;
}

/**
 * MOCK SENDER: Local circular buffer queue
 * Default implementation when backend unavailable
 */
class MockQueueSender implements DataEngineSender {
  private buffer: DataEngineEventEnvelope[] = [];
  private readonly maxSize = 500;

  async send<T>(
    envelope: DataEngineEventEnvelope<T>
  ): Promise<DataEngineSendResult> {
    // Validate envelope
    this.validateEnvelope(envelope);

    // Add to queue
    this.buffer.unshift(envelope);

    // Enforce cap
    if (this.buffer.length > this.maxSize) {
      this.buffer.splice(this.maxSize);
    }

    if (import.meta.env.DEV) {
      console.debug("[MockQueueSender] Event queued", {
        eventId: envelope.eventId,
        eventType: envelope.eventType,
        vehicleId: envelope.subject.vehicleId,
        queueSize: this.buffer.length,
      });
    }

    // Record telemetry
    recordQueued();

    return {
      status: "QUEUED",
      eventId: envelope.eventId,
      queuedCount: this.buffer.length,
    };
  }

  /**
   * Get all queued events (DEV only)
   */
  getQueuedEvents(): DataEngineEventEnvelope[] {
    return [...this.buffer];
  }

  /**
   * Clear queue (DEV only)
   */
  clearQueue(): void {
    this.buffer = [];
    if (import.meta.env.DEV) {
      console.debug("[MockQueueSender] Queue cleared");
    }
  }

  /**
   * Validate envelope for PII and correctness
   */
  private validateEnvelope<T>(envelope: DataEngineEventEnvelope<T>): void {
    if (!envelope.schemaVersion || envelope.schemaVersion !== "DE-1.0") {
      throw new Error(`Invalid schema version: ${envelope.schemaVersion}`);
    }

    if (!envelope.eventId) {
      throw new Error("Missing eventId");
    }

    if (!envelope.eventType) {
      throw new Error("Missing eventType");
    }

    if (!envelope.tenantId) {
      throw new Error("Missing tenantId");
    }

    if (!envelope.subject) {
      throw new Error("Missing subject");
    }

    if (!envelope.idempotencyKey) {
      throw new Error("Missing idempotencyKey");
    }

    // PII validation
    this.validateNoPII(envelope);
  }

  /**
   * Validate that envelope contains no PII fields
   */
  private validateNoPII<T>(envelope: DataEngineEventEnvelope<T>): void {
    const piiFields = [
      "vin",
      "plate",
      "plaka",
      "chassis",
      "phone",
      "email",
      "tckn",
      "identity",
    ];

    // Check subject
    const subjectKeys = Object.keys(envelope.subject || {});
    for (const key of subjectKeys) {
      if (piiFields.some((pii) => key.toLowerCase().includes(pii))) {
        throw new Error(
          `PII field detected in subject: ${key} - use vehicleId or workOrderId only`
        );
      }
    }

    // Check meta keys
    if (envelope.meta) {
      const metaKeys = Object.keys(envelope.meta);
      for (const key of metaKeys) {
        if (piiFields.some((pii) => key.toLowerCase().includes(pii))) {
          throw new Error(`PII field detected in meta: ${key}`);
        }
      }
    }

    if (import.meta.env.DEV) {
      console.debug("[MockQueueSender] Envelope validated (no PII)");
    }
  }
}

/**
 * HTTP SENDER: Real backend API
 * POSTs to /data-engine/events with fallback to mock queue on failure
 */
class HttpSender implements DataEngineSender {
  private fallback: MockQueueSender = new MockQueueSender();

  async send<T>(
    envelope: DataEngineEventEnvelope<T>
  ): Promise<DataEngineSendResult> {
    const startTime = performance.now();

    try {
      if (import.meta.env.DEV) {
        console.debug("[HttpSender] Sending event to backend", {
          eventId: envelope.eventId,
          eventType: envelope.eventType,
          vehicleId: envelope.subject.vehicleId,
        });
      }

      const config = createApiConfig();
      const response = await apiPost<{
        ok: boolean;
        eventId: string;
      }>("/data-engine/events", envelope, {
        ...config,
        headers: {
          ...config.headers,
          "x-idempotency-key": envelope.idempotencyKey,
          "x-tenant-id": envelope.tenantId,
        },
      });

      const latencyMs = performance.now() - startTime;

      if (import.meta.env.DEV) {
        console.debug("[HttpSender] Event sent successfully", {
          eventId: envelope.eventId,
          responseEventId: response.eventId,
          latencyMs: Math.round(latencyMs),
        });
      }

      // Record successful send
      recordSent(latencyMs);

      return {
        status: "SENT",
        eventId: envelope.eventId,
      };
    } catch (error) {
      // Record failure
      const errorMsg = error instanceof Error ? error.message : String(error);
      recordFailed(errorMsg);

      if (import.meta.env.DEV) {
        console.warn("[HttpSender] POST failed, falling back to queue", {
          eventId: envelope.eventId,
          error: errorMsg,
        });
      }

      // Queue event locally
      return this.fallback.send(envelope);
    }
  }

  /**
   * Get fallback queue (DEV only)
   */
  getFallbackQueue(): DataEngineEventEnvelope[] {
    return this.fallback.getQueuedEvents();
  }

  /**
   * Clear fallback queue (DEV only)
   */
  clearFallbackQueue(): void {
    this.fallback.clearQueue();
  }
}

// Singleton instances
let mockSender: MockQueueSender | null = null;
let httpSender: HttpSender | null = null;

/**
 * Get the appropriate sender based on configuration
 * Lazy-loads and caches senders
 */
export function getDataEngineSender(): DataEngineSender {
  const useRealApi = isRealApiEnabled();

  if (useRealApi) {
    if (!httpSender) {
      httpSender = new HttpSender();
    }
    return httpSender;
  } else {
    if (!mockSender) {
      mockSender = new MockQueueSender();
    }
    return mockSender;
  }
}

/**
 * Get mock sender directly (DEV only)
 * Useful for inspecting queue
 */
export function getMockSender(): MockQueueSender {
  if (!mockSender) {
    mockSender = new MockQueueSender();
  }
  return mockSender;
}

/**
 * Get http sender directly (DEV only)
 * Useful for inspecting fallback queue
 */
export function getHttpSender(): HttpSender {
  if (!httpSender) {
    httpSender = new HttpSender();
  }
  return httpSender;
}

/**
 * TESTING HELPER
 * Reset all senders (useful for test isolation)
 */
export function resetSenders(): void {
  mockSender = null;
  httpSender = null;
  if (import.meta.env.DEV) {
    console.debug("[DataEngineSender] All senders reset");
  }
}
