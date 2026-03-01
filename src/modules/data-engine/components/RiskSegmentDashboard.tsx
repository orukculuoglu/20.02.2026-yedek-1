/**
 * Risk Segment Dashboard
 * Toplu analitik: son N events üzerinden risk metriklerini hesapla
 * PHASE 3 STEP 2: Filters + Drilldown + ReasonCode fix + Insurance rate fix
 */

import React, { useMemo, useState } from 'react';
import { AlertCircle, TrendingDown, TrendingUp, Zap, HelpCircle, ChevronRight } from 'lucide-react';
import type { RiskIndexEvent } from '../eventLogger';
import { normalizeConfidence, boundToHundred } from '../utils/normalizeConfidence';

interface RiskSegmentDashboardProps {
  events: RiskIndexEvent[];
  maxEvents?: number;
  onMaxEventsChange?: (n: number) => void;
  onEventClick?: (event: RiskIndexEvent) => void;
}

interface Metrics {
  trustIndexStats: {
    mean: number;
    median: number;
    min: number;
    max: number;
    bins: { range: string; count: number }[];
  };
  riskSegments: {
    low: { count: number; percent: number };
    medium: { count: number; percent: number };
    high: { count: number; percent: number };
  };
  topReasonCodes: { code: string; count: number }[];
  insuranceMismatchRatio: number;
  dataSourceBreakdown: { source: string; count: number; percent: number }[];
  totalEvents: number;
}

/**
 * Extract all reason codes from an event
 * Looks in: indices[].meta.reasonCodes[], signals[].meta.reasonCodes[]
 */
function extractReasonCodes(event: RiskIndexEvent): string[] {
  const codes = new Set<string>();
  
  if (event.indices) {
    event.indices.forEach((idx) => {
      // Check meta.reasonCodes
      if (idx.meta?.reasonCodes && Array.isArray(idx.meta.reasonCodes)) {
        idx.meta.reasonCodes.forEach((code) => {
          if (typeof code === 'string') codes.add(code);
        });
      }
    });
  }
  
  // Check signals if available
  if ((event as any).signals) {
    const signals = (event as any).signals;
    if (Array.isArray(signals)) {
      signals.forEach((sig: any) => {
        if (sig.meta?.reasonCodes && Array.isArray(sig.meta.reasonCodes)) {
          sig.meta.reasonCodes.forEach((code: any) => {
            if (typeof code === 'string') codes.add(code);
          });
        }
      });
    }
  }
  
  return Array.from(codes);
}

/**
 * Check if event has insurance-damage mismatch
 */
function hasInsuranceMismatch(reasonCodes: string[]): boolean {
  return reasonCodes.some(code => 
    code.toUpperCase().includes('INSURANCE_DAMAGE_INCONSISTENCY') ||
    code.toUpperCase().includes('CLAIM_WITHOUT_DAMAGE_RECORD')
  );
}

/**
 * Get cutoff timestamp for date range
 */
function getDateRangeCutoff(range: 'week' | 'month' | 'all'): Date {
  const now = new Date();
  if (range === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === 'month') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return new Date(0); // All time
}

/**
 * Calculate metrics from risk index events (pre-filtered)
 */
function calculateMetrics(events: RiskIndexEvent[]): Metrics {
  const totalEvents = events.length;

  if (totalEvents === 0) {
    return {
      trustIndexStats: { mean: 0, median: 0, min: 0, max: 0, bins: [] },
      riskSegments: { low: { count: 0, percent: 0 }, medium: { count: 0, percent: 0 }, high: { count: 0, percent: 0 } },
      topReasonCodes: [],
      insuranceMismatchRatio: 0,
      dataSourceBreakdown: [],
      totalEvents: 0
    };
  }

  // 1. TrustIndex stats
  const trustIndices: number[] = [];
  events.forEach((event) => {
    let trustValue = 0;
    if (event.confidenceSummary?.average !== undefined) {
      trustValue = normalizeConfidence(event.confidenceSummary.average);
    } else if (event.indices?.length) {
      const avgConfidence = event.indices.reduce((sum, idx) => sum + normalizeConfidence(idx.confidence), 0) / event.indices.length;
      trustValue = avgConfidence;
    } else {
      trustValue = 50;
    }
    trustIndices.push(boundToHundred(trustValue));
  });

  const sortedTrust = [...trustIndices].sort((a, b) => a - b);
  const mean = boundToHundred(trustIndices.reduce((a, b) => a + b, 0) / trustIndices.length);
  const median = sortedTrust[Math.floor(sortedTrust.length / 2)];
  const min = Math.min(...trustIndices);
  const max = Math.max(...trustIndices);

  const bins = [
    { range: '0-30', count: trustIndices.filter((t) => t <= 30).length },
    { range: '31-60', count: trustIndices.filter((t) => t > 30 && t <= 60).length },
    { range: '61-100', count: trustIndices.filter((t) => t > 60).length }
  ];

  // 2. Risk segments
  let lowCount = 0, mediumCount = 0, highCount = 0;
  trustIndices.forEach((trust) => {
    if (trust >= 70) lowCount++;
    else if (trust >= 40) mediumCount++;
    else highCount++;
  });

  const riskSegments = {
    low: { count: lowCount, percent: totalEvents > 0 ? Math.round((lowCount / totalEvents) * 100) : 0 },
    medium: { count: mediumCount, percent: totalEvents > 0 ? Math.round((mediumCount / totalEvents) * 100) : 0 },
    high: { count: highCount, percent: totalEvents > 0 ? Math.round((highCount / totalEvents) * 100) : 0 }
  };

  // 3. Top 5 ReasonCodes - FIXED: Extract from meta.reasonCodes, NOT index keys
  const reasonCodeMap = new Map<string, number>();
  events.forEach((event) => {
    const codes = extractReasonCodes(event);
    codes.forEach((code) => {
      const count = reasonCodeMap.get(code) || 0;
      reasonCodeMap.set(code, count + 1);
    });
  });

  const topReasonCodes = Array.from(reasonCodeMap.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // If no reason codes found, show placeholder
  if (topReasonCodes.length === 0) {
    topReasonCodes.push({ code: 'ReasonCode yok', count: 0 });
  }

  // 4. Insurance-damage mismatch - FIXED: Count events with mismatch reason codes
  let mismatchEventCount = 0;
  events.forEach((event) => {
    const codes = extractReasonCodes(event);
    if (hasInsuranceMismatch(codes)) {
      mismatchEventCount++;
    }
  });
  const insuranceMismatchRatio = totalEvents > 0 ? Math.round((mismatchEventCount / totalEvents) * 100) : 0;

  // 5. Data source breakdown
  const sourceMap = new Map<string, number>();
  events.forEach((event) => {
    const source = event.source || 'UNKNOWN';
    const count = sourceMap.get(source) || 0;
    sourceMap.set(source, count + 1);
  });

  const dataSourceBreakdown = Array.from(sourceMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      percent: Math.round((count / totalEvents) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  return {
    trustIndexStats: { mean, median, min, max, bins },
    riskSegments,
    topReasonCodes,
    insuranceMismatchRatio,
    dataSourceBreakdown,
    totalEvents
  };
}

export const RiskSegmentDashboard: React.FC<RiskSegmentDashboardProps> = ({
  events,
  maxEvents = 100,
  onMaxEventsChange,
  onEventClick
}) => {
  // State for filtering
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('all');
  const [vehicleIdFilter, setVehicleIdFilter] = useState('');

  // Use only first maxEvents
  let filteredEvents = events.slice(0, maxEvents);

  // Apply date range filter
  if (dateRange !== 'all') {
    const cutoff = getDateRangeCutoff(dateRange);
    filteredEvents = filteredEvents.filter(
      (event) => new Date(event.generatedAt) >= cutoff
    );
  }

  // Apply vehicle ID filter
  if (vehicleIdFilter.trim()) {
    const searchTerm = vehicleIdFilter.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (event) => (event.vehicleId || '').toLowerCase().includes(searchTerm)
    );
  }

  // Calculate metrics on filtered events
  const metrics = useMemo(() => calculateMetrics(filteredEvents), [filteredEvents]);

  // Risk segment colors
  const riskColors = {
    low: '#10b981',    // green
    medium: '#f59e0b', // amber
    high: '#ef4444'    // red
  };

  // Tooltip state for risk level explanation
  const [showRiskTooltip, setShowRiskTooltip] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-800">Risk Segment Dashboard (Toplu Analitik)</h3>
        </div>
        {/* Max Events Control */}
        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-600">Son</label>
          <input
            type="number"
            min="20"
            max="500"
            value={maxEvents}
            onChange={(e) => onMaxEventsChange?.(Math.min(500, Math.max(20, parseInt(e.target.value) || 100)))}
            className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center focus:outline-none focus:border-blue-500"
          />
          <label className="text-slate-600">event</label>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase">Tarih Aralığı</label>
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {range === 'week' ? 'Son 7 Gün' : range === 'month' ? 'Son 30 Gün' : 'Tümü'}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle ID Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase">Vehicle ID Filtresi</label>
          <input
            type="text"
            placeholder="Araç ID'si ara..."
            value={vehicleIdFilter}
            onChange={(e) => setVehicleIdFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Info */}
        {(dateRange !== 'all' || vehicleIdFilter) && (
          <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
            <strong>{metrics.totalEvents}</strong> event gösteriliyor
            {dateRange !== 'all' && (
              <>
                {' '}({dateRange === 'week' ? 'son 7 gün' : 'son 30 gün'})
              </>
            )}
            {vehicleIdFilter && ` - "${vehicleIdFilter}" filtresi uygulanmış`}
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. TrustIndex Stats Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h4 className="text-xs font-black text-slate-500 uppercase mb-3">TrustIndex İstatistikleri</h4>

          <div className="space-y-2 text-sm mb-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Ortalama</span>
              <span className="font-bold text-slate-800">{metrics.trustIndexStats.mean.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Medyan</span>
              <span className="font-bold text-slate-800">{metrics.trustIndexStats.median.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Min / Max</span>
              <span className="font-bold text-slate-800">
                {metrics.trustIndexStats.min.toFixed(0)} / {metrics.trustIndexStats.max.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Bins */}
          <div className="space-y-1.5 text-xs">
            {metrics.trustIndexStats.bins.map((bin) => (
              <div key={bin.range} className="flex items-center justify-between">
                <span className="text-slate-600">{bin.range}</span>
                <div className="flex items-center gap-2 flex-1 ml-2">
                  <div className="flex-1 bg-slate-100 rounded h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${metrics.totalEvents > 0 ? (bin.count / metrics.totalEvents) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="font-bold text-slate-700 w-8 text-right">{bin.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Risk Segments Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-black text-slate-500 uppercase">Risk Seviyeleri</h4>
            <div className="relative">
              <button
                onMouseEnter={() => setShowRiskTooltip(true)}
                onMouseLeave={() => setShowRiskTooltip(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <HelpCircle size={14} />
              </button>
              {showRiskTooltip && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">
                  Metrik: Ortalama TrustIndex<br/>
                  Düşük: ≥70 | Orta: 40-69 | Yüksek: &lt;40
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {/* Low */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors.low }} />
                <span className="text-sm text-slate-600">Düşük</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-sm">{metrics.riskSegments.low.count}</span>
                <span className="text-xs text-slate-500 ml-1">({metrics.riskSegments.low.percent}%)</span>
              </div>
            </div>

            {/* Medium */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors.medium }} />
                <span className="text-sm text-slate-600">Orta</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-sm">{metrics.riskSegments.medium.count}</span>
                <span className="text-xs text-slate-500 ml-1">({metrics.riskSegments.medium.percent}%)</span>
              </div>
            </div>

            {/* High */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors.high }} />
                <span className="text-sm text-slate-600">Yüksek</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-sm">{metrics.riskSegments.high.count}</span>
                <span className="text-xs text-slate-500 ml-1">({metrics.riskSegments.high.percent}%)</span>
              </div>
            </div>
          </div>

          {/* Visual bars */}
          <div className="mt-3 space-y-1">
            <div className="flex h-2 gap-1 rounded-full overflow-hidden bg-slate-100">
              <div
                className="bg-green-500"
                style={{
                  flex: metrics.riskSegments.low.count || 0.1
                }}
              />
              <div
                className="bg-amber-500"
                style={{
                  flex: metrics.riskSegments.medium.count || 0.1
                }}
              />
              <div
                className="bg-red-500"
                style={{
                  flex: metrics.riskSegments.high.count || 0.1
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Insurance-Damage Mismatch Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h4 className="text-xs font-black text-slate-500 uppercase mb-3 flex items-center gap-1">
            <AlertCircle size={14} className="text-amber-600" />
            Sigorta-Hasar Mismatch
          </h4>

          <div className="text-center">
            <div className="text-3xl font-black text-amber-600 mb-1">{metrics.insuranceMismatchRatio}%</div>
            <p className="text-xs text-slate-600">Problematik event'ler</p>
          </div>

          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <p>
              <strong>Tıp:</strong> INSURANCE_DAMAGE_INCONSISTENCY veya<br/>
              CLAIM_WITHOUT_DAMAGE_RECORD reason code'u olan events
            </p>
          </div>
        </div>

        {/* 4. Top Reason Codes Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h4 className="text-xs font-black text-slate-500 uppercase mb-3">İlk 5 Reason Code</h4>

          <div className="space-y-1.5 text-xs">
            {metrics.topReasonCodes.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-600 truncate flex-1">{item.code}</span>
                <div className="flex items-center gap-2 ml-2">
                  <div className="flex-1 bg-slate-100 rounded h-1.5 overflow-hidden w-16">
                    <div
                      className="bg-purple-500 h-full"
                      style={{
                        width: `${metrics.totalEvents > 0 ? (item.count / metrics.totalEvents) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="font-bold text-slate-700 w-6 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Data Source Breakdown Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h4 className="text-xs font-black text-slate-500 uppercase mb-3">Veri Kaynağı</h4>

          <div className="space-y-1.5 text-xs">
            {metrics.dataSourceBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-600">{item.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{item.count}</span>
                  <span className="font-bold text-slate-700">{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Summary Card */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
          <h4 className="text-xs font-black text-blue-700 uppercase mb-3">Özet</h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Toplam Event</span>
              <span className="font-bold text-blue-900">{metrics.totalEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Kayıt Yoğunluğu</span>
              <span className="font-bold text-blue-900">
                {metrics.dataSourceBreakdown.length} veri kaynağı
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Risk Profile</span>
              <span className="font-bold text-blue-900">
                {metrics.riskSegments.high.percent > 40 ? 'Yüksek' : metrics.riskSegments.high.percent > 20 ? 'Orta' : 'Düşük'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskSegmentDashboard;
