/**
 * Vehicle State Reducer
 * Applies Data Engine events to vehicle state snapshots
 * 
 * Design:
 * - Pure function: event envelope → snapshot update
 * - PII-safe extraction: Only indices, no raw meta
 * - Event-sourced: Snapshot is derived, not primary
 * - Per-domain timestamps: Each domain tracks its own freshness
 * 
 * This is the authoritative way to update snapshots.
 * UI components MUST read from snapshots, never directly from events.
 */

import type { DataEngineEventEnvelope } from "../data-engine/contracts/dataEngineEventTypes";
import { upsertSnapshot, VehicleStateSnapshot, Finding } from "./vehicleStateSnapshotStore";

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
  const domainTimestamp = occurredAt || now;

  // Determine domain from eventType
  let domain: string = "unknown";
  if (eventType.includes("RISK")) domain = "risk";
  else if (eventType.includes("INSURANCE")) domain = "insurance";
  else if (eventType.includes("PART")) domain = "part";
  else if (eventType.includes("EXPERTISE")) domain = "expertise";
  else if (eventType.includes("SERVICE")) domain = "service";
  else if (eventType.includes("ODOMETER")) domain = "odometer";
  else if (eventType.includes("DIAGNOSTIC")) domain = "diagnostics";

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
      domain,
      eventType,
      occurredAt: domainTimestamp,
      source,
    },
  };

  // Apply domain-specific update
  if (eventType.includes("RISK") && indices.length > 0) {
    partialUpdate.risk = { 
      indices, 
      confidenceAverage,
      lastUpdatedAt: domainTimestamp,
    };
  } else if (eventType.includes("INSURANCE") && indices.length > 0) {
    partialUpdate.insurance = { 
      indices,
      lastUpdatedAt: domainTimestamp,
    };
  } else if (eventType.includes("PART") && indices.length > 0) {
    partialUpdate.part = { 
      indices,
      lastUpdatedAt: domainTimestamp,
    };
  } else if (eventType.includes("EXPERTISE")) {
    // Extract expertise findings
    let findings: Finding[] = [];
    if (payload && typeof payload === "object" && "findings" in payload) {
      const rawFindings = payload.findings;
      if (Array.isArray(rawFindings)) {
        findings = rawFindings.map((f: any) => ({
          code: f.code || "UNKNOWN",
          severity: f.severity || "info",
          message: f.message || "",
        }));
      }
    }
    partialUpdate.expertise = {
      lastReportAt: domainTimestamp,
      findings: findings.length > 0 ? findings : undefined,
      lastUpdatedAt: domainTimestamp,
    };
  } else if (eventType.includes("SERVICE")) {
    partialUpdate.service = {
      recordsCount: payload?.recordsCount || 0,
      lastServiceAt: payload?.lastServiceAt || domainTimestamp,
      lastUpdatedAt: domainTimestamp,
    };
  } else if (eventType.includes("ODOMETER")) {
    partialUpdate.odometer = {
      currentKm: payload?.currentKm,
      historyCount: payload?.historyCount,
      status: payload?.status,
      lastUpdatedAt: domainTimestamp,
    };
  } else if (eventType.includes("DIAGNOSTIC")) {
    partialUpdate.diagnostics = {
      obdCount: payload?.obdCount,
      lastDtcAt: payload?.lastDtcAt,
      lastUpdatedAt: domainTimestamp,
    };
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
      timestamp: domainTimestamp,
    });
  }

  return updated;
}
