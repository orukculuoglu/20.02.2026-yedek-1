/**
 * Type system for composite input contracts
 * Defines runtime contract structure, validation, and result models
 */

import { CompositeType } from '../core/composite.enums';
import {
  CompositeInputIndexType,
  CompositeInputRequirement,
  CompositeInputEligibilityStatus,
  CompositeValidityPolicy,
} from './composite-input.enums';

/**
 * Reference to a base index that serves as composite input
 * Carries full measurement context from source index
 */
export interface CompositeInputRef {
  /**
   * Type of the source index
   */
  indexType: CompositeInputIndexType;

  /**
   * Unique identifier of the source index record
   */
  indexId: string;

  /**
   * Score from the source index (0.0 - 1.0)
   */
  score: number;

  /**
   * Confidence level in the source index (0.0 - 1.0)
   */
  confidence: number;

  /**
   * ISO 8601 timestamp when source index was created
   */
  createdAt: string;

  /**
   * ISO 8601 timestamp when this input becomes valid (optional)
   */
  validFrom?: string;

  /**
   * ISO 8601 timestamp when this input expires (optional)
   */
  validTo?: string;

  /**
   * Vehicle being measured (if applicable)
   */
  sourceVehicleId?: string;

  /**
   * Fleet being measured (if applicable)
   */
  sourceFleetId?: string;
}

/**
 * Definition of an input slot required by a composite
 * Declares which index type, at what requirement level, with what constraints
 */
export interface CompositeInputSlotDefinition {
  /**
   * Unique key for this slot within the contract
   * Example: "reliability", "maintenance", "dataQuality"
   */
  slotKey: string;

  /**
   * The index type allowed for this slot
   */
  allowedIndexType: CompositeInputIndexType;

  /**
   * Whether this input is required or optional
   */
  requirement: CompositeInputRequirement;

  /**
   * Minimum confidence threshold (optional)
   * If present, input must satisfy: input.confidence >= minimumConfidence
   */
  minimumConfidence?: number;

  /**
   * How strictly to enforce validity windows
   */
  validityPolicy: CompositeValidityPolicy;

  /**
   * Human-readable description of this slot's purpose
   */
  description?: string;
}

/**
 * Contract definition for a composite type
 * Defines which inputs are allowed and required
 */
export interface CompositeInputContractDefinition {
  /**
   * The composite type this contract is for
   */
  compositeType: CompositeType;

  /**
   * Array of input slot definitions
   */
  slots: CompositeInputSlotDefinition[];

  /**
   * Minimum number of inputs required to proceed (after validation)
   * Must be <= number of REQUIRED slots
   */
  minimumRequiredInputs: number;

  /**
   * Human-readable description of this contract
   */
  description?: string;

  /**
   * Version of this contract (for schema evolution)
   */
  version: string;
}

/**
 * Validation result for a single input slot
 */
export interface CompositeInputSlotValidation {
  /**
   * Key of the slot being validated
   */
  slotKey: string;

  /**
   * Index type expected by this slot
   */
  expectedIndexType: CompositeInputIndexType;

  /**
   * Requirement level of this slot
   */
  requirement: CompositeInputRequirement;

  /**
   * Eligibility status after validation
   */
  status: CompositeInputEligibilityStatus;

  /**
   * If accepted, the input that was selected for this slot
   */
  providedInput?: CompositeInputRef;

  /**
   * Explanation of the validation result (for debugging)
   */
  reason?: string;
}

/**
 * Complete validation result for composite inputs
 * Output of the validation function
 */
export interface CompositeInputValidationResult {
  /**
   * The composite type that was validated against
   */
  compositeType: CompositeType;

  /**
   * Version of the contract used
   */
  contractVersion: string;

  /**
   * Whether the composite can proceed (all required slots satisfied + minimum met)
   */
  eligible: boolean;

  /**
   * Total number of slots in the contract
   */
  totalSlots: number;

  /**
   * Number of required slots that were satisfied
   */
  satisfiedRequiredSlots: number;

  /**
   * Number of required slots that were not satisfied
   */
  missingRequiredSlots: number;

  /**
   * Number of optional slots that provided inputs
   */
  optionalSlotsProvided: number;

  /**
   * Validation details for each slot
   */
  validationItems: CompositeInputSlotValidation[];

  /**
   * Accepted inputs (one per satisfied slot)
   */
  acceptedInputs: CompositeInputRef[];

  /**
   * Inputs that were rejected or not used
   */
  rejectedInputs: CompositeInputRef[];

  /**
   * ISO 8601 timestamp when validation was performed
   */
  generatedAt: string;
}

/**
 * Context for validation evaluation
 * Provides the reference time for validity window checking
 */
export interface CompositeInputValidationContext {
  /**
   * ISO 8601 timestamp when validation is being evaluated
   * Used as reference point for validity window checks
   */
  evaluationTime: string;
}
