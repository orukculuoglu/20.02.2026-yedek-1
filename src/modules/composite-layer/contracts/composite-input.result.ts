/**
 * Helper factories for creating validation result objects
 * Deterministic result construction without hidden logic
 */

import { CompositeType } from '../core/composite.enums';
import type {
  CompositeInputValidationResult,
  CompositeInputSlotValidation,
  CompositeInputRef,
} from './composite-input.types';
import { CompositeInputEligibilityStatus, CompositeInputRequirement, CompositeInputIndexType } from './composite-input.enums';

/**
 * Create an empty composite input validation result
 * Base object before evaluation begins
 *
 * @param compositeType - The composite type being validated
 * @param contractVersion - Version of the contract used
 * @param totalSlots - Total number of slots in the contract
 * @param generatedAt - ISO 8601 timestamp when validation was performed
 * @returns Empty validation result ready for population
 */
export function createEmptyCompositeInputValidationResult(
  compositeType: CompositeType,
  contractVersion: string,
  totalSlots: number,
  generatedAt: string,
): CompositeInputValidationResult {
  return {
    compositeType,
    contractVersion,
    eligible: false,
    totalSlots,
    satisfiedRequiredSlots: 0,
    missingRequiredSlots: 0,
    optionalSlotsProvided: 0,
    validationItems: [],
    acceptedInputs: [],
    rejectedInputs: [],
    generatedAt,
  };
}

/**
 * Create a single slot validation item
 * Records the validation result for one slot
 *
 * @param slotKey - Key of the slot
 * @param expectedIndexType - Index type expected by this slot
 * @param requirement - Whether this slot is required or optional
 * @param status - Eligibility status after validation
 * @param reason - Optional explanation of the result
 * @param providedInput - Optional accepted input for this slot
 * @returns Slot validation item
 */
export function createSlotValidationItem(
  slotKey: string,
  expectedIndexType: CompositeInputIndexType,
  requirement: CompositeInputRequirement,
  status: CompositeInputEligibilityStatus,
  reason?: string,
  providedInput?: CompositeInputRef,
): CompositeInputSlotValidation {
  return {
    slotKey,
    expectedIndexType,
    requirement,
    status,
    providedInput,
    reason,
  };
}
