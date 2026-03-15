import type { CompositeType } from '../core/composite.enums';
import type { CompositeInputRef } from '../contracts/composite-input.types';
import type { CompositeRuntimeInputSet } from './composite-runtime.types';

/**
 * Filter composite inputs by event context (vehicle or fleet).
 *
 * Rules:
 * - if vehicleId is provided: include only inputs where sourceVehicleId === vehicleId
 * - else if fleetId is provided: include only inputs where sourceFleetId === fleetId
 * - else: include all inputs
 *
 * Result is deterministically sorted.
 *
 * @param inputs - Source inputs to filter
 * @param vehicleId - Optional vehicle context
 * @param fleetId - Optional fleet context
 * @returns Filtered and deterministically sorted inputs
 */
export function filterCompositeInputsForEventContext(
  inputs: CompositeInputRef[],
  vehicleId?: string,
  fleetId?: string,
): CompositeInputRef[] {
  let filtered: CompositeInputRef[] = inputs;

  if (vehicleId) {
    // Filter by vehicle context
    filtered = inputs.filter(
      (input) =>
        'sourceVehicleId' in input && input.sourceVehicleId === vehicleId,
    );
  } else if (fleetId) {
    // Filter by fleet context
    filtered = inputs.filter(
      (input) => 'sourceFleetId' in input && input.sourceFleetId === fleetId,
    );
  }

  // Sort deterministically and return
  return sortCompositeInputsDeterministically(filtered);
}

/**
 * Sort composite inputs deterministically.
 *
 * Deterministic sort order:
 * 1. indexType ascending (lexicographic)
 * 2. confidence descending (higher first)
 * 3. createdAt descending (newer first)
 * 4. indexId ascending (lexicographic)
 *
 * @param inputs - Unsorted input references
 * @returns Deterministically sorted copy of inputs
 */
export function sortCompositeInputsDeterministically(
  inputs: CompositeInputRef[],
): CompositeInputRef[] {
  // Create copy to avoid mutation
  const sorted = [...inputs];

  sorted.sort((a, b) => {
    // 1. Primary: indexType ascending
    if (a.indexType !== b.indexType) {
      return a.indexType.localeCompare(b.indexType);
    }

    // 2. Secondary: confidence descending
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }

    // 3. Tertiary: createdAt descending
    if (a.createdAt !== b.createdAt) {
      return b.createdAt.localeCompare(a.createdAt);
    }

    // 4. Quaternary: indexId ascending
    return a.indexId.localeCompare(b.indexId);
  });

  return sorted;
}

/**
 * Build runtime input set for a specific composite type.
 *
 * Prepares deterministic input collection with calculated confidence.
 * Filters inputs by event context before processing.
 *
 * @param compositeType - Target composite type
 * @param inputs - Input references (will be filtered and sorted)
 * @param evaluationTime - Time of evaluation
 * @param vehicleId - Optional vehicle context
 * @param fleetId - Optional fleet context
 * @returns CompositeRuntimeInputSet ready for validation
 */
export function buildCompositeRuntimeInputSet(
  compositeType: CompositeType,
  inputs: CompositeInputRef[],
  evaluationTime: string,
  vehicleId?: string,
  fleetId?: string,
): CompositeRuntimeInputSet {
  // Filter inputs by event context
  const filteredInputs = filterCompositeInputsForEventContext(
    inputs,
    vehicleId,
    fleetId,
  );

  // Calculate average confidence from filtered inputs
  let confidence: number = 0;
  if (filteredInputs.length > 0) {
    const sum = filteredInputs.reduce((acc, input) => acc + input.confidence, 0);
    confidence = sum / filteredInputs.length;
  }

  return {
    compositeType,
    inputs: filteredInputs,
    confidence,
    vehicleId,
    fleetId,
    evaluationTime,
  };
}
