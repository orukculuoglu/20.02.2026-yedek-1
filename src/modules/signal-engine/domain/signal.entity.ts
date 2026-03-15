/**
 * Signal entity factory for deterministic Signal construction
 */

import type { Signal } from './signal.types';
import type { SignalAction } from './signal-action.types';
import { SignalStatus, SignalSeverity, SignalPriority, SignalCategory } from './signal.enums';
import { getDefaultPriorityForSeverity } from '../registry/signal-priority.registry';

export interface CreateSignalInput {
  signalId: string;
  avid: string;
  vehicleId?: string;
  signalType: string;
  signalCategory: SignalCategory;
  severity: SignalSeverity;
  priority?: SignalPriority;
  confidence: number;
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

export interface UpdateSignalStatusInput {
  signal: Signal;
  newStatus: SignalStatus;
  updatedAt?: number;
}

export class SignalEntity {
  static createSignal(input: CreateSignalInput): Signal {
    const now = Date.now();

    return {
      signalId: input.signalId,
      avid: input.avid,
      vehicleId: input.vehicleId,
      signalType: input.signalType,
      signalCategory: input.signalCategory,

      status: SignalStatus.ACTIVE,

      confidence: Math.max(0, Math.min(1, input.confidence)),
      severity: input.severity,
      priority: input.priority ?? getDefaultPriorityForSeverity(input.severity),

      detectedAt: input.detectedAt,
      effectiveAt: input.effectiveAt ?? now,
      expiresAt: input.expiresAt,

      sourceIndexRefs: input.sourceIndexRefs,
      sourceCompositeRefs: input.sourceCompositeRefs,
      sourceEventRefs: input.sourceEventRefs,
      sourceGraphRefs: input.sourceGraphRefs,

      recommendedActions: input.recommendedActions,

      thresholdRefs: input.thresholdRefs,

      context: input.context,
      trace: input.trace,
      metadata: input.metadata,
    };
  }

  static updateSignalStatus(input: UpdateSignalStatusInput): Signal {
    return {
      ...input.signal,
      status: input.newStatus,
    };
  }
}
