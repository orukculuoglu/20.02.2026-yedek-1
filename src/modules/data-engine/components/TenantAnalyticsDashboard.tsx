import React from 'react';
import { TrendingUp, AlertTriangle, Database, TrendingDown } from 'lucide-react';

interface TenantMetricsData {
  avgTrust: number;
  avgReliability: number;
  lowRiskPercent: number;
  mediumRiskPercent: number;
  highRiskPercent: number;
  mismatchPercent: number;
  topReasonCodes: Array<{ code: string; count: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
  totalEvents: number;
}

interface TenantAnalyticsDashboardProps {
  metrics: TenantMetricsData | null;
  period: 'week' | 'month' | 'all';
  onPeriodChange: (period: 'week' | 'month' | 'all') => void;
}

export default function TenantAnalyticsDashboard(props: TenantAnalyticsDashboardProps) {
  const { metrics, period, onPeriodChange } = props;

  if (!metrics) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-8">
        <div className="text-center text-gray-500">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Seçili tarih aralığında veri bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow mb-8">
      {/* Header with period filters */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Risk Segment Analizi</h3>
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
        </div>
        <p className="text-sm text-gray-600">Toplam {metrics.totalEvents} olay analiz edilmiştir</p>
      </div>

      {/* Metric cards grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Ortalama Trust Index */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 mb-1">ORTALAMA TRUST</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.avgTrust.toFixed(1)}</p>
                <p className="text-xs text-blue-700 mt-1">/ 100</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Ortalama Reliability Index */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 mb-1">ORTALAMA RELİABİLİTY</p>
                <p className="text-3xl font-bold text-green-900">{metrics.avgReliability.toFixed(1)}</p>
                <p className="text-xs text-green-700 mt-1">/ 100</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Orta Risk Oranı */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600 mb-1">ORTA RİSK ORANI</p>
                <p className="text-3xl font-bold text-yellow-900">{metrics.mediumRiskPercent}</p>
                <p className="text-xs text-yellow-700 mt-1">% olay</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          {/* Yüksek Risk Oranı */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 mb-1">YÜKSEK RİSK ORANI</p>
                <p className="text-3xl font-bold text-red-900">{metrics.highRiskPercent}</p>
                <p className="text-xs text-red-700 mt-1">% olay</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Secondary metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Risk Segment Distribution */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Risk Segmentleri</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">Düşük Risk (≥75)</span>
                  <span className="text-xs font-bold text-gray-900">{metrics.lowRiskPercent}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all" 
                    style={{ width: `${metrics.lowRiskPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">Orta Risk (50-74)</span>
                  <span className="text-xs font-bold text-gray-900">{metrics.mediumRiskPercent}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all" 
                    style={{ width: `${metrics.mediumRiskPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">Yüksek Risk (&lt;50)</span>
                  <span className="text-xs font-bold text-gray-900">{metrics.highRiskPercent}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all" 
                    style={{ width: `${metrics.highRiskPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Reason Codes & Insurance Mismatch */}
          <div>
            {/* Insurance Mismatch Card */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Sigorta-Hasar Uyumsuzluğu</h4>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-4xl font-bold text-red-600">{metrics.mismatchPercent}</p>
                  <p className="text-xs text-gray-600 mt-1">% Mismatch</p>
                </div>
                <div className="flex-1 h-12 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all" 
                    style={{ width: `${metrics.mismatchPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Top Reason Codes */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">En Sık Nedenler (Top 5)</h4>
              {metrics.topReasonCodes.length > 0 ? (
                <div className="space-y-2">
                  {metrics.topReasonCodes.map((rc, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 truncate flex-1">{rc.code}</span>
                      <span className="text-xs font-bold text-gray-900 ml-2">{rc.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Veri bulunmuyor</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
