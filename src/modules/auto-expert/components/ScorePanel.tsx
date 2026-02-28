/**
 * ScorePanel - Display inspection score and risk flags prominently
 */

import React from 'react';
import type { ExpertReport } from '../types';
import { RiskBadges } from './RiskBadges';

interface Props {
  report: ExpertReport;
}

export function ScorePanel({ report }: Props) {
  const isLocked = report.status === 'Final';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapor Özeti</h3>

      {/* Score Display */}
      <div className="mb-6 text-center">
        <div className="text-6xl font-bold text-blue-600 mb-2">{report.score}</div>
        <div className="text-sm text-gray-600">Genel Skor (100 üzerinden)</div>
      </div>

      {/* Status Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">Durum</div>
          <div className="flex items-center gap-2">
            {isLocked && (
              <>
                <span className="text-xl">🔒</span>
                <span className="text-sm font-semibold text-gray-900">
                  Kesinleştirildi - Kilitli
                </span>
              </>
            )}
            {!isLocked && (
              <>
                <span className="text-xl">✏️</span>
                <span className="text-sm font-semibold text-gray-900">
                  Taslak - Düzenlenebilir
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Risk Flags */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">Risk Uyarıları</div>
        <RiskBadges flags={report.riskFlags} />
      </div>

      {/* Created/Finalized Info */}
      <div className="border-t border-gray-200 pt-4 mt-4 text-xs text-gray-600 space-y-1">
        <div>
          <strong>Oluşturan:</strong> {report.createdBy}
        </div>
        <div>
          <strong>Tarih:</strong> {new Date(report.createdAt).toLocaleString('tr-TR')}
        </div>
        {report.finalizedAt && (
          <div>
            <strong>Kesinleştirilme:</strong>{' '}
            {new Date(report.finalizedAt).toLocaleString('tr-TR')}
          </div>
        )}
      </div>
    </div>
  );
}
