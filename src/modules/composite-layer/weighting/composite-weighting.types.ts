/**
 * Type system for composite weighting model
 */

import { CompositeType } from '../core/composite.enums';

/**
 * Definition of weight for a single slot
 * Weights are normalized 0.0-1.0 values that sum to 1.0 across all slots in a profile
 */
export interface CompositeWeightDefinition {
  /**
   * Slot key from the input contract
   */
  slotKey: string;

  /**
   * Weight assigned to this slot (0.0 - 1.0)
   */
  weight: number;
}

/**
 * Complete weighting profile for a composite type
 * Defines how validated inputs are combined into a composite score
 */
export interface CompositeWeightProfile {
  /**
   * The composite type this profile is for
   */
  compositeType: CompositeType;

  /**
   * Array of weight definitions
   */
  weights: CompositeWeightDefinition[];

  /**
   * Version of this profile (for schema evolution)
   */
  version: string;
}

/**
 * Contribution of a single input to the final composite score
 * Tracks how each input weight was applied
 */
export interface CompositeWeightContribution {
  /**
   * Slot key that provided this input
   */
  slotKey: string;

  /**
   * Index ID of the input
   */
  inputIndexId: string;

  /**
   * Score from the input
   */
  inputScore: number;

  /**
   * Weight applied to this input (after normalization adjustments)
   */
  weightApplied: number;

  /**
   * Weighted score contribution (inputScore × weightApplied)
   */
  weightedScore: number;
}

/**
 * Result of composite weighting calculation
 * Contains the final normalized score and breakdown of contributions
 */
export interface CompositeWeightResult {
  /**
   * The composite type
   */
  compositeType: CompositeType;

  /**
   * Final normalized composite score (0.0 - 1.0)
   */
  normalizedScore: number;

  /**
   * Contribution breakdown for each input
   */
  contributions: CompositeWeightContribution[];

  /**
   * Total weight used in calculation (always 1.0 after normalization)
   */
  totalWeightUsed: number;

  /**
   * Version of the weighting model used
   */
  version: string;
}
