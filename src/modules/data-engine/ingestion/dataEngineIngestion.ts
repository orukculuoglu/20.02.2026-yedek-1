/**
 * Data Engine Ingestion Bus
 * In-memory circular event buffer for standardized data engine events
 * 
 * Design:
 * - Circular buffer: Latest 500 events (FIFO, drops oldest on overflow)
 * - PII-safe enforcement: Rejects events with piiSafe !== true
 * - Optional persistence: localStorage for DEV mode (disabled in PROD)
 * - Query filtering: By vehicleId, eventType, source, timestamp range
 * - Observable: [DataEngineIngestion] prefix logs (DEV only)
 * 
 * Usage:
 * - ingestDataEngineEvent() → add event to buffer
 * - getDataEngineEvents() → query with optional filters
 * - clearDataEngineEvents() → reset buffer (DEV only)
 * 
 * No backend calls; pure in-memory ingestion.
 */

import type {
  DataEngineEventEnvelope,
  DataEngineEventFilter,
} from "../contracts/dataEngineEventTypes";
import { isPiiSafeEvent } from "../contracts/dataEngineEventTypes";
import { pushUnifiedDataEngineEventLog } from "../eventLogger";
import { applyDataEngineEventToSnapshot } from "../../vehicle-state/vehicleStateReducer";
import { addEventToTimeline } from "../../vehicle-state/snapshotAccessor";
import { ingestWithOutbox } from "./eventOutbox";

/**
 * Maximum number of events to keep in memory (circular buffer)
 */
const EVENT_BUFFER_LIMIT = 500;

/**
 * Storage key for localStorage persistence (DEV only)
 */
const STORAGE_KEY = "LENT_DATA_ENGINE_EVENTS_V1";

/**
 * In-memory circular buffer for ingested events
 */
let eventBuffer: DataEngineEventEnvelope[] = [];

/**
 * Flag: whether to persist to localStorage (DEV only)
 */
const shouldPersist = import.meta.env.DEV;

/**
 * Initialize event buffer on module load
 * Attempts to restore from localStorage (DEV mode only)
 */
function initializeEventBuffer(): void {
  if (shouldPersist && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          eventBuffer = parsed.slice(-EVENT_BUFFER_LIMIT);
          if (import.meta.env.DEV) {
            console.debug(
              "[DataEngineIngestion] Restored",
              eventBuffer.length,
              "events from localStorage"
            );
          }
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[DataEngineIngestion] Failed to restore from localStorage:", error);
      }
    }
  }
}

/**
 * Persist event buffer to localStorage (DEV only)
 */
function persistEventBuffer(): void {
  if (!shouldPersist || typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventBuffer));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[DataEngineIngestion] Failed to persist to localStorage:", error);
    }
  }
}

/**
 * Ingest a data engine event into the buffer
 * 
 * @param evt - Event envelope (must have piiSafe === true)
 * @throws Error if piiSafe !== true (DEV mode only)
 * 
 * Process:
 * 1. Validate PII-safety
 * 2. Add ingestedAt timestamp
 * 3. Ingest through outbox (idempotency + storage)
 * 4. Push to circular buffer (drop oldest if full)
 * 5. Persist to localStorage (DEV only)
 * 
 * Note: Outbox handles event log + snapshot reduction internally
 */
export async function ingestDataEngineEvent(evt: DataEngineEventEnvelope): Promise<void> {
  // Validate PII-safety
  if (!isPiiSafeEvent(evt)) {
    if (import.meta.env.DEV) {
      throw new Error(
        `[DataEngineIngestion] Event rejected: piiSafe must be true. Event: ${JSON.stringify(evt)}`
      );
    } else {
      // PROD: silently reject
      if (import.meta.env.DEV) {
        console.warn("[DataEngineIngestion] Rejected unsafe event:", evt);
      }
      return;
    }
  }

  // Add ingestion timestamp
  const eventWithIngestionTime: DataEngineEventEnvelope = {
    ...evt,
    ingestedAt: new Date().toISOString(),
  };

  // Ingest through outbox (handles idempotency, storage, event log, snapshots)
  try {
    const appended = await ingestWithOutbox(eventWithIngestionTime);

    // Maintain circular buffer for backward compatibility
    eventBuffer.push(eventWithIngestionTime);
    if (eventBuffer.length > EVENT_BUFFER_LIMIT) {
      eventBuffer.shift();
    }

    // Persist to storage
    persistEventBuffer();

    // Add to timeline visualization store (for UI refresh)
    // Maps index update events to human-readable timeline entries
    const domainMap: Record<string, string> = {
      'RISK_INDICES_UPDATED': 'risk',
      'INSURANCE_INDICES_UPDATED': 'insurance',
      'PART_INDICES_UPDATED': 'part',
      'VEHICLE_INTELLIGENCE_AGGREGATED': 'intelligence',
    };
    
    const domain = domainMap[evt.eventType];
    if (domain) {
      const descriptions: Record<string, string> = {
        'risk': 'Risk indeksleri güncellendi',
        'insurance': 'Sigorta indeksleri güncellendi',
        'part': 'Parça indeksleri güncellendi',
        'intelligence': 'Araç zekası toplandı',
      };
      addEventToTimeline(
        evt.vehicleId,
        evt.eventType,
        domain,
        descriptions[domain]
      );
    }

    // Log in DEV mode
    if (import.meta.env.DEV) {
      console.debug("[DataEngineIngestion] Event ingested:", {
        eventId: evt.eventId,
        eventType: evt.eventType,
        source: evt.source,
        vehicleId: evt.vehicleId,
        tenantId: evt.tenantId || 'dev',
        appended,
        bufferSize: eventBuffer.length,
      });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[DataEngineIngestion] Failed to ingest event:", error);
    }
  }
}

/**
 * Query ingested events with optional filtering
 * 
 * @param filter - Optional filter (vehicleId, eventType, source, time range)
 * @returns Array of matching events (newest first)
 */
export function getDataEngineEvents(filter?: DataEngineEventFilter): DataEngineEventEnvelope[] {
  // Initialize if needed
  if (eventBuffer.length === 0) {
    initializeEventBuffer();
  }

  if (!filter) {
    // Return all events (newest first)
    return [...eventBuffer].reverse();
  }

  // Apply filters
  let results = [...eventBuffer];

  if (filter.vehicleId) {
    results = results.filter((evt) => evt.vehicleId === filter.vehicleId);
  }

  if (filter.eventType) {
    results = results.filter((evt) => evt.eventType === filter.eventType);
  }

  if (filter.source) {
    results = results.filter((evt) => evt.source === filter.source);
  }

  if (filter.fromTime) {
    const fromMs = new Date(filter.fromTime).getTime();
    results = results.filter(
      (evt) => new Date(evt.occurredAt).getTime() >= fromMs
    );
  }

  if (filter.toTime) {
    const toMs = new Date(filter.toTime).getTime();
    results = results.filter(
      (evt) => new Date(evt.occurredAt).getTime() <= toMs
    );
  }

  // Return newest first
  return results.reverse();
}

/**
 * Clear all ingested events
 * DEV only: Clears both memory and localStorage
 */
export function clearDataEngineEvents(): void {
  if (!import.meta.env.DEV) {
    console.warn("[DataEngineIngestion] clearDataEngineEvents() is DEV-only");
    return;
  }

  eventBuffer = [];

  if (shouldPersist && typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("[DataEngineIngestion] Failed to clear localStorage:", error);
    }
  }

  if (import.meta.env.DEV) {
    console.debug("[DataEngineIngestion] Event buffer cleared");
  }
}

/**
 * Get buffer statistics (DEV only)
 */
export function getDataEngineBufferStats(): {
  totalEvents: number;
  bufferLimit: number;
  storageKey: string;
} {
  return {
    totalEvents: eventBuffer.length,
    bufferLimit: EVENT_BUFFER_LIMIT,
    storageKey: STORAGE_KEY,
  };
}

// Initialize on module load
initializeEventBuffer();
