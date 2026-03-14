/**
 * Deterministic composite score calculator
 * Combines validated inputs using weight profiles and handles missing optional inputs
 */

import type { CompositeInputRef } from '../contracts/composite-input.types';
import type { CompositeWeightResult, CompositeWeightContribution } from './composite-weighting.types';
import { CompositeWeightProfiles } from './composite-weighting.model';
import type { CompositeType } from '../core/composite.enums';
import { getCompositeInputContract } from '../contracts/composite-input.validation';

/**
 * Calculate composite score from validated inputs
 * Implements deterministic weighting with automatic weight redistribution for missing optional inputs
 *
 * Flow:
 * 1. Load weight profile
 * 2. Load contract
 * 3. Build deterministic slotKey -> input mapping
 * 4. Identify slots with accepted inputs
 * 5. Sum base weights for available slots
 * 6. Normalize weights so available weights sum to 1.0
 * 7. Calculate weighted contributions
 * 8. Sum contributions for final score
 *
 * @param compositeType - The composite type
 * @param acceptedInputs - Validated inputs that passed contract validation
 * @returns Composite weight result with normalized score and contribution breakdown
 */
export function calculateCompositeScore(
  compositeType: CompositeType,
  acceptedInputs: CompositeInputRef[],
): CompositeWeightResult {
  // 1. Load weight profile
  const profile = CompositeWeightProfiles[compositeType];
  if (!profile) {
    throw new Error(`No weight profile defined for composite type: ${compositeType}`);
  }

  // 2. Load contract
  const contract = getCompositeInputContract(compositeType);

  // 3. Build deterministic slotKey -> input mapping using contract
  const inputsBySlot = new Map<string, CompositeInputRef>();
  for (const input of acceptedInputs) {
    // Match input.indexType to slot.allowedIndexType
    const matchingSlot = contract.slots.find((slot) => slot.allowedIndexType === input.indexType);
    if (matchingSlot && !inputsBySlot.has(matchingSlot.slotKey)) {
      inputsBySlot.set(matchingSlot.slotKey, input);
    }
  }

  // 4. Identify only slots that have accepted inputs
  const availableSlotKeys = Array.from(inputsBySlot.keys());
  if (availableSlotKeys.length === 0) {
    // No accepted inputs
    return {
      compositeType,
      normalizedScore: 0.0,
      contributions: [],
      totalWeightUsed: 0.0,
      version: profile.version,
    };
  }

  // 5. Sum the base weights for available slots
  let baseWeightSum = 0;
  for (const slotKey of availableSlotKeys) {
    const weightDef = profile.weights.find((w) => w.slotKey === slotKey);
    if (weightDef) {
      baseWeightSum += weightDef.weight;
    }
  }

  // 6. Re-normalize only the available slot weights so they sum to 1.0
  const normalizedWeights = new Map<string, number>();
  for (const slotKey of availableSlotKeys) {
    const weightDef = profile.weights.find((w) => w.slotKey === slotKey);
    if (weightDef && baseWeightSum > 0) {
      normalizedWeights.set(slotKey, weightDef.weight / baseWeightSum);
    }
  }

  // 7. Calculate contributions and 8. sum for final score
  const contributions: CompositeWeightContribution[] = [];
  let weightedScoreSum = 0;

  for (const [slotKey, input] of inputsBySlot.entries()) {
    const normalizedWeight = normalizedWeights.get(slotKey) ?? 0;
    const weightedScore = input.score * normalizedWeight;

    weightedScoreSum += weightedScore;

    contributions.push({
      slotKey,
      inputIndexId: input.indexId,
      inputScore: input.score,
      weightApplied: normalizedWeight,
      weightedScore,
    });
  }

  // 9. totalWeightUsed = 1.0 when contributions exist, otherwise 0.0
  const totalWeightUsed = contributions.length > 0 ? 1.0 : 0.0;

  return {
    compositeType,
    normalizedScore: Math.min(1.0, Math.max(0.0, weightedScoreSum)),
    contributions,
    totalWeightUsed,
    version: profile.version,
  };
}
