/**
 * Fleet Normalization Demo Runner Result
 * 
 * Defines result structures for demo normalization processing.
 */

import {
  FleetBatchNormalizationResult,
} from '../batch-normalization';

import {
  FleetNormalizationReadModel,
} from '../read-models';

/**
 * FleetNormalizationDemoResult
 * 
 * Complete result of demo normalization run.
 * 
 * Contains batch normalization result and aggregate read model.
 * Provides complete view of mock intake normalization flow.
 * No raw external record arrays. No free-text fields. No external update fields.
 */
export interface FleetNormalizationDemoResult {
  /**
   * Batch normalization result from processing mock records.
   * 
   * Contains normalized records and rejected record references.
   */
  batchResult: FleetBatchNormalizationResult;

  /**
   * Aggregate read model extracted from batch result.
   * 
   * Provides fleet-level operational insight and status distributions.
   */
  readModel: FleetNormalizationReadModel;
}
