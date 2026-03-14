/**
 * Explanation building for composite records
 * Generates deterministic explanation payloads
 */

import type { CompositeType } from '../core/composite.enums';
import type { CompositeExplanation } from '../core/composite.explanation';
import type { CompositeWeightResult } from '../weighting/composite-weighting.types';
import type { CompositeInputRef } from '../contracts/composite-input.types';

/**
 * Build explanation for composite record
 *
 * Rules:
 * - summary must be concise and deterministic
 * - contributingFactors lists slot keys from contributions in deterministic order
 * - strongestPositiveDrivers lists top 3 contributions by weightedScore descending
 * - strongestNegativeDrivers is an empty array
 * - confidenceNotes includes LOW/MEDIUM/HIGH_CONFIDENCE tags
 * - missingInputs is an empty array
 * - comparisonNotes is an empty array
 *
 * @param compositeType - The composite type
 * @param weightingResult - The weighting calculation result
 * @param confidence - Confidence level (0.0 - 1.0)
 * @param acceptedInputs - Validated input references
 * @returns Composite explanation
 */
export function buildCompositeExplanation(
  compositeType: CompositeType,
  weightingResult: CompositeWeightResult,
  confidence: number,
  acceptedInputs: CompositeInputRef[],
): CompositeExplanation {
  // Summary: concise deterministic text
  const summary = `Composite ${compositeType} score determined by weighted combination of ${weightingResult.contributions.length} inputs.`;

  // Contributing factors: preserve deterministic contribution order from weightingResult
  const contributingFactors = weightingResult.contributions.map((c) => c.slotKey);

  // Strongest positive drivers: top 3 by weightedScore descending with deterministic tie-breakers
  const sortedContributions = [...weightingResult.contributions].sort((a, b) => {
    // Primary: weightedScore descending
    if (a.weightedScore !== b.weightedScore) {
      return b.weightedScore - a.weightedScore;
    }
    // Secondary: weightApplied descending
    if (a.weightApplied !== b.weightApplied) {
      return b.weightApplied - a.weightApplied;
    }
    // Tertiary: slotKey lexicographically ascending
    return a.slotKey.localeCompare(b.slotKey);
  });
  const strongestPositiveDrivers = sortedContributions.slice(0, 3).map((c) => c.slotKey);

  // Confidence notes: deterministic tags based on confidence level
  const confidenceNotes: string[] = [];
  if (confidence < 0.50) {
    confidenceNotes.push('LOW_CONFIDENCE');
  } else if (confidence < 0.75) {
    confidenceNotes.push('MEDIUM_CONFIDENCE');
  } else {
    confidenceNotes.push('HIGH_CONFIDENCE');
  }

  return {
    summary,
    contributingFactors,
    strongestPositiveDrivers,
    strongestNegativeDrivers: [],
    confidenceNotes,
    missingInputs: [],
    comparisonNotes: [],
  };
}
