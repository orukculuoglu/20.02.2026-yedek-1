/**
 * Risk Recommendation Card Component
 * Displays structured risk recommendations in a compact format for WorkOrder UI
 * Supports both single recommendation (backward compatible) and recommendation array
 */

import React from 'react';
import { AlertCircle, Lightbulb, AlertTriangle, Info } from 'lucide-react';
import type { RiskRecommendation } from '../../../types/RiskRecommendation';
import { sanitizeMeta } from '../../../modules/data-engine/utils/sanitizeMeta';

interface RiskRecommendationCardProps {
  // New unified interface: support array of recommendations
  recommendations?: RiskRecommendation[];
  // Backward compatible: single recommendation support
  recommendation?: RiskRecommendation | null;
  // Optional confidence score (0-100)
  confidence?: number;
}

export const RiskRecommendationCard: React.FC<RiskRecommendationCardProps> = ({
  recommendations,
  recommendation,
  confidence
}) => {
  // Normalize input: prefer array, fall back to single
  const items = recommendations?.length
    ? recommendations
    : recommendation
    ? [recommendation]
    : [];

  // DEV-only verification logging (PII-safe: no VIN/plate)
  if (import.meta.env.DEV && items.length > 0) {
    console.log('[RiskRecommendationCard] Trace verification:', {
      itemsCount: items.length,
      trace: items.map((item, idx) => ({
        idx,
        action: item.actionType,
        source: item.generatedFrom?.source,
        hasTime: !!item.generatedFrom?.eventTime,
        hasEventId: !!item.generatedFrom?.eventId,
      })),
    });
  }

  // Empty state message
  if (items.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic mt-2">
        Sistem önerisi üretmek için yeterli risk verisi yok.
      </div>
    );
  }

  // Priority color scheme
  const getPriorityInfo = (score: number) => {
    if (score >= 80) {
      return {
        level: 'HIGH',
        color: 'bg-red-50 border-red-200',
        badge: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
      };
    } else if (score >= 50) {
      return {
        level: 'MEDIUM',
        color: 'bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      };
    } else {
      return {
        level: 'LOW',
        color: 'bg-blue-50 border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        icon: Info,
      };
    }
  };

  // Translate action type
  const getActionTypeLabel = (actionType: string): string => {
    switch (actionType) {
      case 'MAINTENANCE_CHECK':
        return 'Bakım Kontrol';
      case 'INSURANCE_REVIEW':
        return 'Sigorta İncelemesi';
      case 'DIAGNOSTIC_CHECK':
        return 'Diyagnostik Kontrol';
      case 'MECHANICAL_DIAG':
        return 'Mekanik Kontrol';
      case 'DATA_QUALITY_REVIEW':
        return 'Veri Kalite İncelemesi';
      case 'RISK_ASSESSMENT':
        return 'Risk Değerlendirmesi';
      default:
        return 'Aksiyon Yok';
    }
  };

  // Render single recommendation card
  const renderCard = (rec: RiskRecommendation) => {
    const priorityInfo = getPriorityInfo(rec.priorityScore);
    const PriorityIcon = priorityInfo.icon;

    return (
      <div key={rec.generatedAt} className={`border rounded-lg p-3 mt-3 ${priorityInfo.color}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 flex-1">
            <PriorityIcon size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900">Sistem Önerisi</h4>
              <p className="text-xs text-slate-700 mt-1">{rec.recommendation}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex-shrink-0 ${priorityInfo.badge}`}>
            {rec.priorityScore}
          </div>
        </div>

        {/* Reason */}
        <p className="text-xs text-slate-600 ml-6">{rec.reason}</p>

        {/* Action Type Badge */}
        <div className="flex items-center gap-2 mt-2 ml-6">
          <span className="text-[10px] font-semibold text-slate-600">Aksiyon:</span>
          <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
            {getActionTypeLabel(rec.actionType)}
          </span>
        </div>

        {/* Reason Codes (if any) */}
        {rec.reasonCodes && rec.reasonCodes.length > 0 && (
          <div className="mt-2 ml-6">
            <p className="text-[10px] font-semibold text-slate-600 mb-1">Tespit Edilen:</p>
            <div className="flex flex-wrap gap-1">
              {rec.reasonCodes.slice(0, 3).map((code, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded text-white ${
                    code.severity === 'high'
                      ? 'bg-red-600'
                      : code.severity === 'warn'
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {code.code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Explain (if available) */}
        {rec.explain && rec.explain.length > 0 && (
          <div className="mt-2 ml-6">
            <ul className="text-[10px] text-slate-700 space-y-0.5">
              {rec.explain.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timestamp (audit trail) */}
        <div className="mt-2 text-[10px] text-slate-500 ml-6 border-t border-current border-opacity-10 pt-1.5">
          Oluşturulma: {new Date(rec.generatedAt).toLocaleString('tr-TR')}
        </div>

        {/* Source Attribution - Always show if generatedFrom exists */}
        {rec.generatedFrom && (
          <div className="mt-1 text-[10px] text-slate-500 ml-6">
            Kaynak: {rec.generatedFrom.source || "Bilinmiyor"}
            {rec.generatedFrom.eventTime && (
              <> • {new Date(rec.generatedFrom.eventTime).toLocaleTimeString('tr-TR')}</>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Low confidence warning (optional) */}
      {confidence !== undefined && confidence < 40 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2 flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">Veri güveni düşük, öneriler temkinlidir.</p>
        </div>
      )}

      {/* Render up to 3 recommendation cards */}
      {items.slice(0, 3).map(rec => renderCard(rec))}

      {/* DEV-only Debug Panel (Sanitized) */}
      {import.meta.env.DEV && items.length > 0 && (
        <details className="mt-3 border border-slate-300 rounded-lg">
          <summary className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">
            🔍 Debug: Sanitized Recommendation Data
          </summary>
          <div className="p-3 bg-slate-50 overflow-auto max-h-60">
            <pre className="text-[10px] font-mono whitespace-pre-wrap break-words text-slate-700">
              {JSON.stringify(sanitizeMeta({ recommendations: items, confidence }), null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default RiskRecommendationCard;
