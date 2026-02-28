/**
 * StatusBadge - Display Draft/Final status with styling
 */

import React from 'react';
import type { ReportStatus } from '../types';

interface Props {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const baseClass = 'inline-block rounded-full font-semibold';

  if (status === 'Draft') {
    return (
      <span className={`${baseClass} ${sizeClasses[size]} bg-yellow-100 text-yellow-800`}>
        Taslak
      </span>
    );
  }

  // Final
  return (
    <span className={`${baseClass} ${sizeClasses[size]} bg-green-100 text-green-800`}>
      Kesinleştirildi
    </span>
  );
}
