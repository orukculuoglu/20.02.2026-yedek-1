/**
 * Vehicle State Snapshot Store
 * Read-model layer derived from Data Engine events
 * 
 * Design:
 * - Event-sourced: Snapshots updated from events (not primary source)
 * - PII-safe: No VIN, plate, or raw meta
 * - In-memory circular buffer: Latest snapshots per vehicleId
 * - Non-breaking: Existing event pipeline untouched
 * 
 * Usage:
 * - applyDataEngineEventToSnapshot() → triggered by event ingestion
 * - getSnapshot(vehicleId) → read current state
 * - getAllSnapshots() → bulk query
 */

/**
 * VehicleState Snapshot - Unified read-model for UI
 * PII-safe representation of vehicle's analytical state
 */
export type VehicleStateSnapshot = {
  vehicleId: string;
  schemaVersion: "1.0";
  updatedAt: string; // ISO 8601

  lastEvent?: {
    eventId: string;
    domain: "risk" | "insurance" | "part" | string;
    eventType: string;
    occurredAt: string;
    source?: string;
  };

  // Risk domain indices (from RISK_INDICES_UPDATED events)
  risk?: {
    indices: Array<{
      key: string;
      value: number;
      confidence?: number;
    }>;
    confidenceAverage?: number;
  };

  // Insurance domain indices (from INSURANCE_INDICES_UPDATED events)
  insurance?: {
    indices: Array<{
      key: string;
      value: number;
      confidence?: number;
    }>;
  };

  // Part domain indices (from PART_INDICES_UPDATED events)
  part?: {
    indices: Array<{
      key: string;
      value: number;
      confidence?: number;
    }>;
  };
};

/**
 * In-memory snapshot store (Map<vehicleId, VehicleStateSnapshot>)
 */
const snapshotStore = new Map<string, VehicleStateSnapshot>();

/**
 * Initialize or get existing snapshot for a vehicle
 */
function initializeSnapshot(vehicleId: string): VehicleStateSnapshot {
  if (snapshotStore.has(vehicleId)) {
    return snapshotStore.get(vehicleId)!;
  }

  const snapshot: VehicleStateSnapshot = {
    vehicleId,
    schemaVersion: "1.0",
    updatedAt: new Date().toISOString(),
  };

  snapshotStore.set(vehicleId, snapshot);
  return snapshot;
}

/**
 * Compute confidence average from indices
 */
function computeConfidenceAverage(
  indices: Array<{ confidence?: number }>
): number | undefined {
  const confidences = indices
    .map((idx) => idx.confidence)
    .filter((c) => typeof c === 'number' && c >= 0) as number[];

  if (confidences.length === 0) {
    return undefined;
  }

  return Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100;
}

/**
 * Get current snapshot for a vehicle
 */
export function getSnapshot(vehicleId: string): VehicleStateSnapshot | null {
  return snapshotStore.get(vehicleId) || null;
}

/**
 * Get all snapshots
 */
export function getAllSnapshots(): VehicleStateSnapshot[] {
  return Array.from(snapshotStore.values());
}

/**
 * Upsert snapshot (merge with existing)
 * Used by reducer when applying events
 */
export function upsertSnapshot(
  vehicleId: string,
  partial: Partial<VehicleStateSnapshot>
): VehicleStateSnapshot {
  const snapshot = initializeSnapshot(vehicleId);

  // Merge partial update
  const updated: VehicleStateSnapshot = {
    ...snapshot,
    ...partial,
    vehicleId, // Always preserve vehicleId
    schemaVersion: "1.0", // Always latest schema
    updatedAt: partial.updatedAt || new Date().toISOString(),
  };

  snapshotStore.set(vehicleId, updated);

  if (import.meta.env.DEV) {
    console.debug('[VehicleStateSnapshotStore] Snapshot upserted:', {
      vehicleId,
      domains: [
        updated.risk ? 'risk' : null,
        updated.insurance ? 'insurance' : null,
        updated.part ? 'part' : null,
      ].filter(Boolean),
      updatedAt: updated.updatedAt,
    });
  }

  return updated;
}

/**
 * Clear all snapshots (DEV only)
 */
export function clearSnapshots(): void {
  if (!import.meta.env.DEV) {
    console.warn('[VehicleStateSnapshotStore] clearSnapshots() is DEV-only');
    return;
  }

  snapshotStore.clear();

  if (import.meta.env.DEV) {
    console.debug('[VehicleStateSnapshotStore] All snapshots cleared');
  }
}

/**
 * Get snapshot statistics (DEV only)
 */
export function getSnapshotStats(): {
  totalSnapshots: number;
  vehicleIds: string[];
} {
  return {
    totalSnapshots: snapshotStore.size,
    vehicleIds: Array.from(snapshotStore.keys()),
  };
}
