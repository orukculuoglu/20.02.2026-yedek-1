/**
 * Risk Recommendation Card Component
 * Displays structured risk recommendation in a compact format for WorkOrder UI
 */

import React from 'react';
import { AlertCircle, Lightbulb, AlertTriangle, Info } from 'lucide-react';
import type { RiskRecommendation } from '../../../types/RiskRecommendation';

interface RiskRecommendationCardProps {
  recommendation: RiskRecommendation | null;
}

export const RiskRecommendationCard: React.FC<RiskRecommendationCardProps> = ({ recommendation }) => {
  if (!recommendation) {
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

  const priorityInfo = getPriorityInfo(recommendation.priorityScore);
  const PriorityIcon = priorityInfo.icon;

  // Translate action type
  const getActionTypeLabel = (actionType: string): string => {
    switch (actionType) {
      case 'MAINTENANCE_CHECK':
        return 'Bakım Kontrol';
      case 'INSURANCE_REVIEW':
        return 'Sigorta İncelemesi';
      case 'DIAGNOSTIC_CHECK':
        return 'Diyagnostik Kontrol';
      case 'DATA_QUALITY_REVIEW':
        return 'Veri Kalite İncelemesi';
      default:
        return 'Aksiyon Yok';
    }
  };

  return (
    <div className={`border rounded-lg p-3 mt-3 ${priorityInfo.color}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1">
          <PriorityIcon size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900">Sistem Önerisi</h4>
            <p className="text-xs text-slate-700 mt-1">{recommendation.recommendation}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex-shrink-0 ${priorityInfo.badge}`}>
          {recommendation.priorityScore}
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs text-slate-600 ml-6">{recommendation.reason}</p>

      {/* Action Type Badge */}
      <div className="flex items-center gap-2 mt-2 ml-6">
        <span className="text-[10px] font-semibold text-slate-600">Aksiyon:</span>
        <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
          {getActionTypeLabel(recommendation.actionType)}
        </span>
      </div>

      {/* Reason Codes (if any) */}
      {recommendation.reasonCodes && recommendation.reasonCodes.length > 0 && (
        <div className="mt-2 ml-6">
          <p className="text-[10px] font-semibold text-slate-600 mb-1">Tespit Edilen:</p>
          <div className="flex flex-wrap gap-1">
            {recommendation.reasonCodes.slice(0, 3).map((code, idx) => (
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
      {recommendation.explain && recommendation.explain.length > 0 && (
        <div className="mt-2 ml-6">
          <ul className="text-[10px] text-slate-700 space-y-0.5">
            {recommendation.explain.map((item, idx) => (
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
        Oluşturulma: {new Date(recommendation.generatedAt).toLocaleString('tr-TR')}
      </div>
    </div>
  );
};

export default RiskRecommendationCard;
