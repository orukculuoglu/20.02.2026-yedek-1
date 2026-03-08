/**
 * Vehicle Event Service - Phase 8.6
 *
 * Fetches vehicle events from Data Engine event store.
 * - Priority 1: Real data from local event store (Phase 8.6+)
 * - Priority 2: Fallback to mock data for development
 * 
 * Events include:
 * - Domain updates (RISK/INSURANCE/PART_INDICES_UPDATED)
 * - Vehicle intelligence analysis runs (VEHICLE_INTELLIGENCE_ANALYZED)
 * - Other domain events (service, insurance, diagnostics, etc.)
 *
 * Note: Returns empty array if no events found (not error state).
 */

import type { DataEngineEventEnvelope } from '../../data-engine/contracts/dataEngineEventTypes';

/**
 * Vehicle event record from Data Engine event store
 * Phase 8.6: Standardized on occurredAt for all timestamps (matches DataEngineEventEnvelope)
 */
export interface VehicleEvent {
  id: string;
  vehicleId: string;
  eventType: string;        // e.g., VEHICLE_INTELLIGENCE_ANALYZED, RISK_INDICES_UPDATED, MAINTENANCE, etc.
  domain: string;           // e.g., intelligence, risk, insurance, part, service, diagnostics
  source: string;           // e.g., VEHICLE_INTELLIGENCE, DATA_ENGINE, kafka, user, api, system
  occurredAt: string;       // ISO 8601 datetime when event occurred (normalized from raw event)
  createdAt: string;        // When event was recorded in system (ingestedAt from envelope)
  payload?: Record<string, any>;  // Optional event-specific details
  description?: string;     // Human-readable description
}

/**
 * Configuration for vehicle event fetching
 */
const EVENT_CONFIG = {
  maxEvents: 20,
  sortOrderDesc: true as const,
  supportedDomains: ['service', 'insurance', 'diagnostics', 'part', 'maintenance', 'expertise', 'odometer'],
};

/**
 * Mock vehicle events for development/testing
 * Returns realistic event data when API is unavailable
 */
function generateMockVehicleEvents(vehicleId: string): VehicleEvent[] {
  const now = new Date();
  const events: VehicleEvent[] = [];

  // Service events
  events.push({
    id: `evt-${vehicleId}-service-001`,
    vehicleId,
    eventType: 'MAINTENANCE',
    domain: 'service',
    source: 'system',
    occurredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Rutin bakım - Yağ değişimi ve filtre temizliği',
    payload: { serviceType: 'routine', cost: 2500 },
  });

  // Insurance events
  events.push({
    id: `evt-${vehicleId}-insurance-001`,
    vehicleId,
    eventType: 'POLICY_RENEWAL',
    domain: 'insurance',
    source: 'api',
    occurredAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Poliçe yenilendi',
    payload: { coverageType: 'comprehensive', premium: 15000 },
  });

  // OBD scan events
  events.push({
    id: `evt-${vehicleId}-obd-001`,
    vehicleId,
    eventType: 'OBD_SCAN',
    domain: 'diagnostics',
    source: 'user',
    occurredAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'OBD taraması gerçekleştirildi',
    payload: { faultCodes: 3, severity: 'warning' },
  });

  // Claim events
  events.push({
    id: `evt-${vehicleId}-claim-001`,
    vehicleId,
    eventType: 'CLAIM_FILED',
    domain: 'insurance',
    source: 'api',
    occurredAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Hasar talebine başvuruldu',
    payload: { claimAmount: 45000, claimType: 'collision' },
  });

  // Part replacement
  events.push({
    id: `evt-${vehicleId}-part-001`,
    vehicleId,
    eventType: 'PART_REPLACED',
    domain: 'part',
    source: 'system',
    occurredAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Fren pedi değiştirildi',
    payload: { partNumber: 'BP-2024-001', cost: 3500, quantity: 1 },
  });

  // Sort by occurredAt descending (newest first)
  return events.sort((a, b) => {
    const timeA = new Date(a.occurredAt).getTime();
    const timeB = new Date(b.occurredAt).getTime();
    return timeB - timeA;
  });
}

/**
 * Fetch vehicle events from Data Engine event store
 * 
 * Flow:
 * 1. Try to query local event store by vehicleId
 * 2. Filter to relevant event types (domain updates + intelligence analysis)
 * 3. Sort by timestamp DESC (newest first)
 * 4. Return last N events (default 20)
 * 5. Fallback to mock data if store unavailable
 * 
 * @param vehicleId - Vehicle ID to filter events by
 * @returns Sorted array of vehicle events (newest first, max 20)
 */
export async function fetchVehicleEvents(vehicleId: string): Promise<VehicleEvent[]> {
  try {
    if (!vehicleId || typeof vehicleId !== 'string') {
      console.warn('[VehicleEventService] Invalid vehicleId:', vehicleId);
      return [];
    }

    console.debug('[VehicleEventService] Fetching events for vehicleId:', vehicleId);

    // Phase 8.6: Query actual Data Engine event store (LENT_DATA_ENGINE_EVENTS_V1)
    const dataEngineEvents = queryDataEngineEventsByVehicleId(vehicleId);
    
    console.debug('[VehicleEventService] Query result:', {
      vehicleId,
      eventsFound: dataEngineEvents.length,
      eventTypes: dataEngineEvents.map(e => e.eventType),
    });

    if (dataEngineEvents.length > 0) {
      console.debug('[VehicleEventService] ✓ Fetched', dataEngineEvents.length, 'events from Data Engine store for vehicle', vehicleId);
      return dataEngineEvents.slice(0, EVENT_CONFIG.maxEvents);
    }

    // Fallback: Use mock data for development (when no real events found)
    console.debug('[VehicleEventService] ⚠ No events in store, using mock data for vehicle', vehicleId);
    const mockEvents = generateMockVehicleEvents(vehicleId);
    return mockEvents.slice(0, EVENT_CONFIG.maxEvents);
  } catch (error) {
    console.error(`[VehicleEventService] Error fetching events for ${vehicleId}:`, error);

    // Final fallback to mock data on error
    return generateMockVehicleEvents(vehicleId).slice(0, EVENT_CONFIG.maxEvents);
  }
}

/**
 * Query Data Engine event store for vehicle-specific events
 * 
 * Reads from localStorage key: LENT_DATA_ENGINE_EVENTS_V1 (ingestion buffer, not local event store)
 * This matches where sendDataEngineEvent() persists events via ingestDataEngineEvent()
 * 
 * Filters by vehicleId and converts to VehicleEvent format.
 * 
 * @param vehicleId - Filter by this vehicle ID
 * @returns Array of vehicle events sorted by timestamp DESC
 */
function queryDataEngineEventsByVehicleId(vehicleId: string): VehicleEvent[] {
  try {
    // READ FROM: LENT_DATA_ENGINE_EVENTS_V1 (ingestion buffer)
    // This is where sendDataEngineEvent -> ingestDataEngineEvent persists events
    const stored = localStorage.getItem('LENT_DATA_ENGINE_EVENTS_V1');
    
    if (import.meta.env.DEV) {
      console.debug('[VehicleEventService] queryDataEngineEventsByVehicleId', {
        vehicleId,
        storageKeyFound: !!stored,
        storageKey: 'LENT_DATA_ENGINE_EVENTS_V1',
      });
    }

    if (!stored) {
      console.warn('[VehicleEventService] Event store empty (key: LENT_DATA_ENGINE_EVENTS_V1)');
      return [];
    }

    // Parse as array (direct format, not wrapped)
    let eventsArray: DataEngineEventEnvelope[] = [];
    try {
      const parsed = JSON.parse(stored);
      eventsArray = Array.isArray(parsed) ? parsed : [];
    } catch (parseErr) {
      console.warn('[VehicleEventService] Failed to parse event store:', parseErr);
      return [];
    }

    if (!Array.isArray(eventsArray)) {
      console.warn('[VehicleEventService] Event store is not an array:', typeof eventsArray);
      return [];
    }

    if (import.meta.env.DEV) {
      console.debug('[VehicleEventService] Event store contains', eventsArray.length, 'total events');
    }

    // Infer domain from eventType
    const getDomainFromEventType = (eventType: string): string => {
      if (eventType.includes('RISK')) return 'risk';
      if (eventType.includes('INSURANCE')) return 'insurance';
      if (eventType.includes('PART')) return 'part';
      if (eventType.includes('INTELLIGENCE')) return 'intelligence';
      if (eventType.includes('SERVICE')) return 'service';
      if (eventType.includes('EXPERT')) return 'expertise';
      if (eventType.includes('OBD') || eventType.includes('DIAGNOSTIC')) return 'diagnostics';
      if (eventType.includes('CLAIM') || eventType.includes('POLICY')) return 'insurance';
      if (eventType.includes('ODOMETER')) return 'odometer';
      return 'unknown';
    };

    // Filter to events for this vehicleId
    const vehicleEvents: VehicleEvent[] = [];
    eventsArray.forEach((envelope: any, idx: number) => {
      if (!envelope || envelope.vehicleId !== vehicleId) return;

      // Map DataEngineEventEnvelope to VehicleEvent
      const domain = getDomainFromEventType(envelope.eventType);
      
      // PHASE 8.6 FINAL HOTFIX: Extract source with defensive handling
      // Possible source locations: source (top-level), meta.source (nested), or undefined
      let sourceValue = envelope.source;
      if (!sourceValue && envelope.meta?.source) {
        sourceValue = envelope.meta.source;
      }
      if (!sourceValue && envelope.actor) {
        sourceValue = envelope.actor;  // Fallback to actor if exists
      }
      if (!sourceValue) {
        sourceValue = 'UNKNOWN';  // Final fallback
      }
      
      // PHASE 8.6 FINAL: Extract timestamp with fallback chain
      // Possible timestamp locations: occurredAt, timestamp, ingestedAt, createdAt, eventTimestamp
      let timestampValue = envelope.occurredAt;
      if (!timestampValue) timestampValue = envelope.timestamp;
      if (!timestampValue) timestampValue = envelope.ingestedAt;
      if (!timestampValue) timestampValue = envelope.createdAt;
      if (!timestampValue) timestampValue = envelope.eventTimestamp;
      
      // Validate and normalize timestamp
      let normalizedTimestamp = timestampValue;
      if (timestampValue) {
        // Ensure it's ISO 8601 format
        try {
          const dateTest = new Date(timestampValue);
          if (isNaN(dateTest.getTime())) {
            // Invalid date from raw value
            normalizedTimestamp = new Date().toISOString();
          } else {
            // Valid date - ensure it's ISO string
            normalizedTimestamp = dateTest.toISOString();
          }
        } catch (e) {
          normalizedTimestamp = new Date().toISOString();
        }
      } else {
        // No timestamp found - use current time
        normalizedTimestamp = new Date().toISOString();
      }
      
      if (import.meta.env.DEV) {
        console.warn(`[VehicleEventService] 🔍 RAW EVENT #${idx}:`, {
          eventId: envelope.eventId,
          eventType: envelope.eventType,
          vehicleId: envelope.vehicleId,
          sourceField: envelope.source,
          sourceNested: envelope.meta?.source,
          sourceActor: envelope.actor,
          sourceFinal: sourceValue,
          occurredAtField: envelope.occurredAt,
          timestampField: envelope.timestamp,
          ingestedAtField: envelope.ingestedAt,
          createdAtField: envelope.createdAt,
          timestampRaw: timestampValue,
          timestampNormalized: normalizedTimestamp,
          allKeys: Object.keys(envelope),
        });
      }
      
      const vEvent: VehicleEvent = {
        id: envelope.eventId,
        vehicleId: envelope.vehicleId,
        eventType: envelope.eventType,
        domain,
        source: sourceValue,
        occurredAt: normalizedTimestamp,  // PHASE 8.6: Standardized on occurredAt
        createdAt: envelope.ingestedAt || envelope.createdAt || normalizedTimestamp,
        payload: envelope.payload,
        description: generateEventDescription(envelope.eventType, domain),
      };
      
      // Verify normalized values
      if (import.meta.env.DEV) {
        console.warn(`[VehicleEventService] ✓ NORMALIZED #${idx}:`, {
          id: vEvent.id?.substring(0, 12),
          eventType: vEvent.eventType,
          domain: vEvent.domain,
          source: vEvent.source,
          sourceLabel: getSourceLabel(vEvent.source),
          occurredAt: vEvent.occurredAt,
          occurredAtFormatted: formatEventTimestamp(vEvent.occurredAt),
          createdAt: vEvent.createdAt,
        });
      }
      
      vehicleEvents.push(vEvent);
      
      if (import.meta.env.DEV) {
        console.debug(`  [Event ${idx}] ${envelope.eventType} (vehicleId: ${envelope.vehicleId})`);
      }
    });

    console.debug('[VehicleEventService] ✓ Filtered', vehicleEvents.length, 'events for vehicleId', vehicleId);

    // Sort by occurredAt descending (newest first)
    vehicleEvents.sort((a, b) => {
      const timeA = new Date(a.occurredAt).getTime();
      const timeB = new Date(b.occurredAt).getTime();
      return timeB - timeA;
    });

    return vehicleEvents;
  } catch (error) {
    console.error('[VehicleEventService] ✗ Error querying event store:', error);
    return [];
  }
}

/**
 * Generate human-readable description for an event based on type and domain
 */
function generateEventDescription(eventType: string, domain?: string): string {
  const descriptions: Record<string, string> = {
    VEHICLE_INTELLIGENCE_ANALYZED: 'Araç zekası analizi çalıştırıldı',
    VEHICLE_INTELLIGENCE_AGGREGATED: 'Araç zekası toplandı',
    RISK_INDICES_UPDATED: 'Risk indeksleri güncellendi',
    INSURANCE_INDICES_UPDATED: 'Sigorta indeksleri güncellendi',
    PART_INDICES_UPDATED: 'Parça indeksleri güncellendi',
    SERVICE_RECORDED: 'Servis kaydedildi',
    OBD_SCAN: 'OBD taraması yapıldı',
    CLAIM_DETECTED: 'Hasar algılandı',
    POLICY_UPDATED: 'Poliçe güncellendi',
    MAINTENANCE: 'Bakım gerçekleştirildi',
  };
  
  return descriptions[eventType] || `${eventType.toLowerCase().replace(/_/g, ' ')} olayı`;
}

/**
 * Get event type display label in Turkish
 * Includes Phase 8.6 intelligence analysis events and domain update events
 */
export function getEventTypeLabel(eventType: string | undefined): string {
  if (!eventType) return 'Bilinmiyor';  // Fallback for undefined
  
  const translations: Record<string, string> = {
    // Phase 8.6: Vehicle Intelligence Analysis Events
    VEHICLE_INTELLIGENCE_ANALYZED: 'Araç Zekası Analizi',
    VEHICLE_INTELLIGENCE_AGGREGATED: 'Araç Zekası Toplandı',
    RISK_INDICES_UPDATED: 'Risk Indeksleri Güncellendi',
    INSURANCE_INDICES_UPDATED: 'Sigorta İndeksleri Güncellendi',
    PART_INDICES_UPDATED: 'Parça İndeksleri Güncellendi',
    
    // Phase 8.5+: Service/Operations Events
    MAINTENANCE: 'Bakım',
    REPAIR: 'Onarım',
    INSPECTION: 'Muayene',
    OBD_SCAN: 'OBD Taraması',
    SERVICE_RECORDED: 'Servis Kaydı',
    CLAIM_FILED: 'Hasar Talebine Başvuru',
    CLAIM_DETECTED: 'Hasar Algılandı',
    POLICY_RENEWAL: 'Poliçe Yenileme',
    POLICY_UPDATED: 'Poliçe Güncelleme',
    PART_REPLACED: 'Parça Değiştirildi',
    PART_UPDATED: 'Parça Güncellemesi',
    RECALL: 'Geri Çağırma',
    ACCIDENT: 'Kaza',
    THEFT: 'Hırsızlık',
    ODOMETER_RECORDED: 'KM Kaydedildi',
    EXPERTISE_COMPLETED: 'Ekspertiz Tamamlandı',
  };

  return translations[eventType] || eventType;
}

/**
 * Get domain display label in Turkish
 */
export function getDomainLabel(domain: string | undefined): string {
  if (!domain) return 'Bilinmiyor';  // Fallback for undefined
  
  const translations: Record<string, string> = {
    intelligence: 'Aracın Zekası',  // Phase 8.6: Vehicle Intelligence Analysis domain
    risk: 'Risk',
    insurance: 'Sigorta',
    diagnostics: 'Tanılama',
    part: 'Parça',
    maintenance: 'Bakım',
    expertise: 'Ekspertiz',
    odometer: 'Odometre',
    service: 'Servis',
  };

  return translations[domain.toLowerCase()] || domain;
}

/**
 * Get source display label
 */
export function getSourceLabel(source: string | undefined): string {
  if (!source) return 'Bilinmiyor';  // Fallback: show Turkish for unknown, not "unknown"
  
  const translations: Record<string, string> = {
    'VEHICLE_INTELLIGENCE': 'Araç Zekası',
    'kafka': 'Kafka Stream',
    'api': 'API',
    'user': 'Kullanıcı',
    'manual': 'Manuel',
    'system': 'Sistem',
    'import': 'İthalatç',
    'DATA_ENGINE': 'Veri Motoru',
  };

  return translations[source.toLowerCase()] || source;
}

/**
 * Format event timestamp for display
 */
export function formatEventTimestamp(timestamp: string | Date | undefined | null): string {
  try {
    // Handle missing/null timestamps
    if (!timestamp) {
      if (import.meta.env.DEV) {
        console.warn('[VehicleEventService] formatEventTimestamp received null/undefined:', { timestamp });
      }
      return 'Tarih yok';
    }

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      if (import.meta.env.DEV) {
        console.warn('[VehicleEventService] Invalid date parsed:', { timestamp, typeof: typeof timestamp });
      }
      return 'Geçersiz tarih';
    }

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
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}h önce`;

    // Absolute timestamp: DD.MM.YYYY HH:MM
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[VehicleEventService] Error formatting timestamp:', { timestamp, error });
    }
    return 'Tarih hatası';
  }
}

/**
 * Get domain color/badge styling
 */
export function getDomainColor(domain: string | undefined): string {
  if (!domain) {
    return 'bg-gray-100 text-gray-800 border-gray-300';  // Default fallback for undefined
  }
  
  const colors: Record<string, string> = {
    intelligence: 'bg-purple-100 text-purple-800 border-purple-300',  // Phase 8.6: Vehicle Intelligence domain
    risk: 'bg-red-100 text-red-800 border-red-300',
    service: 'bg-blue-100 text-blue-800 border-blue-300',
    insurance: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    diagnostics: 'bg-orange-100 text-orange-800 border-orange-300',
    part: 'bg-green-100 text-green-800 border-green-300',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    expertise: 'bg-pink-100 text-pink-800 border-pink-300',
    odometer: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  };

  return colors[domain.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
}
