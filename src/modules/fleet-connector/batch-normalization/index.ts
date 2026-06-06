/**
 * Fleet Batch Normalization Module
 * 
 * Pure batch processor that transforms external fleet vehicle records into
 * safe normalized internal records.
 * 
 * Exports:
 * - FleetBatchNormalizationRuntimeInput: Input structure for the batch runner
 * - FleetBatchNormalizationResult: Result structure
 * - FleetBatchNormalizationStatus: Status enum
 * - FleetBatchNormalizationRejectReason: Rejection reason enum
 * - FleetBatchNormalizationRejectedRef: Rejected record reference structure
 * - runFleetBatchNormalization: Batch normalization transformation function
 */

export type { FleetBatchNormalizationRuntimeInput } from './fleet-batch-normalization-runner.input';

export type {
  FleetBatchNormalizationResult,
  FleetBatchNormalizationRejectedRef,
} from './fleet-batch-normalization-runner.result';

export {
  FleetBatchNormalizationStatus,
  FleetBatchNormalizationRejectReason,
} from './fleet-batch-normalization-runner.result';

export { runFleetBatchNormalization } from './fleet-batch-normalization-runner';
