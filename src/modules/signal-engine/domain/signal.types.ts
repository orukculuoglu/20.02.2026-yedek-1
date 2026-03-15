/**
 * Primary Signal interface for platform
 */

import type { SignalStatus, SignalSeverity, SignalPriority, SignalCategory } from './signal.enums';
import type { SignalAction } from './signal-action.types';

export interface Signal {
  signalId: string;
  avid: string;
  vehicleId?: string;
  signalType: string;
  signalCategory: SignalCategory;

  status: SignalStatus;

  confidence: number;
  severity: SignalSeverity;
  priority: SignalPriority;

  detectedAt: number;
  effectiveAt?: number;
  expiresAt?: number;

  sourceIndexRefs?: string[];
  sourceCompositeRefs?: string[];
  sourceEventRefs?: string[];
  sourceGraphRefs?: string[];

  recommendedActions?: SignalAction[];

  thresholdRefs?: string[];

  context?: Record<string, unknown>;
  trace?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
