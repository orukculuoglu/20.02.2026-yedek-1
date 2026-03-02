/**
 * WorkOrder Vehicle History Section
 * Inline araç öyküsü gösterimi - WorkOrder detail'inin parçası olarak
 * Includes risk recommendation based on latest risk indices
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Calendar, AlertCircle, X } from 'lucide-react';
import { getVehicleHistoryEvents } from '../../../../services/dataService';
import { getRiskIndexEventsByVehicleId } from '../../data-engine/eventLogger';
import { generateRiskRecommendation } from '../../../services/recommendationEngine';
import { RiskRecommendationCard } from './RiskRecommendationCard';
import type { RiskRecommendation } from '../../../../types/RiskRecommendation';

// DEV-only logger helper (runs only inside TS module, not exported to console)
const isDev = import.meta.env.DEV;
const devLog = (...args: any[]) => {
  if (isDev) {
    console.log('[WorkOrderVehicleHistory]', ...args);
  }
};

interface VehicleHistoryEntry {
  id: string;
  ts: string;
  source: string;
  title: string;
  summary: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  meta?: any;
}

interface WorkOrderVehicleHistorySectionProps {
  vehicleId?: string;
  vin?: string;
  plate?: string;
  tenantId?: string;
}

export const WorkOrderVehicleHistorySection: React.FC<WorkOrderVehicleHistorySectionProps> = ({
  vehicleId,
  vin,
  plate,
  tenantId = 'LENT-CORP-DEMO'
}) => {
  const [events, setEvents] = useState<VehicleHistoryEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [detailModalEventId, setDetailModalEventId] = useState<string | null>(null);

  // Memoized recommendation from latest risk event
  const recommendation: RiskRecommendation | null = useMemo(() => {
    if (!vehicleId) return null;

    try {
      // Get latest risk index event for this vehicle
      const latestEvents = getRiskIndexEventsByVehicleId(vehicleId, 1);
      const hasLatestEvents = latestEvents && latestEvents.length > 0;
      
      devLog('Fetched risk events:', {
        vehicleId,
        eventsCount: latestEvents?.length ?? 0,
        hasLatestEvents
      });

      if (!hasLatestEvents) {
        devLog('No risk events found');
        return null;
      }

      const latestEvent = latestEvents[0];
      const hasIndices = latestEvent?.indices && Array.isArray(latestEvent.indices) && latestEvent.indices.length > 0;
      
      devLog('Latest event structure:', {
        hasEvent: !!latestEvent,
        indicesCount: latestEvent?.indices?.length ?? 0,
        hasConfidenceSummary: !!latestEvent?.confidenceSummary
      });

      if (!hasIndices) {
        devLog('WARNING: Event has no indices - recommendation cannot be generated');
        return null;
      }

      // Map event structure to ensure proper format
      const mappedEvent = {
        indices: latestEvent.indices || [],
        confidenceSummary: latestEvent.confidenceSummary || {
          average: 0,
          min: 0,
          max: 0
        }
      };

      devLog('Mapped event for recommendation:', {
        indicesCount: mappedEvent.indices.length,
        firstIndexKey: mappedEvent.indices[0]?.key,
        confidenceSummary: mappedEvent.confidenceSummary
      });

      const rec = generateRiskRecommendation({
        vehicleId,
        event: mappedEvent,
      });

      devLog('Recommendation generated:', {
        hasRecommendation: !!rec,
        priorityScore: rec?.priorityScore,
        actionType: rec?.actionType
      });

      return rec;
    } catch (err) {
      devLog('Error generating recommendation:', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      return null;
    }
  }, [vehicleId]);

  // Load events on mount or when vehicleId changes
  useEffect(() => {
    if (!vehicleId && !vin && !plate) return;

    loadVehicleHistory();
  }, [vehicleId, vin, plate]);

  const loadVehicleHistory = async () => {
    if (!vehicleId && !vin && !plate) return;

    setIsLoading(true);
    setError(null);

    try {
      devLog('Loading vehicle history for vehicleId:', vehicleId);

      const result = await getVehicleHistoryEvents({
        vehicleId: vehicleId || undefined,
        vin: vin || undefined,
        plate: plate || undefined,
        tenantId,
        limit: 20
      });

      devLog('Loaded vehicle history events:', { count: result.length });
      setEvents(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      devLog('Error loading vehicle history:', { error: errorMsg });
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicleId && !vin && !plate) {
    return null;
  }

  // Badge göster
  const hasBadge = events.length > 0;
  const badgeText = `📌 Araç Öyküsü (${events.length} olay)`;

  const getSeverityColor = (severity?: string): string => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'LOW': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSourceColor = (source: string): string => {
    switch (source) {
      case 'EXPERTISE': return '#3b82f6';
      case 'FLEET_TELEMETRY': return '#10b981';
      case 'MANUAL': return '#8b5cf6';
      case 'SERVICE': return '#f59e0b';
      case 'ERP': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const formatDateTime = (iso: string): string => {
    try {
      return new Date(iso).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  const detailEvent = detailModalEventId ? events.find(e => e.id === detailModalEventId) : null;

  return (
    <>
      {/* Badge - Only show if events exist */}
      {hasBadge && !isExpanded && (
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(true)}
            className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2"
          >
            <span>{badgeText}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* Show Recommendation Card when collapsed if available */}
      {!isExpanded && recommendation && (
        <RiskRecommendationCard recommendation={recommendation} />
      )}

      {/* Accordion Section */}
      {isExpanded && (
        <div className="space-y-3 pb-4 border-b border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Araç Öyküsü (Read Only)
              </h4>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-slate-200 rounded transition"
            >
              <ChevronUp size={16} className="text-slate-400" />
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-xs text-slate-500">Yükleniyor...</div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Events List */}
          {!isLoading && events.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-2 border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition text-xs space-y-1"
                >
                  {/* Meta row: Time + Source + Severity */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-500">{formatDateTime(event.ts)}</span>
                    <span
                      className="px-2 py-0.5 text-white text-[10px] font-semibold rounded"
                      style={{ backgroundColor: getSourceColor(event.source) }}
                    >
                      {event.source}
                    </span>
                    {event.severity && (
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-slate-800">{event.title}</p>

                  {/* Summary */}
                  <p className="text-slate-700">{event.summary}</p>

                  {/* Detail Button */}
                  {event.meta && (
                    <button
                      onClick={() => setDetailModalEventId(event.id)}
                      className="mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded hover:bg-blue-200 transition"
                    >
                      Detay
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No events */}
          {!isLoading && events.length === 0 && !error && (
            <div className="text-xs text-slate-500 italic">Bu araç için öykü kaydı bulunmadı.</div>
          )}

          {/* Recommendation Card */}
          {!isLoading && <RiskRecommendationCard recommendation={recommendation} />}
        </div>
      )}

      {/* Detail Modal */}
      {detailEvent && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 sticky top-0">
              <h3 className="font-bold text-slate-800">{detailEvent.title}</h3>
              <button
                onClick={() => setDetailModalEventId(null)}
                className="p-1 hover:bg-slate-200 rounded transition"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-slate-600">Zaman</p>
                  <p className="text-slate-800">{formatDateTime(detailEvent.ts)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-600">Kaynak</p>
                  <span
                    className="inline-block px-2 py-0.5 text-white rounded"
                    style={{ backgroundColor: getSourceColor(detailEvent.source) }}
                  >
                    {detailEvent.source}
                  </span>
                </div>
                {detailEvent.severity && (
                  <div>
                    <p className="font-semibold text-slate-600">Önem</p>
                    <span className={`inline-block px-2 py-0.5 rounded ${getSeverityColor(detailEvent.severity)}`}>
                      {detailEvent.severity}
                    </span>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div>
                <p className="font-semibold text-slate-600 text-xs mb-1">Özet</p>
                <p className="text-slate-700 text-sm">{detailEvent.summary}</p>
              </div>

              {/* JSON Data */}
              {detailEvent.meta && (
                <div>
                  <p className="font-semibold text-slate-600 text-xs mb-1">Veriler (JSON)</p>
                  <div className="bg-slate-100 p-3 rounded border border-slate-200 overflow-x-auto">
                    <pre className="text-[10px] text-slate-700 whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify(detailEvent.meta, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
              <button
                onClick={() => setDetailModalEventId(null)}
                className="px-3 py-1 bg-slate-200 text-slate-700 text-sm font-semibold rounded hover:bg-slate-300 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkOrderVehicleHistorySection;
