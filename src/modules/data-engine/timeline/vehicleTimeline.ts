/**
 * Phase 8.4: Vehicle Timeline Layer
 *
 * Retrieves recent events that have affected a vehicle.
 * Sources from local event store (DEV-only for now).
 * Supports timeline visualization with sanitized event data.
 *
 * Single Source of Truth: localEventStore
 */

/**
 * Timeline event record
 */
export type TimelineEvent = {
  /** Unique event identifier */
  eventId: string;
  /** Type of event (e.g., RISK_INDEX_UPDATED, CLAIM_DETECTED, SERVICE_RECORD) */
  eventType: string;
  /** Domain affected (risk, insurance, part, service, diagnostics, etc.) */
  domain: string;
  /** When the event occurred (ISO 8601) */
  occurredAt: string;
  /** Where event came from (e.g., "kafka", "user", "api", "snapshot-inference") */
  source?: string;
};

/**
 * Configuration for timeline behavior
 */
const TIMELINE_CONFIG = {
  maxRecords: 20,
  sortNewestFirst: true,
  systemEventTypes: [
    'RISK_INDEX_UPDATED',
    'INSURANCE_INDEX_UPDATED',
    'PART_INDEX_UPDATED',
    'SERVICE_RECORDED',
    'OBD_SCAN',
    'MAINTENANCE_PERFORMED',
    'CLAIM_DETECTED',
    'POLICY_UPDATED',
  ],
};

/**
 * Lazy-initialize event store access
 * Returns store helper for reading stored events
 */
function getEventStoreHelper() {
  try {
    // Try to import and use local event store (DEV mode)
    const localStorage_key = 'DE_LOCAL_EVENT_STORE_V1';
    const stored = window.localStorage?.getItem(localStorage_key);

    return {
      getStoredEvents: () => {
        try {
          const stored = window.localStorage?.getItem(localStorage_key);
          if (!stored) return [];
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      },
    };
  } catch (error) {
    console.warn('[Timeline] Event store not available, returning empty timeline');
    return { getStoredEvents: () => [] };
  }
}

/**
 * Sanitize event data to remove PII before display
 */
function sanitizeEventForDisplay(event: any): Partial<TimelineEvent> {
  return {
    eventId: event.eventId || event.id || 'unknown',
    eventType: event.eventType || event.type || 'UNKNOWN',
    domain: event.domain || event.aggregateType || 'unknown',
    occurredAt: event.occurredAt || event.timestamp || new Date().toISOString(),
    source: event.source || 'system',
  };
}

/**
 * Format domain name for display
 */
function formatDomainName(domain: string): string {
  const domainMap: Record<string, string> = {
    risk: 'Risk',
    insurance: 'Sigorta',
    part: 'Parça',
    service: 'Servis',
    diagnostics: 'Tan',
    odometer: 'Odometre',
    expertise: 'Ekspertiz',
  };
  return domainMap[domain?.toLowerCase()] || domain || 'Sistem';
}

/**
 * Format event type for display
 */
function formatEventType(eventType: string): string {
  const typeMap: Record<string, string> = {
    RISK_INDEX_UPDATED: 'Risk Endeksi Güncellendi',
    INSURANCE_INDEX_UPDATED: 'Sigorta Endeksi Güncellendi',
    PART_INDEX_UPDATED: 'Parça Endeksi Güncellendi',
    SERVICE_RECORDED: 'Servis Kaydedildi',
    OBD_SCAN: 'OBD Taraması',
    MAINTENANCE_PERFORMED: 'Bakım Gerçekleştirildi',
    CLAIM_DETECTED: 'Harita Algılandı',
    POLICY_UPDATED: 'Poliçe Güncellendi',
  };
  return typeMap[eventType] || eventType || 'Bilinmeyen Olay';
}

/**
 * Get recent vehicle timeline events
 * Reads from local event store, filtered by vehicleId
 * Returns newest events first, limited to maxRecords
 */
export function getVehicleTimeline(vehicleId: string): TimelineEvent[] {
  try {
    if (!vehicleId || typeof vehicleId !== 'string') {
      return [];
    }

    const storeHelper = getEventStoreHelper();
    const allEvents = storeHelper.getStoredEvents();

    // Filter by vehicleId
    const vehicleEvents = allEvents.filter((event: any) => {
      return event.vehicleId === vehicleId || event.aggregateId === vehicleId;
    });

    // Sanitize and map to TimelineEvent
    const timelineEvents = vehicleEvents
      .map(event => sanitizeEventForDisplay(event) as TimelineEvent)
      .filter(event => event.eventId && event.eventType);

    // Sort newest first (by occurredAt)
    timelineEvents.sort((a, b) => {
      const timeA = new Date(a.occurredAt).getTime();
      const timeB = new Date(b.occurredAt).getTime();
      return timeB - timeA;
    });

    // Limit to maxRecords
    return timelineEvents.slice(0, TIMELINE_CONFIG.maxRecords);
  } catch (error) {
    console.error(`[Timeline] Error reading timeline for vehicle ${vehicleId}:`, error);
    return [];
  }
}

/**
 * Format timeline event for display with Turkish labels
 */
export function formatTimelineEventForDisplay(event: TimelineEvent): {
  id: string;
  title: string;
  domain: string;
  timestamp: string;
  source: string;
} {
  return {
    id: event.eventId,
    title: formatEventType(event.eventType),
    domain: formatDomainName(event.domain),
    timestamp: formatTimelineTimestamp(event.occurredAt),
    source: event.source || 'sistem',
  };
}

/**
 * Safe timestamp formatter for display
 * Handles various formats with fallback
 */
export function formatTimelineTimestamp(timestamp?: string | null): string {
  try {
    if (!timestamp) return 'Bilinmeyen zaman';

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Geçersiz tarih';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Relative time
    if (diffMinutes < 1) return 'şimdi';
    if (diffMinutes < 60) return `${diffMinutes}dk önce`;
    if (diffHours < 24) return `${diffHours}s önce`;
    if (diffDays < 7) return `${diffDays}g önce`;

    // Absolute date format: DD.MM.YYYY HH:MM
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('[Timeline] Error formatting timestamp:', error);
    return 'Tarih hatası';
  }
}

/**
 * Check if vehicle has any timeline events
 */
export function hasVehicleTimeline(vehicleId: string): boolean {
  return getVehicleTimeline(vehicleId).length > 0;
}

/**
 * Get timeline statistics for a vehicle
 */
export function getVehicleTimelineStats(vehicleId: string): {
  total: number;
  byDomain: Record<string, number>;
  oldestEvent: string | null;
  newestEvent: string | null;
} {
  try {
    const events = getVehicleTimeline(vehicleId);

    const byDomain: Record<string, number> = {};
    events.forEach(event => {
      const domain = formatDomainName(event.domain);
      byDomain[domain] = (byDomain[domain] || 0) + 1;
    });

    const timestamps = events.map(e => new Date(e.occurredAt).getTime()).filter(t => !isNaN(t));

    return {
      total: events.length,
      byDomain,
      oldestEvent: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null,
      newestEvent: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null,
    };
  } catch (error) {
    console.error(`[Timeline] Error getting timeline stats for ${vehicleId}:`, error);
    return { total: 0, byDomain: {}, oldestEvent: null, newestEvent: null };
  }
}
