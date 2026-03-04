/**
 * Risk Indices Panel - Snapshot-based Data Engine Visualization
 * Displays Risk Indices from Vehicle State Snapshot (Single Source of Truth)
 * Compact summary + accordion detail view
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Loader } from 'lucide-react';
import { getRiskIndices } from '../../vehicle-state/snapshotAccessor';
import { logRiskIndices } from '../../data-engine/eventLogger';

interface RiskIndicesPanelProps {
  vehicleId?: string;
  vin?: string;
  plate?: string;
}

interface ReasonCodeDetail {
  code: string;
  severity?: string;
  message?: string;
}

export function RiskIndicesPanel({ vehicleId: initialVehicleId, vin: initialVin, plate: initialPlate }: RiskIndicesPanelProps) {
  // State - Input Fields
  const [vehicleIdInput, setVehicleIdInput] = useState(initialVehicleId || '11');
  const [vinInput, setVinInput] = useState(initialVin || 'VIN-11');
  const [plateInput, setPlateInput] = useState(initialPlate || '34ABC34');

  // State - UI
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indices, setIndices] = useState<Array<{ key: string; value: number; confidence?: number }>>([]);

  // Fetch risk indices from Vehicle State Snapshot (Single Source of Truth)
  const fetchRiskIndices = async () => {
    if (!vehicleIdInput.trim()) {
      setError('Vehicle ID gereklidir');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[RiskIndicesPanel] Fetching from snapshot', { vehicleId: vehicleIdInput });

      // Read from snapshot (Single Source of Truth)
      const result = getRiskIndices(vehicleIdInput);

      if (!result || result.length === 0) {
        setError(`Araç ${vehicleIdInput} için risk verisi bulunamadı. Lütfen veri motorunu çalıştırın.`);
        setIndices([]);
        setIsLoading(false);
        return;
      }

      console.log('[RiskIndicesPanel] Snapshot result', {
        vehicleId: vehicleIdInput,
        count: result.length
      });

      setIndices(result);

      // Log event to Data Engine event store for audit trail (optional)
      try {
        logRiskIndices({
          tenantId: 'LENT-CORP-DEMO',
          vehicleId: vehicleIdInput,
          vin: vinInput,
          plate: plateInput,
          indices: result,
          source: 'EXPERTISE_SNAPSHOT'
        });
      } catch (logErr) {
        console.warn('[RiskIndicesPanel] Failed to log event', logErr);
        // Silent fail - don't disrupt UI
      }
    } catch (err) {
      // Safely extract error message
      let errorMsg = 'Bilinmeyen hata';
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = String((err as Record<string, any>).message);
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      console.error('[RiskIndicesPanel] Error', errorMsg);
      setError(errorMsg);
      setIndices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract summary badges (trustIndex, reliabilityIndex, maintenanceDiscipline)
  const summaryBadges = useMemo(() => {
    const badges: { label: string; value: number; color: string }[] = [];
    
    const keysToBadge = ['trustIndex', 'reliabilityIndex', 'maintenanceDiscipline'];
    
    indices.forEach(idx => {
      if (keysToBadge.includes(idx.key)) {
        let color = 'bg-gray-100 text-gray-700';
        
        if (idx.value >= 80) {
          color = 'bg-green-100 text-green-700';
        } else if (idx.value >= 60) {
          color = 'bg-blue-100 text-blue-700';
        } else if (idx.value >= 40) {
          color = 'bg-yellow-100 text-yellow-700';
        } else {
          color = 'bg-red-100 text-red-700';
        }

        badges.push({
          label: idx.key,
          value: Math.round(idx.value * 100) / 100,
          color
        });
      }
    });

    return badges;
  }, [indices]);

  // Extract reason codes
  const reasonCodes = useMemo(() => {
    const codes: ReasonCodeDetail[] = [];
    
    indices.forEach(idx => {
      if (idx.meta?.reasonCodes && Array.isArray(idx.meta.reasonCodes)) {
        (idx.meta.reasonCodes as any[]).forEach((rc: any) => {
          // rc can be string or object
          let code: string = '';
          let severity: string = 'info';
          let message: string | undefined = undefined;

          if (typeof rc === 'string') {
            code = rc;
          } else if (typeof rc === 'object' && rc !== null) {
            code = rc.code || String(rc);
            severity = rc.severity || 'info';
            // Safely extract message - convert to string if it's an object
            if (typeof rc.message === 'string') {
              message = rc.message;
            } else if (rc.message && typeof rc.message === 'object') {
              // If message is an object with message property, extract it
              if ('message' in rc.message) {
                message = String(rc.message.message);
              } else {
                // Otherwise just stringify the whole object
                message = JSON.stringify(rc.message);
              }
            } else if (rc.message) {
              message = String(rc.message);
            }
          } else {
            code = String(rc);
          }

          if (code && !codes.find(c => c.code === code)) {
            codes.push({ code, severity, message });
          }
        });
      }
    });

    // Maximum 10 items
    return codes.slice(0, 10);
  }, [indices]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold text-gray-900">
            🔍 Risk İndeksleri (Data Engine)
          </div>
          {indices.length > 0 && (
            <span className="px-2 py-1 bg-purple-200 text-purple-700 text-xs font-bold rounded-full">
              {indices.length}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-200 rounded transition"
          title={isExpanded ? 'Gizle' : 'Göster'}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4 space-y-4">
        {/* Input Alanları */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Araç Bilgileri</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Vehicle ID */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Vehicle ID
              </label>
              <input
                type="text"
                value={vehicleIdInput}
                onChange={(e) => setVehicleIdInput(e.target.value)}
                placeholder="11"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* VIN */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                VIN
              </label>
              <input
                type="text"
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value)}
                placeholder="VIN-11"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Plaka */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Plaka
              </label>
              <input
                type="text"
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value)}
                placeholder="34ABC34"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Yükle Butonu */}
          <button
            onClick={fetchRiskIndices}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader size={16} className="animate-spin" />
                Yükleniyor...
              </span>
            ) : (
              'Yükle'
            )}
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sonuç Alanı */}
        {!isLoading && !error && indices.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            Henüz risk indeksi bulunamadı. Araç bilgilerini girerek "Yükle" düğmesine basın.
          </div>
        )}

        {!isLoading && !error && indices.length > 0 && (
          <div>
            {/* Özet Badge'ler */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Özet</h3>
              <div className="flex flex-wrap gap-2">
                {summaryBadges.length > 0 ? (
                  summaryBadges.map(badge => (
                    <div
                      key={badge.label}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                    >
                      {badge.label}: <span className="font-bold">{badge.value}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Özet veri yok</span>
                )}
              </div>
            </div>

            {/* Detayları Göster/Gizle */}
            {isExpanded && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                {/* İndeksler Tablosu */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tüm İndeksler</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {indices.map((idx, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{idx.key}</span>
                          <span className="text-lg font-bold text-purple-600">
                            {Math.round(idx.value * 100) / 100}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>
                            Güven: <span className="font-medium">{Math.round(idx.confidence * 10000) / 100}%</span>
                          </span>
                          <span className="text-gray-500">
                            {new Date(idx.updatedAt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        {idx.meta?.confidenceReason && (
                          <div className="mt-2 text-xs text-gray-600 italic">
                            {idx.meta.confidenceReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Neden Kodları */}
                {reasonCodes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Neden Kodları</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {reasonCodes.map((rc, i) => (
                        <div key={i} className="p-2 bg-orange-50 rounded border border-orange-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded font-semibold">
                              {rc.code}
                            </span>
                            {rc.severity && (
                              <span className={`font-medium ${
                                rc.severity === 'critical' ? 'text-red-600' :
                                rc.severity === 'warning' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`}>
                                {rc.severity}
                              </span>
                            )}
                          </div>
                          {rc.message && (
                            <div className="mt-1 text-gray-700">{rc.message}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
