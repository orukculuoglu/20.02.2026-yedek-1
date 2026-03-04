/**
 * Local Event Store (DEV-only)
 * 
 * Append-only localStorage persistence of Data Engine events for deterministic replay.
 * 
 * Design:
 * - DEV-only: No-op in production (import.meta.env.DEV check)
 * - Append-only: Events stored in order, never mutated
 * - Bounded: Keeps last 500 events to prevent memory blow-up
 * - PII-safe: Removes meta objects, VIN/plate patterns before persistence
 * - Replay: Rebuilds snapshots from stored events using vehicleStateReducer
 * 
 * Storage Format (localStorage key "DE_LOCAL_EVENT_STORE_V1"):
 * {
 *   version: "1.0",
 *   events: [
 *     { storedAt, sanitizedEnvelope: DataEngineEventEnvelope },
 *     ...
 *   ]
 * }
 */

import type { DataEngineEventEnvelope } from '../contracts/dataEngineEventTypes';
import type { VehicleStateSnapshot } from '../../vehicle-state/vehicleStateSnapshotStore';
import { applyDataEngineEventToSnapshot } from '../../vehicle-state/vehicleStateReducer';

const STORAGE_KEY = 'DE_LOCAL_EVENT_STORE_V1';
const MAX_EVENTS = 500;

interface StoredEventEntry {
  storedAt: string; // ISO 8601
  sanitizedEnvelope: DataEngineEventEnvelope<any>;
}

interface LocalEventStoreFormat {
  version: '1.0';
  events: StoredEventEntry[];
}

/**
 * PII Sanitizer - Remove sensitive fields before persistence
 * Removes keys matching: meta, vin, plate, plaka, chassis, tckn, email, phone, address
 * Redacts string values matching VIN (17-char alphanumeric) or TR plate patterns
 * CRITICAL: Preserves payload.indices completely (it's PII-safe and essential for event)
 */
function sanitizeEnvelopeForStorage(
  envelope: DataEngineEventEnvelope<any>
): DataEngineEventEnvelope<any> {
  const sanitized = JSON.parse(JSON.stringify(envelope)); // Deep clone

  // List of sensitive field names to remove (case-insensitive)
  const sensitiveKeys = /^(meta|vin|plate|plaka|chassis|tckn|email|phone|address)$/i;

  // CRITICAL: Track that we're inside payload.indices to preserve it
  let preserveIndices = false;

  // Recursively sanitize object
  function deepSanitize(obj: any, path: string[] = []): void {
    if (obj === null || typeof obj !== 'object') return;

    // Check if we're at payload.indices - if so, don't sanitize its contents
    const currentPath = path.join('.');
    if (currentPath === 'payload.indices' || path.some((p, i) => 
      path.slice(0, i+1).join('.') === 'payload.indices'
    )) {
      // Don't sanitize payload.indices contents - this is PII-safe and essential
      return;
    }

    for (const key of Object.keys(obj)) {
      const newPath = [...path, key];
      const newPathStr = newPath.join('.');
      
      // Skip if we're entering payload.indices
      if (newPathStr.endsWith('payload.indices')) {
        preserveIndices = true;
        continue;
      }

      if (sensitiveKeys.test(key)) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        deepSanitize(obj[key], newPath);
      } else if (typeof obj[key] === 'string') {
        // Check for VIN pattern (17 chars, alphanumeric) - REDACT only, don't delete field
        if (/^[A-Z0-9]{17}$/i.test(obj[key])) {
          obj[key] = '***REDACTED_VIN***';
        }
        // Check for Turkish plate pattern (e.g., 34ABC1234) - REDACT only, don't delete field
        else if (/^\d{2}[A-Z]{1,3}\d{1,4}$/i.test(obj[key])) {
          obj[key] = '***REDACTED_PLATE***';
        }
      }
    }
  }

  deepSanitize(sanitized);
  return sanitized;
}

/**
 * Load stored events from localStorage
 */
function loadStoredEvents(): StoredEventEntry[] {
  if (!import.meta.env.DEV) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as LocalEventStoreFormat;
    if (parsed.version !== '1.0' || !Array.isArray(parsed.events)) {
      return [];
    }

    return parsed.events;
  } catch (err) {
    console.warn('[LocalEventStore] Failed to load events:', err);
    return [];
  }
}

/**
 * Persist events to localStorage
 */
function persistStoredEvents(events: StoredEventEntry[]): void {
  if (!import.meta.env.DEV) return;

  try {
    const store: LocalEventStoreFormat = {
      version: '1.0',
      events: events.slice(-MAX_EVENTS), // Keep last MAX_EVENTS
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn('[LocalEventStore] Failed to persist events:', err);
  }
}

/**
 * Append a Data Engine event to local store (DEV-only)
 * No-op in production; silently appends in development.
 * CRITICAL: ALL eventTypes (RISK, PART, INSURANCE) are stored WITHOUT filtering
 * 
 * @param envelope - Ingested event envelope (will be sanitized)
 */
export function appendEvent(envelope: DataEngineEventEnvelope<any>): void {
  if (!import.meta.env.DEV) return;

  try {
    // DEFENSIVE: Ensure event has required fields and eventType
    if (!envelope || !envelope.eventType) {
      console.warn('[LocalEventStore] Skipping event with missing eventType:', envelope);
      return;
    }

    const sanitized = sanitizeEnvelopeForStorage(envelope);
    
    // DEFENSIVE: Verify sanitization preserved eventType
    if (!sanitized.eventType) {
      console.error('[LocalEventStore] Sanitization removed eventType! Event not stored.', {
        originalEventType: envelope.eventType,
        sanitized,
      });
      return;
    }

    const entry: StoredEventEntry = {
      storedAt: new Date().toISOString(),
      sanitizedEnvelope: sanitized,
    };

    const events = loadStoredEvents();
    events.push(entry);
    persistStoredEvents(events);

    // Verify payload.indices were preserved
    const indicesCount = Array.isArray(sanitized.payload?.indices) 
      ? sanitized.payload.indices.length 
      : 0;

    if (import.meta.env.DEV) {
      console.debug('[LocalEventStore] Event appended:', {
        eventId: sanitized.eventId,
        vehicleId: sanitized.vehicleId,
        eventType: sanitized.eventType,
        indicesCount,
        totalCount: events.length,
      });
    }
  } catch (err) {
    console.error('[LocalEventStore] Failed to append event:', err);
  }
}

/**
 * Get all stored events from localStorage (DEV-only)
 * 
 * @returns Array of stored event envelopes or empty array in production
 */
export function getStoredEvents(): DataEngineEventEnvelope<any>[] {
  if (!import.meta.env.DEV) return [];

  try {
    const entries = loadStoredEvents();
    return entries.map((e) => e.sanitizedEnvelope);
  } catch (err) {
    console.error('[LocalEventStore] Failed to get stored events:', err);
    return [];
  }
}

/**
 * Clear all stored events from localStorage (DEV-only)
 * No-op in production.
 */
export function clearStoredEvents(): void {
  if (!import.meta.env.DEV) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.debug('[LocalEventStore] Event store cleared');
  } catch (err) {
    console.warn('[LocalEventStore] Failed to clear events:', err);
  }
}

/**
 * Replay stored events to rebuild Vehicle State Snapshots (DEV-only)
 * 
 * Chronologically applies all stored events to snapshots using the vehicle state reducer.
 * Useful for testing determinism and rebuilding state after page refresh.
 * 
 * @param options - Optional filter (e.g., { vehicleId: '11' })
 * @returns Map<vehicleId, VehicleStateSnapshot> or empty map in production
 */
export function replayToSnapshots(options?: {
  vehicleId?: string;
}): Map<string, VehicleStateSnapshot> {
  if (!import.meta.env.DEV) return new Map();

  try {
    const events = getStoredEvents();
    const snapshots = new Map<string, VehicleStateSnapshot>();

    // Filter by vehicleId if provided
    const filtered = options?.vehicleId
      ? events.filter((e) => e.vehicleId === options.vehicleId)
      : events;

    console.debug('[LocalEventStore] Replaying', filtered.length, 'events');

    // Apply each event in chronological order
    for (const envelope of filtered) {
      try {
        // Apply reducer - mutates snapshot store internally
        const snapshot = applyDataEngineEventToSnapshot(envelope);
        snapshots.set(snapshot.vehicleId, snapshot);

        if (import.meta.env.DEV) {
          console.debug('[LocalEventStore] Replayed event:', {
            eventId: envelope.eventId,
            vehicleId: envelope.vehicleId,
            domain: envelope.eventType,
          });
        }
      } catch (err) {
        console.error('[LocalEventStore] Failed to replay event:', envelope.eventId, err);
        // Continue with next event
      }
    }

    console.debug('[LocalEventStore] Replay complete:', {
      eventsProcessed: filtered.length,
      snapshotsBuilt: snapshots.size,
    });

    return snapshots;
  } catch (err) {
    console.error('[LocalEventStore] Replay failed:', err);
    return new Map();
  }
}

/**
 * Get statistics about the local event store (DEV-only)
 * 
 * @returns Store stats (count, lastEventId, lastOccurredAt) or empty stats in production
 */
export function getStoreStats(): {
  count: number;
  lastEventId?: string;
  lastOccurredAt?: string;
} {
  if (!import.meta.env.DEV) return { count: 0 };

  try {
    const events = getStoredEvents();
    if (events.length === 0) {
      return { count: 0 };
    }

    const lastEvent = events[events.length - 1];
    return {
      count: events.length,
      lastEventId: lastEvent.eventId,
      lastOccurredAt: lastEvent.occurredAt,
    };
  } catch (err) {
    console.error('[LocalEventStore] Failed to get store stats:', err);
    return { count: 0 };
  }
}

/**
 * DEV-only debugging: Get first stored event (for inspector)
 * 
 * @returns First stored event envelope or null
 */
export function getFirstStoredEvent(): DataEngineEventEnvelope<any> | null {
  if (!import.meta.env.DEV) return null;

  const events = getStoredEvents();
  return events.length > 0 ? events[0] : null;
}

/**
 * DEV-only debugging: Get last stored event (for inspector)
 * 
 * @returns Last stored event envelope or null
 */
export function getLastStoredEvent(): DataEngineEventEnvelope<any> | null {
  if (!import.meta.env.DEV) return null;

  const events = getStoredEvents();
  return events.length > 0 ? events[events.length - 1] : null;
}

/**
 * Helper: Replay all events to snapshot map (DEV-only)
 * Convenience wrapper for replayToSnapshots() with no filters
 * 
 * @returns Map<vehicleId, VehicleStateSnapshot>
 */
export function replayAllToSnapshotMap(): Map<string, VehicleStateSnapshot> {
  return replayToSnapshots();
}

/**
 * Helper: Replay events for specific vehicle to snapshot map (DEV-only)
 * Convenience wrapper for replayToSnapshots({ vehicleId })
 * 
 * @param vehicleId - Vehicle ID to filter
 * @returns Map<vehicleId, VehicleStateSnapshot>
 */
export function replayVehicleToSnapshotMap(vehicleId: string): Map<string, VehicleStateSnapshot> {
  return replayToSnapshots({ vehicleId });
}
