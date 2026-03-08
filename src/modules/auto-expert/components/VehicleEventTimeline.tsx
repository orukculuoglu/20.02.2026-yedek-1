/**
 * Vehicle Event Timeline Component
 *
 * Displays a collapsible timeline of vehicle events from the database.
 * - Shows last 20 events sorted by created_at DESC
 * - Collapsible payload viewer (JSON)
 * - Read-only visualization
 * - Independent of snapshot/index calculation system
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import {
  fetchVehicleEvents,
  getEventTypeLabel,
  getDomainLabel,
  getSourceLabel,
  formatEventTimestamp,
  getDomainColor,
  type VehicleEvent,
} from '../../vehicle-intelligence/services/vehicleEventService';

interface VehicleEventTimelineProps {
  vehicleId: string;
}

export function VehicleEventTimeline({ vehicleId }: VehicleEventTimelineProps) {
  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch events when component mounts or vehicleId changes
  useEffect(() => {
    if (!vehicleId) {
      setEvents([]);
      return;
    }

    const loadEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedEvents = await fetchVehicleEvents(vehicleId);
        
        // PHASE 8.6 FINAL HOTFIX: Log each event before rendering
        if (import.meta.env.DEV && fetchedEvents.length > 0) {
          console.warn('[VehicleEventTimeline] 📋 Received events to render:', {
            count: fetchedEvents.length,
            vehicleId,
          });
          
          fetchedEvents.forEach((event, idx) => {
            console.warn(`[VehicleEventTimeline] Event #${idx}:`, {
              id: event.id?.substring(0, 12),
              eventType: event.eventType,
              domain: event.domain,
              source: event.source,
              sourceLabel: getSourceLabel(event.source),
              occurredAt: event.occurredAt,  // PHASE 8.6 FINAL: Use occurredAt field
              occurredAtFormatted: formatEventTimestamp(event.occurredAt),  // Format it
              hasPayload: !!event.payload,
              description: event.description,
            });
          });
        }
        
        setEvents(fetchedEvents);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load events';
        setError(errorMsg);
        console.error('[VehicleEventTimeline] Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [vehicleId]);

  // Handle copy to clipboard
  const handleCopyPayload = (eventId: string, payload: Record<string, any> | undefined) => {
    if (!payload) return;

    const jsonStr = JSON.stringify(payload, null, 2);
    navigator.clipboard
      .writeText(jsonStr)
      .then(() => {
        setCopiedEventId(eventId);
        setTimeout(() => setCopiedEventId(null), 2000);
      })
      .catch(err => console.error('Copy failed:', err));
  };

  // No events state
  if (!loading && events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Araç Olay Zaman Çizelgesi</h3>
        <p className="text-sm text-gray-500">No vehicle events recorded yet.</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-sm p-6 border border-red-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Araç Olay Zaman Çizelgesi</h3>
        <p className="text-sm text-red-600">Olay yüklenirken hata oluştu: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      {/* Header with Collapse/Expand */}
      <div
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Araç Olay Zaman Çizelgesi</h3>
          <p className="text-sm text-gray-600 mt-1">
            Son {events.length} olay - {vehicleId}
          </p>
        </div>
        <div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Timeline Content (Collapsible) */}
      {isExpanded && (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Olaylar yükleniyor...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No vehicle events recorded yet.</p>
            </div>
          ) : (
            events.map((event, idx) => (
              <div
                key={event.id || `event-${idx}`}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition"
              >
                {/* Event Header */}
                <div
                  className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 flex items-start justify-between cursor-pointer hover:from-gray-100 hover:to-gray-150"
                  onClick={() =>
                    setExpandedEventId(expandedEventId === event.id ? null : event.id)
                  }
                >
                  <div className="flex-1 min-w-0">
                    {/* Event Type and Domain Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200">
                        {getEventTypeLabel(event.eventType)}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded border ${getDomainColor(event.domain)}`}>
                        {getDomainLabel(event.domain)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded border bg-gray-100 text-gray-600 border-gray-300">
                        {getSourceLabel(event.source)}
                      </span>
                    </div>

                    {/* Event Description and Timestamp */}
                    <p className="text-sm text-gray-800 font-medium mb-1">
                      {event.description || `Event "${event.eventType}"`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatEventTimestamp(event.occurredAt)} • ID: {event.id?.substring(0, 12)}...
                    </p>
                  </div>

                  {/* Expand/Collapse Icon for Payload */}
                  {event.payload && (
                    <div className="ml-2 flex-shrink-0">
                      {expandedEventId === event.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Payload Viewer (Collapsible JSON) */}
                {event.payload && expandedEventId === event.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Payload (JSON)</p>
                      <button
                        onClick={() => handleCopyPayload(event.id, event.payload)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-600 hover:text-gray-800"
                      >
                        {copiedEventId === event.id ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            Kopyalandı
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Kopyala
                          </>
                        )}
                      </button>
                    </div>

                    {/* JSON Display */}
                    <pre className="bg-white rounded p-3 border border-gray-300 text-xs text-gray-700 overflow-x-auto max-h-48 overflow-y-auto">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary when collapsed */}
      {!isExpanded && events.length > 0 && (
        <div className="text-sm text-gray-600 flex items-center justify-between">
          <span>
            {events.length} olay • En son: {formatEventTimestamp(events[0].occurredAt)}
          </span>
          <span className="text-xs text-gray-500">Detayları görmek için tıklayın</span>
        </div>
      )}
    </div>
  );
}
