import React from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import type { RiskIndexEvent } from '../eventLogger';
import type { RiskRecommendation } from '../../../types/RiskRecommendation';
import { buildRiskRecommendation } from '../../../services/recommendationEngine';

interface VehicleRiskRecord {
  vehicleId: string;
  latestEvent: RiskIndexEvent;
  trustIndex: number;
  reliabilityIndex: number;
  maintenanceDiscipline: number;
  insuranceRisk: number;
  riskSegment: 'Low' | 'Medium' | 'High';
  lastEventDate: string;
  source: string;
  recommendation: RiskRecommendation;
}

interface OperationalRiskListProps {
  events: RiskIndexEvent[];
  period: 'week' | 'month' | 'all';
  onPeriodChange: (period: 'week' | 'month' | 'all') => void;
  segmentFilter: 'all' | 'medium' | 'high';
  onSegmentFilterChange: (filter: 'all' | 'medium' | 'high') => void;
  onSelectVehicle: (vehicleId: string, event: RiskIndexEvent) => void;
}

// Helper function to generate structured recommendations based on metrics
function generateSuggestion(
  vehicleId: string,
  trustIndex: number,
  reliabilityIndex: number,
  maintenanceDiscipline: number,
  insuranceRisk: number
): RiskRecommendation {
  // Build structured recommendation using the enterprise engine
  return buildRiskRecommendation({
    vehicleId,
    trustIndex,
    reliabilityIndex,
    maintenanceDiscipline,
    // Note: reason codes would come from event.indices meta if available
    // For now, we use numeric thresholds as fallback
  });
}

export default function OperationalRiskList(props: OperationalRiskListProps) {
  const { events, period, onPeriodChange, segmentFilter, onSegmentFilterChange, onSelectVehicle } = props;

  // Aggregate vehicles with their latest metrics (memoized)
  const vehicleRecords = React.useMemo(() => {
    if (!events || events.length === 0) return [];

    // Create map of vehicleId -> latest event with metrics
    const vehicleMap = new Map<string, VehicleRiskRecord>();

    events.forEach(event => {
      if (!event.vehicleId) return;

      const vehicleId = event.vehicleId;
      
      // Extract trust index
      let trustIndex = 50;
      if (event.confidenceSummary?.average !== undefined) {
        const val = event.confidenceSummary.average;
        trustIndex = val <= 1 ? val * 100 : val;
      }

      // Extract reliability index
      let reliabilityIndex = 50;
      if (event.indices?.length) {
        const reliabilityIdx = event.indices.find(idx => idx.key === 'reliabilityIndex');
        if (reliabilityIdx && typeof reliabilityIdx.value === 'number') {
          const val = reliabilityIdx.value;
          reliabilityIndex = val <= 1 ? val * 100 : val > 100 ? Math.min(100, val / 100) : val;
        }
      }

      // Extract maintenance discipline
      let maintenanceDiscipline = 50;
      if (event.indices?.length) {
        const maintIdx = event.indices.find(idx => 
          (idx.key || '').toLowerCase().includes('maintenance') || 
          (idx.key || '').toLowerCase().includes('discipline')
        );
        if (maintIdx && typeof maintIdx.value === 'number') {
          const val = maintIdx.value;
          maintenanceDiscipline = val <= 1 ? val * 100 : val > 100 ? Math.min(100, val / 100) : val;
        }
      }

      // Extract insurance risk
      let insuranceRisk = 30;
      if (event.indices?.length) {
        const insuranceIdx = event.indices.find(idx => 
          (idx.key || '').toLowerCase().includes('insurance') || 
          (idx.key || '').toLowerCase().includes('claim') ||
          (idx.key || '').toLowerCase().includes('damage') ||
          (idx.key || '').toLowerCase().includes('mismatch')
        );
        if (insuranceIdx && typeof insuranceIdx.value === 'number') {
          const val = insuranceIdx.value;
          insuranceRisk = val <= 1 ? val * 100 : val > 100 ? Math.min(100, val / 100) : val;
        }
      }

      // Generate structured recommendation based on metrics
      const recommendation = generateSuggestion(
        vehicleId,
        trustIndex,
        reliabilityIndex,
        maintenanceDiscipline,
        insuranceRisk
      );

      // Determine risk segment
      const riskSegment: 'Low' | 'Medium' | 'High' = 
        trustIndex >= 75 ? 'Low' : 
        trustIndex >= 50 ? 'Medium' : 
        'High';

      // Only keep if trust < 75 (medium or high risk)
      if (trustIndex >= 75) return;

      // Update or create record (keep latest event for each vehicle)
      const existing = vehicleMap.get(vehicleId);
      if (!existing || new Date(event.generatedAt) > new Date(existing.lastEventDate)) {
        vehicleMap.set(vehicleId, {
          vehicleId,
          latestEvent: event,
          trustIndex: Math.max(0, Math.min(100, trustIndex)),
          reliabilityIndex: Math.max(0, Math.min(100, reliabilityIndex)),
          maintenanceDiscipline: Math.max(0, Math.min(100, maintenanceDiscipline)),
          insuranceRisk: Math.max(0, Math.min(100, insuranceRisk)),
          riskSegment,
          lastEventDate: event.generatedAt,
          source: event.source || 'UNKNOWN',
          recommendation
        });
      }
    });

    // Convert to array and filter by segment
    let records = Array.from(vehicleMap.values());
    
    if (segmentFilter === 'medium') {
      records = records.filter(r => r.riskSegment === 'Medium');
    } else if (segmentFilter === 'high') {
      records = records.filter(r => r.riskSegment === 'High');
    }

    // Sort by trust index (lowest first)
    records.sort((a, b) => a.trustIndex - b.trustIndex);

    return records;
  }, [events, segmentFilter]);

  if (!events || events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-8">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Riskli araç bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow mb-8">
      {/* Header with filters */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Riskli Araçlar (Operasyonel Liste)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {vehicleRecords.length} araç aksiyona hazır (Trust &lt; 75)
            </p>
          </div>
          
          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* Period filters */}
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p === 'week' ? 'Son 7 Gün' : p === 'month' ? 'Son 30 Gün' : 'Tümü'}
                </button>
              ))}
            </div>

            {/* Segment filters */}
            <div className="flex gap-2">
              {(['all', 'medium', 'high'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => onSegmentFilterChange(s)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    segmentFilter === s
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'Tümü' : s === 'medium' ? 'Orta Risk' : 'Yüksek Risk'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {vehicleRecords.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">Seçili filtreler için araç bulunmuyor</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">VehicleID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Trust Index</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Reliability</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Bakım Disiplini</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Risk Segment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Son Event</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Kaynak</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Sistem Önerisi</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {vehicleRecords.map((record, idx) => (
                <tr 
                  key={idx} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 font-medium">{record.vehicleId}</td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                        record.trustIndex >= 75 ? 'bg-green-600' :
                        record.trustIndex >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {record.trustIndex.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {record.reliabilityIndex.toFixed(1)}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {record.maintenanceDiscipline.toFixed(1)}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      record.riskSegment === 'Low' 
                        ? 'bg-green-100 text-green-800' :
                      record.riskSegment === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                      {record.riskSegment === 'Low' ? 'Düşük' :
                       record.riskSegment === 'Medium' ? 'Orta' :
                       'Yüksek'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-700 text-xs">
                    {new Date(record.lastEventDate).toLocaleDateString('tr-TR', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                      {record.source}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold inline-block max-w-xs ${
                        record.recommendation.priorityScore >= 85
                          ? 'bg-red-100 text-red-800' :
                        record.recommendation.priorityScore >= 60
                          ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                        {record.recommendation.recommendation}
                      </span>
                      <span className="text-xs text-gray-500 muted">
                        {record.recommendation.reason}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onSelectVehicle(record.vehicleId, record.latestEvent)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition-colors"
                    >
                      <span>İncele</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
