/**
 * Data Engine Event Logger
 * Logs risk index calculation events to localStorage for audit/visibility
 * Tenant isolated, ring buffer support (demo uses localStorage)
 */

import type { DataEngineIndex } from './indicesDomainEngine';
import { appendEvent } from './store/localEventStore';

/**
 * Risk Index Event - Logged when risk indices are calculated
 */
export interface RiskIndexEvent {
  id: string; // UUID for deduplication
  eventType: 'RISK_INDEX_CALCULATED';
  tenantId: string;
  vehicleId: string;
  vin: string; // Can be masked
  plate: string; // Can be masked
  generatedAt: string; // ISO 8601
  indices: DataEngineIndex[];
  
  // Summaries (optional, computed)
  signalsSummary?: {
    totalSignals: number;
    riskSignals: number;
    warningSignals: number;
  };
  confidenceSummary?: {
    average: number;
    min: number;
    max: number;
  };
  
  // Source of data
  source: 'EXPERTISE' | 'FLEET_TELEMETRY' | 'MANUAL';
}

const MAX_EVENTS_PER_TENANT = 100;
const STORAGE_KEY_PREFIX = 'LENT_DE_RISK_EVENTS';

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get storage key for tenant
 */
function getStorageKey(tenantId: string): string {
  return `${STORAGE_KEY_PREFIX}:${tenantId}`;
}

/**
 * Compute confidence summary from indices
 */
function computeConfidenceSummary(indices: DataEngineIndex[]): { average: number; min: number; max: number } {
  if (indices.length === 0) {
    return { average: 0, min: 0, max: 0 };
  }

  const confidences = indices.map(idx => idx.confidence);
  const average = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const min = Math.min(...confidences);
  const max = Math.max(...confidences);

  return { average, min, max };
}

/**
 * Log risk index calculation event
 * @param event Event to log (tenantId, vehicleId, vin, plate, indices, source required)
 */
export function logRiskIndices(event: Omit<RiskIndexEvent, 'id' | 'eventType' | 'generatedAt' | 'confidenceSummary'>): RiskIndexEvent {
  const storageKey = getStorageKey(event.tenantId);

  try {
    // Load existing events
    const stored = localStorage.getItem(storageKey);
    let events: RiskIndexEvent[] = [];

    if (stored) {
      try {
        events = JSON.parse(stored);
      } catch (e) {
        console.warn('[DataEngine] Failed to parse event history, starting fresh', e);
        events = [];
      }
    }

    // Create new event
    const newEvent: RiskIndexEvent = {
      ...event,
      id: generateEventId(),
      eventType: 'RISK_INDEX_CALCULATED',
      generatedAt: new Date().toISOString(),
      confidenceSummary: computeConfidenceSummary(event.indices)
    };

    // Add to array
    events.push(newEvent);

    // Keep only last N events (ring buffer)
    if (events.length > MAX_EVENTS_PER_TENANT) {
      events = events.slice(events.length - MAX_EVENTS_PER_TENANT);
    }

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(events));

    console.log('[DataEngine] Risk index event logged', {
      id: newEvent.id,
      vehicleId: event.vehicleId,
      indices: event.indices.length
    });

    return newEvent;
  } catch (err) {
    console.warn('[DataEngine] Failed to log risk index event', err);
    // Return partial event (doesn't persist, but allows caller to continue)
    return {
      ...event,
      id: generateEventId(),
      eventType: 'RISK_INDEX_CALCULATED',
      generatedAt: new Date().toISOString(),
      confidenceSummary: computeConfidenceSummary(event.indices)
    };
  }
}

/**
 * Get last N risk index events for tenant
 */
export function getLastRiskIndexEvents(tenantId: string, limit: number = 20): RiskIndexEvent[] {
  const storageKey = getStorageKey(tenantId);

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return [];
    }

    const events: RiskIndexEvent[] = JSON.parse(stored);
    return events.slice(Math.max(0, events.length - limit));
  } catch (err) {
    console.error('[DataEngine] Failed to read event history', err);
    return [];
  }
}

/**
 * Get risk index events filtered by vehicleId
 */
export function getRiskIndexEventsByVehicleId(
  tenantId: string,
  vehicleId: string,
  limit: number = 20
): RiskIndexEvent[] {
  const allEvents = getLastRiskIndexEvents(tenantId, limit * 2); // Fetch more to ensure we get enough matches
  return allEvents
    .filter(e => e.vehicleId === vehicleId)
    .slice(-limit);
}

/**
 * Clear all events for tenant (admin/testing)
 */
export function clearRiskIndexEvents(tenantId: string): void {
  const storageKey = getStorageKey(tenantId);
  localStorage.removeItem(storageKey);
  console.log('[DataEngine] Risk index events cleared for tenant', tenantId);
}

/**
 * Get event statistics for tenant
 */
export function getRiskIndexEventStats(tenantId: string): {
  totalEvents: number;
  uniqueVehicles: number;
  dateRange: { start: string; end: string } | null;
} {
  const events = getLastRiskIndexEvents(tenantId, 1000);

  if (events.length === 0) {
    return { totalEvents: 0, uniqueVehicles: 0, dateRange: null };
  }

  const uniqueVehicles = new Set(events.map(e => e.vehicleId)).size;
  const sortedByDate = [...events].sort((a, b) =>
    new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
  );

  return {
    totalEvents: events.length,
    uniqueVehicles,
    dateRange: {
      start: sortedByDate[0].generatedAt,
      end: sortedByDate[sortedByDate.length - 1].generatedAt
    }
  };
}

/**
 * Mask VIN (show first 3 and last 2 chars)
 */
export function maskVin(vin: string): string {
  if (vin.length < 5) return '***';
  return `${vin.slice(0, 3)}${vin.length - 5}*${vin.slice(-2)}`;
}

/**
 * Mask Plate (show first and last char)
 */
export function maskPlate(plate: string): string {
  if (plate.length < 2) return '*';
  return `${plate[0]}${plate.length - 2}*${plate[plate.length - 1]}`;
}

/* ============================================================================
 * GENERIC DATA ENGINE EVENT LOG (Phase 6.7)
 * Domain-aware event log for unified visibility across risk/insurance domains
 * PII-safe: Only index key/value/confidence, no meta/VIN/plate
 * ============================================================================
 */

import type { DataEngineEventEnvelope } from './contracts/dataEngineEventTypes';

/**
 * Generic Data Engine Event Log Entry
 * Unified format for risk/insurance/other domain indices
 */
export interface DataEngineEventLogEntry {
  eventId: string;
  eventType: string;
  domain: 'risk' | 'insurance' | 'part' | string;
  vehicleId: string;
  source: string;
  occurredAt: string; // ISO 8601
  indicesSummary: Array<{
    key: string;
    value: number;
    confidence?: number;
  }>;
}

const MAX_UNIFIED_EVENTS = 200;
const UNIFIED_STORAGE_KEY = 'LENT_DE_UNIFIED_EVENTS_V1';

/**
 * In-memory unified event log
 */
let unifiedEventLog: DataEngineEventLogEntry[] = [];

/**
 * Initialize unified event log from localStorage
 */
function initializeUnifiedEventLog(): void {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(UNIFIED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          unifiedEventLog = parsed.slice(-MAX_UNIFIED_EVENTS);
          if (import.meta.env.DEV) {
            console.debug('[DataEngineEventLogger] Loaded', unifiedEventLog.length, 'unified events');
          }
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[DataEngineEventLogger] Failed to load unified events:', error);
      }
    }
  }
}

/**
 * Persist unified event log to localStorage
 */
function persistUnifiedEventLog(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(unifiedEventLog));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[DataEngineEventLogger] Failed to persist unified events:', error);
    }
  }
}

/**
 * Log a generic DataEngineEventEnvelope to unified event log
 * Extracts domain from eventType, extracts indices summary from payload
 * PII-safe: Drops all meta fields, only keeps key/value/confidence
 */
export function pushUnifiedDataEngineEventLog(envelope: DataEngineEventEnvelope): void {
  // Append to local event store (DEV-only, no-op in production)
  appendEvent(envelope);

  // Determine domain from eventType
  let domain = 'unknown';
  if (envelope.eventType.includes('RISK')) domain = 'risk';
  else if (envelope.eventType.includes('INSURANCE')) domain = 'insurance';
  else if (envelope.eventType.includes('PART')) domain = 'part';

  // Extract indices summary from payload (PII-safe: only key/value/confidence)
  let indicesSummary: DataEngineEventLogEntry['indicesSummary'] = [];
  if (
    envelope.payload &&
    typeof envelope.payload === 'object' &&
    'indices' in envelope.payload &&
    Array.isArray(envelope.payload.indices)
  ) {
    indicesSummary = (envelope.payload.indices as any[])
      .slice(0, 10) // Max 10 items
      .map((idx) => ({
        key: idx.key || 'unknown',
        value: typeof idx.value === 'number' ? idx.value : 0,
        confidence: typeof idx.confidence === 'number' ? idx.confidence : undefined,
      }));
  }

  const entry: DataEngineEventLogEntry = {
    eventId: envelope.eventId,
    eventType: envelope.eventType,
    domain,
    vehicleId: envelope.vehicleId,
    source: envelope.source,
    occurredAt: envelope.occurredAt,
    indicesSummary,
  };

  // Add to log
  unifiedEventLog.push(entry);

  // Maintain ring buffer
  if (unifiedEventLog.length > MAX_UNIFIED_EVENTS) {
    unifiedEventLog = unifiedEventLog.slice(-MAX_UNIFIED_EVENTS);
  }

  // Persist
  persistUnifiedEventLog();

  if (import.meta.env.DEV) {
    console.debug('[DataEngineEventLogger] Unified event logged:', {
      eventId: entry.eventId,
      domain: entry.domain,
      vehicleId: entry.vehicleId,
      indexCount: entry.indicesSummary.length,
    });
  }
}

/**
 * Get unified event log (optionally filtered by domain)
 */
export function getUnifiedDataEngineEventLog(
  domain?: 'risk' | 'insurance' | 'part' | 'all'
): DataEngineEventLogEntry[] {
  // Initialize if needed
  if (unifiedEventLog.length === 0) {
    initializeUnifiedEventLog();
  }

  if (!domain || domain === 'all') {
    return [...unifiedEventLog].reverse(); // Newest first
  }

  return unifiedEventLog
    .filter((e) => e.domain === domain)
    .reverse(); // Newest first
}

/**
 * Clear unified event log (DEV only)
 */
export function clearUnifiedDataEngineEventLog(): void {
  if (!import.meta.env.DEV) {
    console.warn('[DataEngineEventLogger] clearUnifiedDataEngineEventLog() is DEV-only');
    return;
  }

  unifiedEventLog = [];

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(UNIFIED_STORAGE_KEY);
    } catch (error) {
      console.warn('[DataEngineEventLogger] Failed to clear localStorage:', error);
    }
  }

  if (import.meta.env.DEV) {
    console.debug('[DataEngineEventLogger] Unified event log cleared');
  }
}

// Initialize on module load
initializeUnifiedEventLog();
