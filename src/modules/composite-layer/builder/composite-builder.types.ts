/**
 * Type system for composite record builder
 */

import type { CompositeType } from '../core/composite.enums';
import type { CompositeWeightResult } from '../weighting/composite-weighting.types';
import type { CompositeInputRef } from '../contracts/composite-input.types';
import type { CompositeRecord } from '../core/composite.types';

/**
 * Input parameters for building a composite record
 */
export interface CompositeRecordBuildInput {
  /**
   * The composite type to build record for
   */
  compositeType: CompositeType;

  /**
   * Result from weighting calculation
   */
  weightingResult: CompositeWeightResult;

  /**
   * Validated inputs that passed contract checks
   */
  acceptedInputs: CompositeInputRef[];

  /**
   * Confidence score (0.0 - 1.0) for this record
   */
  confidence: number;

  /**
   * Record schema version
   */
  recordVersion: string;

  /**
   * When this record was created (ISO 8601 string)
   */
  createdAt: string;

  /**
   * Vehicle ID (optional context)
   */
  vehicleId?: string;

  /**
   * Fleet ID (optional context)
   */
  fleetId?: string;
}

/**
 * Result of building a composite record
 */
export interface CompositeRecordBuildResult {
  /**
   * The fully formed composite record
   */
  record: CompositeRecord;
}
