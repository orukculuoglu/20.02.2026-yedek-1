/**
 * Vehicle State Snapshot Persistence - Phase 8 Storage Layer
 * 
 * Extends in-memory snapshot store with optional localStorage persistence
 * Snapshots are derived from Data Engine events (event-sourced read model)
 * 
 * Design:
 * - In-memory primary store (fast reads for UI)
 * - Optional localStorage backup (recovery on page reload)
 * - Event-driven updates (applyDataEngineEventToSnapshot)
 * - PII-safe: No VIN, plate, or raw meta persisted
 */

import type { VehicleStateSnapshot } from '../../vehicle-state/vehicleStateSnapshotStore';

const SNAPSHOTS_PERSISTENCE_KEY = 'lent:vehicle-state:snapshots:v1';

/**
 * Initialize snapshot persistence from localStorage (if available)
 * Called once at module load to restore snapshots from previous session
 * 
 * @returns Map of vehicleId -> VehicleStateSnapshot from storage
 */
export function loadSnapshotsFromStorage(): Map<string, VehicleStateSnapshot> {
  try {
    const stored = localStorage.getItem(SNAPSHOTS_PERSISTENCE_KEY);
    if (!stored) {
      return new Map();
    }

    const parsed = JSON.parse(stored) as Record<string, VehicleStateSnapshot>;
    return new Map(Object.entries(parsed));
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[VehicleStateSnapshotPersistence] Failed to load snapshots from storage:', err);
    }
    return new Map();
  }
}

/**
 * Persist snapshot to localStorage
 * Called after snapshot update to ensure recovery on page reload
 * 
 * @param snapshots - Current snapshot store
 */
export function persistSnapshotsToStorage(snapshots: Map<string, VehicleStateSnapshot>): void {
  try {
    const obj: Record<string, VehicleStateSnapshot> = {};
    snapshots.forEach((snapshot, vehicleId) => {
      obj[vehicleId] = snapshot;
    });
    localStorage.setItem(SNAPSHOTS_PERSISTENCE_KEY, JSON.stringify(obj));

    if (import.meta.env.DEV) {
      console.debug('[VehicleStateSnapshotPersistence] Persisted', snapshots.size, 'snapshots to storage');
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[VehicleStateSnapshotPersistence] Failed to persist snapshots:', err);
    }
  }
}

/**
 * Clear persisted snapshots from localStorage
 * Use when restarting event stream or clearing state
 */
export function clearPersistedSnapshots(): void {
  try {
    localStorage.removeItem(SNAPSHOTS_PERSISTENCE_KEY);
    if (import.meta.env.DEV) {
      console.debug('[VehicleStateSnapshotPersistence] Cleared all persisted snapshots');
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[VehicleStateSnapshotPersistence] Error clearing snapshots:', err);
    }
  }
}

/**
 * Get persistence statistics (for monitoring/debugging)
 * @returns Stats including stored snapshot count and total size
 */
export function getPersistenceStats(): {
  persistedCount: number;
  storageSizeBytes?: number;
} {
  try {
    const stored = localStorage.getItem(SNAPSHOTS_PERSISTENCE_KEY);
    if (!stored) {
      return { persistedCount: 0 };
    }

    const parsed = JSON.parse(stored) as Record<string, VehicleStateSnapshot>;
    const count = Object.keys(parsed).length;
    const sizeBytes = stored.length;

    return {
      persistedCount: count,
      storageSizeBytes: sizeBytes,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[VehicleStateSnapshotPersistence] Error getting stats:', err);
    }
    return { persistedCount: 0 };
  }
}
