/**
 * Recommendations Card Component
 * Displays structured risk recommendations in a clean, organized manner
 * Used by Oto Ekspertiz (ExpertiseCenters) dashboard
 */

import React, { useState } from 'react';
import { AlertCircle, ChevronDown, Lightbulb, AlertTriangle, Info } from 'lucide-react';
import type { RiskRecommendation } from '../../../types/RiskRecommendation';

interface RecommendationsCardProps {
  recommendations: RiskRecommendation[];
  title?: string;
}

export function RecommendationsCard(props: RecommendationsCardProps) {
  const { recommendations, title = 'Sistem Önerileri' } = props;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center p-8 text-slate-500">
          <p className="text-sm">Mevcut veriler için öneri bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  // Get priority color class
  const getPriorityColor = (score: number) => {
    if (score >= 75) return 'bg-red-50 border-red-100';
    if (score >= 50) return 'bg-amber-50 border-amber-100';
    return 'bg-blue-50 border-blue-100';
  };

  // Get priority badge color
  const getPriorityBadgeColor = (score: number) => {
    if (score >= 75) return 'bg-red-100 text-red-800';
    if (score >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Get icon for action type
  const getActionIcon = () => <Lightbulb size={20} />;

  // Get severity icon
  const getSeverityIcon = (score: number) => {
    if (score >= 75) return <AlertTriangle size={18} className="text-red-600" />;
    if (score >= 50) return <AlertCircle size={18} className="text-amber-600" />;
    return <Info size={18} className="text-blue-600" />;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Lightbulb size={20} className="text-indigo-600" />
        {title}
      </h3>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`border rounded-xl overflow-hidden transition-all ${getPriorityColor(rec.priorityScore)}`}
          >
            {/* Header - Always visible */}
            <button
              onClick={() =>
                setExpandedId(expandedId === rec.id ? null : rec.id)
              }
              className="w-full p-4 flex items-start justify-between hover:bg-white/50 transition-colors text-left"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getSeverityIcon(rec.priorityScore)}</div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">
                    {rec.recommendation}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-3">
                <div
                  className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getPriorityBadgeColor(rec.priorityScore)}`}
                >
                  P: {rec.priorityScore}
                </div>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${
                    expandedId === rec.id ? 'transform rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Expanded content */}
            {expandedId === rec.id && (
              <div className="border-t border-current/10 p-4 bg-white/30 space-y-3">
                {/* Action Type */}
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    Aksiyon Tipi:
                  </p>
                  <div className="flex items-center gap-2">
                    {getActionIcon()}
                    <span className="text-sm font-mono text-slate-700">
                      {rec.actionType === 'MAINTENANCE_CHECK'
                        ? 'Bakım Kontrol'
                        : rec.actionType === 'INSURANCE_REVIEW'
                        ? 'Sigorta İncelemesi'
                        : rec.actionType === 'DIAGNOSTIC_CHECK'
                        ? 'Diyagnostik Kontrol'
                        : rec.actionType === 'DATA_QUALITY_REVIEW'
                        ? 'Veri Kalite İncelemesi'
                        : 'Aksiyon Yok'}
                    </span>
                  </div>
                </div>

                {/* Reason Codes */}
                {rec.reasonCodes && rec.reasonCodes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Tespit Edilen Sorunlar:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rec.reasonCodes.map((code, idx) => (
                        <div
                          key={idx}
                          className={`px-2 py-1 rounded text-xs font-mono border flex items-center gap-1 ${
                            code.severity === 'high'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : code.severity === 'warn'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full" />
                          {code.code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Explanation */}
                {rec.explain && rec.explain.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Detaylı Açıklama:
                    </p>
                    <ul className="space-y-1">
                      {rec.explain.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 flex items-start gap-2"
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Generated timestamp */}
                <div className="pt-2 border-t border-current/5">
                  <p className="text-[10px] text-slate-500">
                    Oluşturulma: {new Date(rec.generatedAt).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
        <Info size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-600">
          Öneriler, mevcut veri ve risk endeksleri analiz edilerek otomatik olarak oluşturulmuştur. Son karar mekanikçi ve yöneticiye aittir.
        </p>
      </div>
    </div>
  );
}
