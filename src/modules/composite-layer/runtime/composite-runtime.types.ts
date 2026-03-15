/**
 * Type system for Composite Runtime Orchestrator
 */

import type { CompositeType } from '../core/composite.enums';
import type { CompositeRecord } from '../core/composite.types';
import type { CompositeInputRef } from '../contracts/composite-input.types';
import type { CompositeInputIndexType } from '../contracts/composite-input.enums';
import type { CompositeInputValidationResult } from '../contracts';
import type { CompositeWeightResult } from '../weighting/composite-weighting.types';
import type {
  CompositePublicationEnvelope,
  CompositeSignalProjection,
} from '../publisher/composite-publisher.types';

/**
 * Index change event that triggers composite execution.
 */
export interface CompositeIndexChangeEvent {
  indexType: CompositeInputIndexType;
  indexId: string;
  vehicleId?: string;
  fleetId?: string;
  occurredAt: string;
}

/**
 * Runtime input set prepared for a specific composite type.
 */
export interface CompositeRuntimeInputSet {
  compositeType: CompositeType;
  inputs: CompositeInputRef[];
  confidence: number;
  vehicleId?: string;
  fleetId?: string;
  evaluationTime: string;
}

/**
 * Single execution unit for a composite type within a runtime execution.
 */
export interface CompositeRuntimeExecutionUnit {
  compositeType: CompositeType;
  validationResult: CompositeInputValidationResult;
  weightingResult?: CompositeWeightResult;
  record?: CompositeRecord;
  publication?: CompositePublicationEnvelope;
  signalPayload?: CompositeSignalProjection;
  executed: boolean;
  skippedReason?: string;
}

/**
 * Complete execution result from runtime orchestration.
 */
export interface CompositeRuntimeExecutionResult {
  event: CompositeIndexChangeEvent;
  affectedCompositeTypes: CompositeType[];
  executionUnits: CompositeRuntimeExecutionUnit[];
  executedAt: string;
}

/**
 * Integration result with processed payloads ready for downstream.
 */
export interface CompositeRuntimeIntegrationResult {
  execution: CompositeRuntimeExecutionResult;
  signalPayloads: CompositeSignalProjection[];
  publications: CompositePublicationEnvelope[];
}
