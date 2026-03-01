import React from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';
import type { RiskRecommendation } from '../../../types/RiskRecommendation';

interface WorkOrderRiskRecommendationProps {
  recommendation: RiskRecommendation | null;
  vehicleId?: string;
}

export function WorkOrderRiskRecommendation(props: WorkOrderRiskRecommendationProps) {
  const { recommendation, vehicleId } = props;

  if (!recommendation || !vehicleId) {
    return null;
  }

  // Color code based on priority score
  const getColorScheme = (score: number) => {
    if (score >= 70) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800',
        score: 'text-red-700',
        icon: 'text-red-500'
      };
    } else if (score >= 40) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        score: 'text-yellow-700',
        icon: 'text-yellow-500'
      };
    } else {
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800',
        score: 'text-gray-700',
        icon: 'text-gray-500'
      };
    }
  };

  const colors = getColorScheme(recommendation.priorityScore);

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-5 mb-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.badge}`}>
            <Lightbulb className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Sistem Risk Önerisi (Bilgi Amaçlı)</h3>
            <p className="text-xs text-gray-600 mt-1">Otomatik iş emri oluşturmaz</p>
          </div>
        </div>
        <span className={`${colors.badge} px-3 py-1 rounded-full text-sm font-bold`}>
          {recommendation.priorityScore}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Action Type Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 w-24">Aksiyon Tipi:</span>
          <span className={`${colors.badge} px-2 py-1 rounded text-xs font-semibold`}>
            {recommendation.actionType === 'MAINTENANCE_CHECK'
              ? 'Bakım Kontrol'
              : recommendation.actionType === 'INSURANCE_REVIEW'
              ? 'Sigorta İncelemesi'
              : recommendation.actionType === 'DIAGNOSTIC_CHECK'
              ? 'Diyagnostik Kontrol'
              : recommendation.actionType === 'DATA_QUALITY_REVIEW'
              ? 'Veri Kalite İncelemesi'
              : 'Aksiyon Yok'}
          </span>
        </div>

        {/* Recommendation Text */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Öneri:</p>
          <p className="text-sm font-bold text-gray-900">{recommendation.recommendation}</p>
        </div>

        {/* Reason */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Neden:</p>
          <p className="text-xs text-gray-700">{recommendation.reason}</p>
        </div>

        {/* Explain (if available) */}
        {recommendation.explain && recommendation.explain.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Detaylı Açıklama:</p>
            <ul className="space-y-1">
              {recommendation.explain.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.icon}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reason Codes (if available) */}
        {recommendation.reasonCodes && recommendation.reasonCodes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">İlgili Kodlar:</p>
            <div className="flex flex-wrap gap-1">
              {recommendation.reasonCodes.map((code, idx) => (
                <span key={idx} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono">
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Bu öneri karar destek amacıyla sunulmuştur. Final karar mekanikçi/yöneticiye aittir.
          </span>
        </p>
      </div>
    </div>
  );
}
