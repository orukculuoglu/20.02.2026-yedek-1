/**
 * Oto Ekspertiz Dashboard - Data Exchange Summary
 * Tracks inbound reports, processing health, and outbound risk sync updates
 * Time Window: Last 7 days
 */

import React, { useMemo, useEffect } from 'react';
import type { ExpertReport } from '../types';
import { reportStore } from '../store';
import { auditStore } from '../audit';
import { vehicleStore } from '../vehicle/vehicleStore';

interface OtoEkspertizDashboardProps {
  onViewReports: () => void;
  onViewDetail: (reportId: string) => void;
  onViewVehicleIntelligence?: () => void;
}

// Helper: Parse ISO date safely
function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

// Helper: Calculate time window boundaries
function getTimeWindows() {
  const now = new Date();
  const day24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const day7dAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { now, day24hAgo, day7dAgo };
}

// Helper: Check if date is within window
function isInWindow(dateStr: string | undefined, minDate: Date): boolean {
  if (!dateStr) return false;
  const d = parseDate(dateStr);
  return d ? d >= minDate : false;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

function KpiCard({ label, value, subtitle, color = 'blue' }: KpiCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="text-sm font-semibold text-gray-600 mb-2">{label}</div>
      <div className={`text-4xl font-bold mb-1`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  count: number;
  maxCount: number;
}

function ScoreBar({ label, count, maxCount }: ScoreBarProps) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface RecentReportRowProps {
  report: ExpertReport;
  onNavigate: (reportId: string) => void;
}

function RecentReportRow({ report, onNavigate }: RecentReportRowProps) {
  const finalizedDate = report.finalizedAt ? new Date(report.finalizedAt).toLocaleDateString('tr-TR') : 'N/A';
  const riskFlagCount = report.riskFlags?.length || 0;

  return (
    <div
      onClick={() => onNavigate(report.id)}
      className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{report.plate}</div>
          <div className="text-xs text-gray-500">VIN: {report.vin.slice(0, 4)}...{report.vin.slice(-4)}</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{report.score}</div>
          <div className="text-xs text-gray-500">Puan</div>
        </div>

        <div className="text-center min-w-20">
          <div className={`text-lg font-bold ${riskFlagCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {riskFlagCount}
          </div>
          <div className="text-xs text-gray-500">Risk Flag</div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-900">{finalizedDate}</div>
        </div>
      </div>
    </div>
  );
}

export function OtoEkspertizDashboard({ onViewReports, onViewDetail, onViewVehicleIntelligence }: OtoEkspertizDashboardProps) {
  // Debug: Log mount
  useEffect(() => {
    console.log('[Dashboard] ✓ OtoEkspertizDashboard mounted (Data Exchange Summary)');
  }, []);

  // Load data with error handling
  const allReports = useMemo(() => {
    try {
      const reports = reportStore.loadAll();
      console.log('[Dashboard] Loaded reports:', reports.length);
      return reports;
    } catch (err) {
      console.error('[Dashboard] Failed to load reports:', err);
      return [];
    }
  }, []);

  const allAudits = useMemo(() => {
    try {
      const audits = auditStore.loadAll();
      console.log('[Dashboard] Loaded audits:', audits.length);
      return audits;
    } catch (err) {
      console.error('[Dashboard] Failed to load audits:', err);
      return [];
    }
  }, []);

  const allVehicles = useMemo(() => {
    try {
      const vehicles = vehicleStore.loadAll();
      console.log('[Dashboard] Loaded vehicles:', vehicles.length);
      return vehicles;
    } catch (err) {
      console.error('[Dashboard] Failed to load vehicles:', err);
      return [];
    }
  }, []);

  // Calculate time windows
  const { day24hAgo, day7dAgo } = useMemo(() => getTimeWindows(), []);

  // ====================
  // KPI 1: Inbound Reports (7d)
  // ====================
  const inbound7d = useMemo(() => {
    return allReports.filter(r => isInWindow(r.createdAt, day7dAgo)).length;
  }, [allReports, day7dAgo]);

  // ====================
  // KPI 2: Finalization Rate (7d)
  // ====================
  const finalized7d = useMemo(() => {
    return allReports.filter(
      r => r.status === 'Final' && isInWindow(r.finalizedAt, day7dAgo)
    ).length;
  }, [allReports, day7dAgo]);

  const finalizationRate = useMemo(() => {
    return inbound7d > 0 ? Math.round((finalized7d / inbound7d) * 100) : 0;
  }, [finalized7d, inbound7d]);

  // ====================
  // KPI 3 & 4: Risk Sync Metrics (7d)
  // ====================
  const riskSyncMetrics = useMemo(() => {
    const success7d = allAudits.filter(
      a => a.action === 'RISK_SYNC' && isInWindow(a.at, day7dAgo)
    ).length;
    const failed7d = allAudits.filter(
      a => a.action === 'RISK_SYNC_FAILED' && isInWindow(a.at, day7dAgo)
    ).length;
    const total = success7d + failed7d;
    const syncRate = total > 0 ? Math.round((success7d / total) * 100) : 0;

    const failed24h = allAudits.filter(
      a => a.action === 'RISK_SYNC_FAILED' && isInWindow(a.at, day24hAgo)
    ).length;

    return { success7d, failed7d, syncRate, failed24h };
  }, [allAudits, day7dAgo, day24hAgo]);

  // ====================
  // Score Distribution (Final, 7d)
  // ====================
  const scoreDistribution = useMemo(() => {
    const finalized = allReports.filter(
      r => r.status === 'Final' && isInWindow(r.finalizedAt, day7dAgo)
    );
    const b0_60 = finalized.filter(r => r.score <= 60).length;
    const b61_80 = finalized.filter(r => r.score >= 61 && r.score <= 80).length;
    const b81_100 = finalized.filter(r => r.score >= 81).length;
    const maxBucket = Math.max(b0_60, b61_80, b81_100, 1);
    return { b0_60, b61_80, b81_100, maxBucket };
  }, [allReports, day7dAgo]);

  // ====================
  // Top Risk Reasons (Final, 7d)
  // ====================
  const topRiskReasons = useMemo(() => {
    const finalized = allReports.filter(
      r => r.status === 'Final' && isInWindow(r.finalizedAt, day7dAgo)
    );
    const riskCounts = {
      Structural: 0,
      Airbag: 0,
      Mechanical: 0,
    };
    finalized.forEach(report => {
      report.riskFlags?.forEach(flag => {
        if (flag.includes('Structural')) riskCounts.Structural++;
        else if (flag.includes('Airbag')) riskCounts.Airbag++;
        else if (flag.includes('Mechanical')) riskCounts.Mechanical++;
      });
    });
    return riskCounts;
  }, [allReports, day7dAgo]);

  // ====================
  // Average Sync Latency (mock)
  // ====================
  const avgSyncLatency = useMemo(() => {
    // Mock latency - in real implementation would use report.finalizedAt vs audit.at
    return '~1.2s';
  }, []);

  // ====================
  // Recent Final Reports (top 5, 7d)
  // ====================
  const recentFinalReports = useMemo(() => {
    return allReports
      .filter(r => r.status === 'Final' && isInWindow(r.finalizedAt, day7dAgo))
      .sort((a, b) => {
        const dateA = parseDate(a.finalizedAt) || new Date(0);
        const dateB = parseDate(b.finalizedAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [allReports, day7dAgo]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Veri Alışverişi Özeti
            </h1>
            <p className="text-gray-600">
              Son 7 gün: İçeri Akışı, İşleme Durumu, Dışarı Akışı (Risk Sync Updates)
            </p>
          </div>
          {onViewVehicleIntelligence && (
            <button
              onClick={onViewVehicleIntelligence}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium whitespace-nowrap"
            >
              🧠 Araç Zekası
            </button>
          )}
        </div>

        {/* ROW 1: Top 4 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            label="İçeri Akışı (7g)"
            value={inbound7d}
            subtitle="Gelen raporlar"
            color="blue"
          />
          <KpiCard
            label="Kesinleştirme Oranı"
            value={`${finalizationRate}%`}
            subtitle={`${finalized7d}/${inbound7d}`}
            color="green"
          />
          <KpiCard
            label="Risk Sync Başarısı"
            value={`${riskSyncMetrics.syncRate}%`}
            subtitle={`${riskSyncMetrics.success7d}/${riskSyncMetrics.success7d + riskSyncMetrics.failed7d}`}
            color="purple"
          />
          <KpiCard
            label="Dışarı Akışı (7g)"
            value={riskSyncMetrics.success7d}
            subtitle="Gönderilen güncellemeler"
            color="green"
          />
        </div>

        {/* ROW 2: Processing Health + Top Risk Reasons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Processing Health */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              İşleme Durumu
            </h2>

            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-100">
                <div className="text-sm text-gray-600 mb-1">Ort. Sync Gecikme</div>
                <div className="text-2xl font-bold text-gray-900">{avgSyncLatency}</div>
                <div className="text-xs text-gray-500 mt-1">(simülasyon)</div>
              </div>

              <div className="pb-4 border-b border-gray-100">
                <div className="text-sm text-gray-600 mb-1">Sync Hatası (24h)</div>
                <div className={`text-2xl font-bold ${riskSyncMetrics.failed24h > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {riskSyncMetrics.failed24h}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Durum</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  riskSyncMetrics.syncRate >= 95
                    ? 'bg-green-100 text-green-700'
                    : riskSyncMetrics.syncRate >= 80
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {riskSyncMetrics.syncRate >= 95 ? '✓ İyi' : riskSyncMetrics.syncRate >= 80 ? '⚠ Uyarı' : '✗ Kritik'}
                </div>
              </div>
            </div>
          </div>

          {/* Top Risk Reasons */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Başlıca Risk Nedenleri (7g Kesinleştirilmiş)
            </h2>

            {Object.entries(topRiskReasons).reduce((sum, [, v]) => sum + v, 0) === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz risk bayrağı bulunmamaktadır
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Yapısal Risk</span>
                  <span className="text-lg font-bold text-gray-900">{topRiskReasons.Structural}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Hava Yastığı Risk</span>
                  <span className="text-lg font-bold text-gray-900">{topRiskReasons.Airbag}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Mekanik Risk</span>
                  <span className="text-lg font-bold text-gray-900">{topRiskReasons.Mechanical}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: Score Distribution + Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Puan Dağılımı (7g Kesinleştirilmiş)
            </h2>

            {finalized7d === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Son 7 gün içinde kesinleştirilmiş rapor bulunmamaktadır
              </div>
            ) : (
              <div>
                <ScoreBar
                  label="0-60 (Düşük)"
                  count={scoreDistribution.b0_60}
                  maxCount={scoreDistribution.maxBucket}
                />
                <ScoreBar
                  label="61-80 (Orta)"
                  count={scoreDistribution.b61_80}
                  maxCount={scoreDistribution.maxBucket}
                />
                <ScoreBar
                  label="81-100 (Yüksek)"
                  count={scoreDistribution.b81_100}
                  maxCount={scoreDistribution.maxBucket}
                />
              </div>
            )}
          </div>

          {/* Recent Final Reports */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Son Kesinleştirilmiş Raporlar (7g)
              </h2>
            </div>

            <div>
              {recentFinalReports.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Son 7 gün içinde kesinleştirilmiş rapor bulunmamaktadır
                </div>
              ) : (
                recentFinalReports.map(report => (
                  <RecentReportRow
                    key={report.id}
                    report={report}
                    onNavigate={onViewDetail}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
