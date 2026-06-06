/**
 * Fleet Normalization Demo Runner
 * 
 * Pure deterministic demo composition that demonstrates external-to-normalized flow
 * using mock intake records, batch normalization, and aggregate summarization.
 * 
 * This demo runner:
 * - Uses mock external fleet vehicle records
 * - Performs batch normalization with caller-provided context
 * - Extracts aggregate read model from normalized data
 * - Returns both batch result and aggregate summary
 * - Never generates IDs or timestamps
 * - Never mutates inputs
 * - Never calls external systems
 * - Never emits events
 * - Remains fully deterministic
 */

import { MOCK_EXTERNAL_FLEET_RECORDS } from '../mock-intake';

import {
  runFleetBatchNormalization,
} from '../batch-normalization';

import {
  createFleetNormalizationReadModel,
} from '../read-models';

import {
  FleetNormalizationDemoRuntimeInput,
} from './fleet-normalization-demo-runner.input';

import {
  FleetNormalizationDemoResult,
} from './fleet-normalization-demo-runner.result';

/**
 * runFleetNormalizationDemo
 * 
 * Pure deterministic demo composition for mock intake normalization.
 * 
 * Takes mock external fleet records and transforms them through normalization
 * layers with caller-provided contextual information, returning both
 * batch normalization result and aggregate read model summary.
 * 
 * This is demo composition only - no business logic or validation
 * happens here beyond what normalization and read model layers provide.
 * Processing is strictly deterministic given same input.
 * 
 * Determinism guarantees:
 * - normalizedRecordIds are caller-provided, used in order
 * - normalizedAt is caller-provided, used as-is
 * - tenantId is caller-provided, used as-is
 * - fleetId is caller-provided if present, used as-is
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of mock records
 * - No mutation of normalizedRecordIds
 * - No event emission
 * - Fully reproducible given same input
 * 
 * @param input - Demo runtime input with caller-provided context
 * @returns Demo result containing batch normalization result and aggregate read model
 */
export function runFleetNormalizationDemo(
  input: FleetNormalizationDemoRuntimeInput
): FleetNormalizationDemoResult {
  // ============================================
  // A) BATCH NORMALIZATION STEP
  // ============================================

  const batchResult = runFleetBatchNormalization({
    externalRecords: MOCK_EXTERNAL_FLEET_RECORDS,
    normalizedRecordIds: input.normalizedRecordIds,
    tenantId: input.tenantId,
    fleetId: input.fleetId,
    normalizedAt: input.normalizedAt,
  });

  // ============================================
  // B) READ MODEL STEP
  // ============================================

  const readModel = createFleetNormalizationReadModel(batchResult);

  // ============================================
  // C) RETURN DEMO RESULT
  // ============================================

  return {
    batchResult,
    readModel,
  };
}
