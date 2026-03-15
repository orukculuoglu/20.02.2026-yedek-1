/**
 * Signal threshold model types for rule engine
 */

import type { SignalSeverity, SignalPriority } from './signal.enums';

export interface SignalThreshold {
  thresholdId: string;
  metric: string;
  operator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'NEQ' | 'IN' | 'NOT_IN';
  value: number | string | (number | string)[];
  severityImpact: SignalSeverity;
  priorityImpact: SignalPriority;
}
