/**
 * Operational Risk Dashboard
 * Visual analytics panel for recommendation rule metrics and risk distribution
 * Displays: total events, rule trigger frequencies, risk severity distribution, top reason codes
 * Purpose: Operational intelligence for monitoring recommendation engine effectiveness
 * 
 * NO PII: Analytics extracted from in-memory event log (no VIN, plate, identity)
 */

import React, { useMemo } from 'react';
import { TrendingUp, BarChart3, AlertTriangle, Zap } from 'lucide-react';
import {
  buildRiskAnalytics,
  formatRiskDistributionPercent,
  type RiskAnalyticsSummary,
} from '../riskAnalyticsEngine';
import type { RiskRecommendation } from '../../../types/RiskRecommendation';

interface OperationalRiskDashboardProps {
  events: RiskRecommendation[];
  showDevJson?: boolean;
}

export const OperationalRiskDashboard: React.FC<OperationalRiskDashboardProps> = ({
  events,
  showDevJson = import.meta.env.DEV,
}) => {
  // Compute analytics
  const analytics = useMemo(() => {
    return buildRiskAnalytics(events);
  }, [events]);

  // Format distribution percentages
  const distPercent = useMemo(() => {
    return formatRiskDistributionPercent(analytics.distribution);
  }, [analytics.distribution]);

  // Color mapping for severity
  const getSeverityColor = (severity: 'veryLow' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'veryLow':
        return { bg: 'bg-emerald-500', text: 'Düşük Risk', label: 'Düşük Risk (80-100)' };
      case 'medium':
        return { bg: 'bg-amber-500', text: 'Orta Risk', label: 'Orta Risk (50-79)' };
      case 'high':
        return { bg: 'bg-orange-500', text: 'Yüksek Risk', label: 'Yüksek Risk (20-49)' };
      case 'critical':
        return { bg: 'bg-red-600', text: 'Kritik Risk', label: 'Kritik Risk (0-19)' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <Zap size={24} className="text-indigo-600" />
          Operasyonel Risk Analitikleri
        </h2>
        <p className="text-sm text-slate-600">
          Sistem Risk Önerileri motoru performans metrikleri, kural tetikleme istatistikleri ve risk dağılımı analizi
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Events */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-semibold text-slate-700 text-sm">Analiz Edilen Olaylar</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{analytics.totalEvents}</p>
          <p className="text-xs text-slate-500 mt-2">toplam öneriler (son 500)</p>
        </div>

        {/* Risk Distribution - VeryLow */}
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-6 bg-gradient-to-br from-emerald-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-semibold text-slate-700 text-sm">Düşük Risk</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{distPercent.veryLowPercent}%</p>
          <p className="text-xs text-slate-600 mt-2">
            {analytics.distribution.veryLow} / {analytics.totalEvents}
          </p>
        </div>

        {/* Risk Distribution - Medium */}
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 bg-gradient-to-br from-amber-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-semibold text-slate-700 text-sm">Orta Risk</h3>
          </div>
          <p className="text-3xl font-bold text-amber-700">{distPercent.mediumPercent}%</p>
          <p className="text-xs text-slate-600 mt-2">
            {analytics.distribution.medium} / {analytics.totalEvents}
          </p>
        </div>

        {/* Risk Distribution - High/Critical */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 bg-gradient-to-br from-red-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-semibold text-slate-700 text-sm">Yüksek+Kritik</h3>
          </div>
          <p className="text-3xl font-bold text-red-700">
            {distPercent.highPercent + distPercent.criticalPercent}%
          </p>
          <p className="text-xs text-slate-600 mt-2">
            {analytics.distribution.high + analytics.distribution.critical} / {analytics.totalEvents}
          </p>
        </div>
      </div>

      {/* Risk Distribution Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          Risk Ciddiyet Dağılımı
        </h3>

        <div className="space-y-4">
          {/* VeryLow */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Düşük Risk (80-100)</span>
              <span className="text-sm font-bold text-emerald-700">
                {analytics.distribution.veryLow} ({distPercent.veryLowPercent}%)
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${analytics.totalEvents > 0 ? (analytics.distribution.veryLow / analytics.totalEvents) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Medium */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Orta Risk (50-79)</span>
              <span className="text-sm font-bold text-amber-700">
                {analytics.distribution.medium} ({distPercent.mediumPercent}%)
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{
                  width: `${analytics.totalEvents > 0 ? (analytics.distribution.medium / analytics.totalEvents) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* High */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Yüksek Risk (20-49)</span>
              <span className="text-sm font-bold text-orange-700">
                {analytics.distribution.high} ({distPercent.highPercent}%)
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{
                  width: `${analytics.totalEvents > 0 ? (analytics.distribution.high / analytics.totalEvents) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Critical */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Kritik Risk (0-19)</span>
              <span className="text-sm font-bold text-red-700">
                {analytics.distribution.critical} ({distPercent.criticalPercent}%)
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-300"
                style={{
                  width: `${analytics.totalEvents > 0 ? (analytics.distribution.critical / analytics.totalEvents) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Rules Triggered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-indigo-600" />
            En Sık Tetiklenen Kurallar (Top 5)
          </h3>

          {analytics.ruleStats.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Henüz kural tetiklemesi kaydı bulunmamaktadır</p>
          ) : (
            <div className="space-y-3">
              {analytics.ruleStats.slice(0, 5).map((rule, idx) => (
                <div key={rule.ruleId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{rule.ruleId}</p>
                    <p className="text-xs text-slate-500">Kural ID</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-700">{rule.triggerCount}</p>
                    <p className="text-xs text-slate-500">tetikleme</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Reason Codes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            En Sık Görülen Neden Kodları (Top 5)
          </h3>

          {analytics.topReasonCodes.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Henüz neden kodu kaydı bulunmamaktadır</p>
          ) : (
            <div className="space-y-3">
              {analytics.topReasonCodes.map((reasonCode, idx) => (
                <div key={reasonCode.code} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate font-mono">{reasonCode.code}</p>
                    <p className="text-xs text-slate-500">Neden Kodu</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-700">{reasonCode.count}</p>
                    <p className="text-xs text-slate-500">görülüş</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DEV-ONLY: Raw JSON Inspector */}
      {showDevJson && (
        <details className="bg-slate-950 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
          <summary className="px-6 py-4 bg-slate-900 cursor-pointer font-semibold text-slate-200 hover:bg-slate-800 transition flex items-center gap-2">
            <span>🔧 DEV: Raw Analytics JSON</span>
            <span className="text-xs text-slate-400 font-normal">(Genişlet)</span>
          </summary>
          <div className="p-6 bg-slate-950 overflow-auto max-h-96">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(analytics, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default OperationalRiskDashboard;
