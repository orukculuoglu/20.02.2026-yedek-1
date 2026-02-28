/**
 * ChecklistSectionAccordion - Collapsible checklist section with item results
 */

import React, { useState } from 'react';
import type { ChecklistSection, ChecklistResult } from '../types';

interface Props {
  section: ChecklistSection;
  isLocked: boolean;
  onItemResultChange?: (itemId: string, result: ChecklistResult) => void;
}

const RESULT_LABELS: Record<ChecklistResult, { label: string; color: string }> = {
  OK: { label: 'Tamam', color: 'bg-green-50 border-green-200' },
  Minor: { label: 'Küçük Sorun', color: 'bg-yellow-50 border-yellow-200' },
  Major: { label: 'Büyük Sorun', color: 'bg-red-50 border-red-200' },
};

const RESULT_BUTTON_COLORS: Record<ChecklistResult, string> = {
  OK: 'bg-green-500 text-white',
  Minor: 'bg-yellow-500 text-white',
  Major: 'bg-red-500 text-white',
};

export function ChecklistSectionAccordion({
  section,
  isLocked,
  onItemResultChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-left"
      >
        <span className="text-gray-900">{section.name}</span>
        <span className="text-gray-600">{isOpen ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="bg-white divide-y">
          {section.items.map(item => {
            const resultInfo = RESULT_LABELS[item.result];
            return (
              <div
                key={item.id}
                className={`p-4 ${resultInfo.color} border-l-4`}
              >
                <div className="flex items-start justify-between mb-2">
                  <label className="font-medium text-gray-900 flex-1">
                    {item.label}
                  </label>
                  {item.weight && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded ml-2">
                      Ağırlık: {item.weight}
                    </span>
                  )}
                </div>

                {/* Result Buttons */}
                <div className="flex gap-2">
                  {(['OK', 'Minor', 'Major'] as const).map(result => (
                    <button
                      key={result}
                      onClick={() => {
                        if (!isLocked && onItemResultChange) {
                          onItemResultChange(item.id, result);
                        }
                      }}
                      disabled={isLocked}
                      className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                        item.result === result
                          ? RESULT_BUTTON_COLORS[result]
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {RESULT_LABELS[result].label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
