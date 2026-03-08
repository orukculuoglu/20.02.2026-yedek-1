/**
 * Vehicle Recommendations Panel
 * Phase 9.7: Display vehicle intelligence recommendations
 *
 * Design:
 * - READ-ONLY: Only reads from snapshot
 * - NO data generation: Displays pre-generated recommendations
 * - NO side effects: Pure UI component
 * - NO modifications: Recommendations are immutable
 *
 * Data source: snapshot.vehicleIntelligenceRecommendations[]
 * Metadata source: snapshot.vehicleIntelligenceSummary.recommendationCount etc.
 *
 * UI Features:
 * - Severity badges with Turkish labels
 * - Max 5 recommendations displayed
 * - Sorted by severity (high, medium, low)
 * - Expandable rationale/explanation
 * - Empty state when no recommendations
 */

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';

interface Recommendation {
  key: string;
  title: string;
  summary: string;
  severity: 'high' | 'medium' | 'low';
  rationale?: string[];
}

interface VehicleRecommendationsPanelProps {
  vehicleId: string;
  recommendations?: Recommendation[];
  metadata?: {
    recommendationCount?: number;
    highSeverityRecommendationCount?: number;
    lastRecommendationsUpdatedAt?: string;
  };
}

/**
 * Severity badge component
 */
function SeverityBadge({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  const config = {
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      badge: 'bg-red-600',
      label: 'KRİTİK',
    },
    medium: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      badge: 'bg-amber-600',
      label: 'ORTA',
    },
    low: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      badge: 'bg-blue-600',
      label: 'DÜŞÜK',
    },
  };

  const c = config[severity];
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.badge} mr-2`}></span>
      {c.label}
    </span>
  );
}

/**
 * Recommendation card component
 */
function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition bg-white">
      <div className="flex items-start gap-3">
        {/* Severity Badge */}
        <div className="flex-shrink-0">
          <SeverityBadge severity={recommendation.severity} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm md:text-base break-words">
            {recommendation.title}
          </h4>
          <p className="text-gray-600 text-sm mt-1 break-words">{recommendation.summary}</p>

          {/* Rationale Expandable */}
          {recommendation.rationale && recommendation.rationale.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {isExpanded ? 'Detayları Gizle' : 'Detayları Göster'}
              </button>

              {isExpanded && (
                <div className="mt-2 bg-gray-50 rounded p-3 text-xs text-gray-700 space-y-1">
                  {recommendation.rationale.map((reason, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Vehicle Recommendations Panel
 * Displays generated recommendations for vehicle intelligence analysis
 */
export function VehicleRecommendationsPanel({
  vehicleId,
  recommendations = [],
  metadata,
}: VehicleRecommendationsPanelProps) {
  // Sort recommendations by severity (high -> medium -> low)
  const sortedRecommendations = useMemo(() => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return [...recommendations].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );
  }, [recommendations]);

  // Show max 5 recommendations
  const visibleRecommendations = sortedRecommendations.slice(0, 5);

  // Empty state
  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Info size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800">💡 Araç Zekası Önerileri</h3>
        </div>
        <p className="text-gray-500 text-sm">Araç için öneri bulunamadı.</p>
        {metadata?.lastRecommendationsUpdatedAt && (
          <p className="text-xs text-gray-400 mt-3">
            Son güncellenme: {new Date(metadata.lastRecommendationsUpdatedAt).toLocaleString('tr-TR')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header with metadata */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="text-lg font-semibold text-gray-800">Araç Zekası Önerileri</h3>
          </div>
          {metadata?.recommendationCount !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {metadata.recommendationCount} toplam
            </span>
          )}
        </div>

        {metadata?.highSeverityRecommendationCount! > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {metadata.highSeverityRecommendationCount} KRİTİK
            </span>
          </div>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className="space-y-3">
        {visibleRecommendations.map((rec) => (
          <RecommendationCard key={rec.key} recommendation={rec} />
        ))}
      </div>

      {/* "More" indicator */}
      {recommendations.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            +{recommendations.length - 5} daha fazla öneri bulunmaktadır.
          </p>
        </div>
      )}

      {/* Last updated timestamp */}
      {metadata?.lastRecommendationsUpdatedAt && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Son güncellenme: {new Date(metadata.lastRecommendationsUpdatedAt).toLocaleString('tr-TR')}
          </p>
        </div>
      )}
    </div>
  );
}
