/**
 * Predictive Signals Panel - Phase 8.7
 * 
 * UI component for displaying predictive signals in Vehicle Intelligence Panel.
 * Renders signals with severity levels, scores, and expandable trace information.
 * Standalone component extracted from VehicleIntelligencePanel.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PredictiveSignal } from '../../data-engine/signals/predictiveSignalsEngine';

interface PredictiveSignalsPanelProps {
  signals: PredictiveSignal[];
}

export function PredictiveSignalsPanel({ signals }: PredictiveSignalsPanelProps) {
  const [expandedSignals, setExpandedSignals] = useState<Set<number>>(new Set());

  if (signals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tahmine Dayalı Sinyaller</h3>
        <p className="text-sm text-gray-500">
          Tahmine dayalı sinyal tespit edilmedi
        </p>
      </div>
    );
  }

  const severityStyles = {
    high: 'bg-red-50 border-red-300 text-red-900',
    medium: 'bg-yellow-50 border-yellow-300 text-yellow-900',
    low: 'bg-blue-50 border-blue-300 text-blue-900',
  };

  const severityBadgeStyles = {
    high: 'bg-red-200 text-red-800',
    medium: 'bg-yellow-200 text-yellow-800',
    low: 'bg-blue-200 text-blue-800',
  };

  const severityIcons = {
    high: '🚨',
    medium: '⚠️',
    low: 'ℹ️',
  };

  const severityLabels = {
    high: 'YÜKSEK RİSK',
    medium: 'ORTA RİSK',
    low: 'DÜŞÜK RİSK',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tahmine Dayalı Sinyaller</h3>
      <div className="space-y-3">
        {signals.map((signal, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border ${severityStyles[signal.severity]}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-xl">{severityIcons[signal.severity]}</div>
              <div className="flex-1">
                {/* Signal Header: Title + Score + Severity Badge */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4 className="font-semibold text-sm">{signal.title}</h4>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${severityBadgeStyles[signal.severity]}`}>
                    {severityLabels[signal.severity]}
                  </span>
                  <span className="text-sm font-bold text-gray-700 ml-auto">
                    {Math.round(signal.score)}/100
                  </span>
                </div>

                {/* Signal Summary */}
                <p className="text-sm leading-relaxed mb-2">{signal.summary}</p>

                {/* Signal Rationale */}
                {signal.rationale.length > 0 && (
                  <div className="text-xs text-gray-700 space-y-1 mb-3">
                    {signal.rationale.map((point, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-2">
                        <span className="text-gray-500 flex-shrink-0">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expandable Trace Section - DEV-only detailed calculation info */}
                {signal.trace && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedSignals);
                        if (newExpanded.has(idx)) {
                          newExpanded.delete(idx);
                        } else {
                          newExpanded.add(idx);
                        }
                        setExpandedSignals(newExpanded);
                      }}
                      className="flex items-center gap-1 text-xs font-medium hover:opacity-75 transition-opacity"
                    >
                      {expandedSignals.has(idx) ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          İşlem Detaylarını Gizle
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          İşlem Detaylarını Göster
                        </>
                      )}
                    </button>

                    {expandedSignals.has(idx) && (
                      <div className="mt-3 space-y-3 text-xs bg-black bg-opacity-5 p-3 rounded">
                        {/* Source Fields */}
                        {signal.trace.sourceFields && signal.trace.sourceFields.length > 0 && (
                          <div>
                            <p className="font-bold text-gray-700 mb-1">Kaynak Alanları:</p>
                            <ul className="pl-4 space-y-0.5">
                              {signal.trace.sourceFields.map((field, fIdx) => (
                                <li key={fIdx} className="text-gray-700">
                                  • <code className="bg-gray-200 px-1 py-0.5 rounded">{field}</code>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Raw Values */}
                        {signal.trace.rawValues && Object.keys(signal.trace.rawValues).length > 0 && (
                          <div>
                            <p className="font-bold text-gray-700 mb-1">Ham Değerler:</p>
                            <div className="pl-4 space-y-1">
                              {Object.entries(signal.trace.rawValues).map(([key, value], vIdx) => (
                                <div key={vIdx} className="flex justify-between gap-2 text-gray-700">
                                  <span>{key}:</span>
                                  <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">
                                    {typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)}
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Formula Intermediate Results */}
                        {signal.trace.formulaIntermediate && Object.keys(signal.trace.formulaIntermediate).length > 0 && (
                          <div>
                            <p className="font-bold text-gray-700 mb-1">Formül Adımları:</p>
                            <div className="pl-4 space-y-1">
                              {Object.entries(signal.trace.formulaIntermediate).map(([key, value], vIdx) => (
                                <div key={vIdx} className="flex justify-between gap-2 text-gray-700">
                                  <span>{key}:</span>
                                  <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">
                                    {(value as number).toFixed(2)}
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Score Clamping */}
                        <div>
                          <p className="font-bold text-gray-700 mb-1">Skor Hesaplaması:</p>
                          <div className="pl-4 space-y-1 text-gray-700">
                            <div className="flex justify-between gap-2">
                              <span>Sınırlandırma Öncesi:</span>
                              <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">
                                {signal.trace.scoreBeforeClamp.toFixed(2)}
                              </code>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span>Sınırlandırma Sonrası:</span>
                              <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">
                                {signal.trace.scoreAfterClamp.toFixed(2)}
                              </code>
                            </div>
                          </div>
                        </div>

                        {/* Severity Rule */}
                        <div>
                          <p className="font-bold text-gray-700 mb-1">Ciddiyet Kuralı:</p>
                          <p className="pl-4 text-gray-700 font-mono text-opacity-75">
                            {signal.trace.severityRule}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
