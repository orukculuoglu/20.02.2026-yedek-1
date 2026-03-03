/**
 * Vehicle State Reducer
 * Applies Data Engine events to vehicle state snapshots
 * 
 * Design:
 * - Pure function: event envelope → snapshot update
 * - PII-safe extraction: Only indices, no raw meta
 * - Event-sourced: Snapshot is derived, not primary
 */

import type { DataEngineEventEnvelope } from "../data-engine/contracts/dataEngineEventTypes";
import { upsertSnapshot, VehicleStateSnapshot } from "./vehicleStateSnapshotStore";

/**
 * Apply a Data Engine event to a vehicle's snapshot
 * Mutates the snapshot store (intentional for read-model)
 * 
 * @param envelope - Ingested event envelope
 * @returns Updated snapshot
 */
export function applyDataEngineEventToSnapshot(
  envelope: DataEngineEventEnvelope<any>
): VehicleStateSnapshot {
  const { vehicleId, eventType, occurredAt, source, payload, eventId } = envelope;

  // Initialize or get existing snapshot
  const now = new Date().toISOString();

  // Determine domain from eventType
  let domain: "risk" | "insurance" | "part" | string = "unknown";
  if (eventType.includes("RISK")) domain = "risk";
  else if (eventType.includes("INSURANCE")) domain = "insurance";
  else if (eventType.includes("PART")) domain = "part";

  // Extract indices from payload (PII-safe: only key/value/confidence)
  let indices: Array<{ key: string; value: number; confidence?: number }> = [];
  if (
    payload &&
    typeof payload === "object" &&
    "indices" in payload &&
    Array.isArray(payload.indices)
  ) {
    indices = (payload.indices as any[]).map((idx) => ({
      key: idx.key || "unknown",
      value: typeof idx.value === "number" ? idx.value : 0,
      confidence: typeof idx.confidence === "number" ? idx.confidence : undefined,
    }));
  }

  // Compute confidence average
  const confidenceAverage = indices.length > 0
    ? (() => {
        const confidences = indices
          .map((idx) => idx.confidence)
          .filter((c) => typeof c === "number" && c >= 0) as number[];
        if (confidences.length === 0) return undefined;
        return Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100;
      })()
    : undefined;

  // Build partial update based on domain
  const partialUpdate: Partial<VehicleStateSnapshot> = {
    updatedAt: now,
    lastEvent: {
      eventId,
      domain: domain as "risk" | "insurance" | "part" | string,
      eventType,
      occurredAt,
      source,
    },
  };

  // Apply domain-specific update
  if (eventType.includes("RISK") && indices.length > 0) {
    partialUpdate.risk = { indices, confidenceAverage };
  } else if (eventType.includes("INSURANCE") && indices.length > 0) {
    partialUpdate.insurance = { indices };
  } else if (eventType.includes("PART") && indices.length > 0) {
    partialUpdate.part = { indices };
  }

  // Upsert into store and return updated snapshot
  const updated = upsertSnapshot(vehicleId, partialUpdate);

  if (import.meta.env.DEV) {
    console.debug("[VehicleStateReducer] Event applied:", {
      vehicleId,
      eventType,
      domain,
      indexCount: indices.length,
      confidenceAverage,
    });
  }

  return updated;
}
