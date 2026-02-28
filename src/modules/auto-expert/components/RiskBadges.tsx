/**
 * RiskBadges - Display risk flags with colors
 */

import React from 'react';
import type { RiskFlag } from '../types';

interface Props {
  flags: RiskFlag[];
}

const RISK_LABELS: Record<RiskFlag, { label: string; color: string }> = {
  StructuralRisk: {
    label: 'Yapısal Risk',
    color: 'bg-red-100 text-red-800',
  },
  MechanicalRisk: {
    label: 'Mekanik Risk',
    color: 'bg-orange-100 text-orange-800',
  },
  AirbagRisk: {
    label: 'Airbag/Güvenlik Risk',
    color: 'bg-purple-100 text-purple-800',
  },
};

export function RiskBadges({ flags }: Props) {
  if (!flags || flags.length === 0) {
    return <span className="text-gray-500">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {flags.map(flag => {
        const info = RISK_LABELS[flag];
        return (
          <span
            key={flag}
            className={`px-2 py-1 rounded text-xs font-semibold ${info.color}`}
          >
            {info.label}
          </span>
        );
      })}
    </div>
  );
}
