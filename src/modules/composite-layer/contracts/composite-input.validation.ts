/**
 * Deterministic validation utilities for composite inputs
 * Evaluates inputs against contract definitions
 */

import type {
  CompositeInputRef,
  CompositeInputValidationResult,
  CompositeInputValidationContext,
  CompositeInputSlotValidation,
  CompositeInputSlotDefinition,
  CompositeInputContractDefinition,
} from './composite-input.types';
import {
  CompositeInputEligibilityStatus,
  CompositeInputRequirement,
  CompositeValidityPolicy,
} from './composite-input.enums';
import { CompositeInputContractRegistry } from './composite-input.contracts';
import { createEmptyCompositeInputValidationResult, createSlotValidationItem } from './composite-input.result';
import type { CompositeType } from '../core/composite.enums';

/**
 * Check if input is within its validity window
 *
 * @param input - The input to check
 * @param evaluationTime - ISO 8601 timestamp for evaluation
 * @param policy - Validity enforcement policy
 * @returns true if input is within validity window
 */
export function isInputWithinValidityWindow(
  input: CompositeInputRef,
  evaluationTime: string,
  policy: CompositeValidityPolicy,
): boolean {
  if (policy === CompositeValidityPolicy.STRICT) {
    // STRICT: must be explicitly within the window
    // If validFrom is present and evaluationTime < validFrom => false
    if (input.validFrom !== undefined && evaluationTime < input.validFrom) {
      return false;
    }
    // If validTo is present and evaluationTime > validTo => false
    if (input.validTo !== undefined && evaluationTime > input.validTo) {
      return false;
    }
    // Otherwise allow (even if both timestamps are absent)
    return true;
  } else {
    // LENIENT: allow missing metadata, reject only if explicitly outside
    // If validFrom exists and evaluationTime < validFrom => false
    if (input.validFrom !== undefined && evaluationTime < input.validFrom) {
      return false;
    }
    // If validTo exists and evaluationTime > validTo => false
    if (input.validTo !== undefined && evaluationTime > input.validTo) {
      return false;
    }
    // Otherwise allow (including when both are absent)
    return true;
  }
}

/**
 * Check if input meets confidence threshold
 *
 * @param input - The input to check
 * @param minimumConfidence - Required confidence level (optional)
 * @returns true if input satisfies threshold
 */
export function satisfiesConfidenceThreshold(
  input: CompositeInputRef,
  minimumConfidence?: number,
): boolean {
  if (minimumConfidence === undefined) {
    return true;
  }
  return input.confidence >= minimumConfidence;
}

/**
 * Determine eligibility status for a single input against a slot
 *
 * @param input - The input to check
 * @param slotDefinition - The slot to validate against
 * @param evaluationTime - Time for validity window checks
 * @returns Eligibility status
 */
function determineInputEligibilityStatus(
  input: CompositeInputRef,
  slotDefinition: CompositeInputSlotDefinition,
  evaluationTime: string,
): CompositeInputEligibilityStatus {
  // Type check
  if (input.indexType !== slotDefinition.allowedIndexType) {
    return CompositeInputEligibilityStatus.TYPE_NOT_ALLOWED;
  }

  // Confidence check
  if (!satisfiesConfidenceThreshold(input, slotDefinition.minimumConfidence)) {
    return CompositeInputEligibilityStatus.BELOW_CONFIDENCE_THRESHOLD;
  }

  // Validity window check
  if (!isInputWithinValidityWindow(input, evaluationTime, slotDefinition.validityPolicy)) {
    return CompositeInputEligibilityStatus.OUTSIDE_VALIDITY_WINDOW;
  }

  return CompositeInputEligibilityStatus.ELIGIBLE;
}

/**
 * Select the best input from a candidate pool
 * Uses deterministic ordering: highest confidence, then newest createdAt, then lexicographic indexId
 *
 * @param candidates - Eligible candidate inputs
 * @returns The selected input, or undefined if none available
 */
function selectBestInput(candidates: CompositeInputRef[]): CompositeInputRef | undefined {
  if (candidates.length === 0) {
    return undefined;
  }

  // Sort by: confidence (desc), createdAt (desc), indexId (asc)
  const sorted = [...candidates].sort((a, b) => {
    // Higher confidence first
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    // Newer createdAt first
    if (a.createdAt !== b.createdAt) {
      return b.createdAt.localeCompare(a.createdAt);
    }
    // Lexicographically smaller indexId first
    return a.indexId.localeCompare(b.indexId);
  });

  return sorted[0];
}

/**
 * Validate composite inputs against contract
 * Deterministic evaluation of all inputs against slot definitions
 *
 * @param compositeType - Type of composite being validated
 * @param inputs - Array of input references to validate
 * @param context - Validation context with evaluation time
 * @returns Complete validation result
 */
export function validateCompositeInputs(
  compositeType: CompositeType,
  inputs: CompositeInputRef[],
  context: CompositeInputValidationContext,
): CompositeInputValidationResult {
  // Get contract
  const contract = getCompositeInputContract(compositeType);

  // Initialize result
  const result = createEmptyCompositeInputValidationResult(
    compositeType,
    contract.version,
    contract.slots.length,
    context.evaluationTime,
  );

  // Track which inputs were used
  const usedInputIds = new Set<string>();
  let satisfiedRequiredSlots = 0;
  let optionalSlotsProvided = 0;

  // Validate each slot
  const validationItems: CompositeInputSlotValidation[] = [];

  for (const slot of contract.slots) {
    // Find all candidates for this slot
    const candidates = inputs.filter(
      (input) =>
        input.indexType === slot.allowedIndexType &&
        determineInputEligibilityStatus(input, slot, context.evaluationTime) ===
          CompositeInputEligibilityStatus.ELIGIBLE,
    );

    // Select best candidate
    const selected = selectBestInput(candidates);

    if (selected) {
      // Slot satisfied
      usedInputIds.add(selected.indexId);
      result.acceptedInputs.push(selected);

      if (slot.requirement === CompositeInputRequirement.REQUIRED) {
        satisfiedRequiredSlots += 1;
      } else {
        optionalSlotsProvided += 1;
      }

      validationItems.push(
        createSlotValidationItem(
          slot.slotKey,
          slot.allowedIndexType,
          slot.requirement,
          CompositeInputEligibilityStatus.ELIGIBLE,
          `Selected ${selected.indexType} with confidence ${selected.confidence}`,
          selected,
        ),
      );
    } else if (slot.requirement === CompositeInputRequirement.REQUIRED) {
      // Required slot not satisfied - determine why
      let status = CompositeInputEligibilityStatus.MISSING_REQUIRED;
      let reason = 'No eligible input found';

      // Find all inputs of the allowed type and inspect the best one to determine failure reason
      const allInputsOfAllowedType = inputs.filter((input) => input.indexType === slot.allowedIndexType);
      if (allInputsOfAllowedType.length > 0) {
        // Use deterministic selection to inspect the highest-priority failed candidate
        const bestFailed = selectBestInput(allInputsOfAllowedType);
        if (bestFailed) {
          const failedStatus = determineInputEligibilityStatus(bestFailed, slot, context.evaluationTime);
          status = failedStatus;

          if (failedStatus === CompositeInputEligibilityStatus.BELOW_CONFIDENCE_THRESHOLD) {
            reason = `Input confidence ${bestFailed.confidence} below threshold ${slot.minimumConfidence}`;
          } else if (failedStatus === CompositeInputEligibilityStatus.OUTSIDE_VALIDITY_WINDOW) {
            reason = `Input outside validity window (validFrom: ${bestFailed.validFrom}, validTo: ${bestFailed.validTo})`;
          }
        }
      }

      result.missingRequiredSlots += 1;
      validationItems.push(
        createSlotValidationItem(
          slot.slotKey,
          slot.allowedIndexType,
          slot.requirement,
          status,
          reason,
        ),
      );
    } else {
      // Optional slot not satisfied - determine why
      let status = CompositeInputEligibilityStatus.INVALID_REFERENCE;
      let reason = 'OPTIONAL_INPUT_NOT_PROVIDED';

      // Find all inputs of the allowed type and inspect the best one to determine failure reason
      const allInputsOfAllowedType = inputs.filter((input) => input.indexType === slot.allowedIndexType);
      if (allInputsOfAllowedType.length > 0) {
        // Use deterministic selection to inspect the highest-priority failed candidate
        const bestFailed = selectBestInput(allInputsOfAllowedType);
        if (bestFailed) {
          const failedStatus = determineInputEligibilityStatus(bestFailed, slot, context.evaluationTime);

          if (failedStatus === CompositeInputEligibilityStatus.BELOW_CONFIDENCE_THRESHOLD) {
            status = CompositeInputEligibilityStatus.BELOW_CONFIDENCE_THRESHOLD;
            reason = `Input confidence ${bestFailed.confidence} below threshold ${slot.minimumConfidence}`;
          } else if (failedStatus === CompositeInputEligibilityStatus.OUTSIDE_VALIDITY_WINDOW) {
            status = CompositeInputEligibilityStatus.OUTSIDE_VALIDITY_WINDOW;
            reason = `Input outside validity window (validFrom: ${bestFailed.validFrom}, validTo: ${bestFailed.validTo})`;
          }
        }
      }

      validationItems.push(
        createSlotValidationItem(
          slot.slotKey,
          slot.allowedIndexType,
          slot.requirement,
          status,
          reason,
        ),
      );
    }
  }

  // Collect rejected inputs (those not used by any slot)
  for (const input of inputs) {
    if (!usedInputIds.has(input.indexId)) {
      result.rejectedInputs.push(input);
    }
  }

  // Update result counts
  result.satisfiedRequiredSlots = satisfiedRequiredSlots;
  result.optionalSlotsProvided = optionalSlotsProvided;
  result.validationItems = validationItems;

  // Determine eligibility
  // Eligible if: all required slots satisfied AND minimum total inputs met
  result.eligible =
    result.missingRequiredSlots === 0 &&
    result.acceptedInputs.length >= contract.minimumRequiredInputs;

  return result;
}

/**
 * Get contract definition for a composite type
 *
 * @param compositeType - The composite type
 * @returns The contract definition
 * @throws Error if contract not found
 */
export function getCompositeInputContract(compositeType: CompositeType): CompositeInputContractDefinition {
  const contract = CompositeInputContractRegistry[compositeType];

  if (!contract) {
    throw new Error(`No input contract defined for composite type: ${compositeType}`);
  }

  return contract;
}
