/**
 * Data Engine Event Sender
 * Routes events to backend API or falls back to local ingestion
 * 
 * Design:
 * - MOCK mode (default): ingestDataEngineEvent locally
 * - REAL mode (flag-controlled): POST to /data-engine/events with fallback
 * - No UI blocking: Fire-and-forget with error catching
 * - No PII logged: Only metadata in console (DEV only)
 * - Observable: [DataEngineEventSender] prefix logs
 */

import type { DataEngineEventEnvelope } from "../contracts/dataEngineEventTypes";
import { ingestDataEngineEvent } from "./dataEngineIngestion";
import { enqueueEvent, flushQueue } from "../eventQueue";
import { isRealApiEnabled, createApiConfig, apiPost } from "../../../../services/apiClient";

export interface SendEventResult {
  ok: boolean;
  mode: "MOCK" | "REAL";
  fallbackUsed?: boolean;
  error?: string;
}

/**
 * Send a Data Engine event to backend API or local ingestion
 * 
 * Behavior:
 * - If VITE_USE_REAL_API !== true: Use local ingestion (MOCK mode)
 * - If VITE_USE_REAL_API === true: Try POST /data-engine/events
 *   - Success: Return ok=true
 *   - Failure: Fall back to local ingestion, return ok=false with fallbackUsed=true
 * 
 * @param evt - Event envelope to send (must have piiSafe=true)
 * @returns Result with ok, mode, and optional fallback info
 */
export async function sendDataEngineEvent(
  evt: DataEngineEventEnvelope
): Promise<SendEventResult> {
  const useRealApi = isRealApiEnabled();

  // MOCK mode: Always use local ingestion
  if (!useRealApi) {
    ingestDataEngineEvent(evt);

    if (import.meta.env.DEV) {
      console.debug("[DataEngineEventSender] MOCK mode", {
        eventType: evt.eventType,
        source: evt.source,
        vehicleId: evt.vehicleId,
        ok: true,
      });
    }

    return {
      ok: true,
      mode: "MOCK",
    };
  }

  // REAL mode: Try to POST to backend with fallback
  try {
    if (import.meta.env.DEV) {
      console.debug("[DataEngineEventSender] REAL mode - attempting POST", {
        eventType: evt.eventType,
        source: evt.source,
        vehicleId: evt.vehicleId,
      });
    }

    const config = createApiConfig();
    const response = await apiPost<{ ok: boolean; eventId: string }>(
      "/data-engine/events",
      evt,
      config
    );

    if (import.meta.env.DEV) {
      console.debug("[DataEngineEventSender] REAL mode - POST successful", {
        eventType: evt.eventType,
        source: evt.source,
        vehicleId: evt.vehicleId,
        responseId: response.eventId,
      });
    }

    return {
      ok: true,
      mode: "REAL",
    };
  } catch (error) {
    // Graceful fallback: Enqueue for retry + use local ingestion
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (import.meta.env.DEV) {
      console.warn("[DataEngineEventSender] REAL mode - POST failed, enqueueing for retry", {
        eventType: evt.eventType,
        source: evt.source,
        vehicleId: evt.vehicleId,
        error: errorMsg,
      });
    }

    // Add to retry queue (PII-safe: payload is already redacted by eventQueue)
    enqueueEvent({ ...evt });

    // Also ingest locally for immediate appearance in Event Stream
    ingestDataEngineEvent(evt);

    return {
      ok: false,
      mode: "REAL",
      fallbackUsed: true,
      error: errorMsg,
    };
  }
}

/**
 * Manually flush queued events
 * Useful for DEV testing and diagnostics
 * @returns Flush result with sent/failed/remaining counts
 */
export async function flushQueuedEvents(): Promise<{ sent: number; failed: number; remaining: number }> {
  return flushQueue(sendDataEngineEventPayload);
}

/**
 * Internal function to send event payload (used by queue flush)
 */
async function sendDataEngineEventPayload(payload: any): Promise<void> {
  const config = createApiConfig();
  await apiPost<{ ok: boolean; eventId: string }>("/data-engine/events", payload, config);
}
