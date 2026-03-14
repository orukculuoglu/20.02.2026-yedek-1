/**
 * Validity window derivation for composite records
 * Determines effective validity window from accepted inputs
 */

import type { CompositeInputRef } from '../contracts/composite-input.types';

/**
 * Result of validity window derivation
 */
export interface CompositeValidityWindow {
  /**
   * Earliest valid-from date among inputs
   */
  validFrom?: string;

  /**
   * Latest valid-to date among inputs
   */
  validTo?: string;
}

/**
 * Derive validity window from accepted inputs
 *
 * Rules:
 * - validFrom = latest validFrom among accepted inputs that define it
 * - validTo = earliest validTo among accepted inputs that define it
 * - if none define validFrom, omit it
 * - if none define validTo, omit it
 *
 * @param acceptedInputs - Validated input references
 * @returns Validity window with optional validFrom and validTo
 */
export function deriveCompositeValidityWindow(
  acceptedInputs: CompositeInputRef[],
): CompositeValidityWindow {
  const result: CompositeValidityWindow = {};

  // Collect validFrom dates
  const validFromDates: string[] = [];
  // Collect validTo dates
  const validToDates: string[] = [];

  for (const input of acceptedInputs) {
    if (input.validFrom) {
      validFromDates.push(input.validFrom);
    }
    if (input.validTo) {
      validToDates.push(input.validTo);
    }
  }

  // Latest validFrom (most recent start)
  if (validFromDates.length > 0) {
    validFromDates.sort();
    result.validFrom = validFromDates[validFromDates.length - 1];
  }

  // Earliest validTo (soonest end)
  if (validToDates.length > 0) {
    validToDates.sort();
    result.validTo = validToDates[0];
  }

  return result;
}
