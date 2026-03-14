import type { IndexCalculationRequest } from './index-calculation-request';
import type { IndexCalculationResult } from './index-calculation-result';

/**
 * Base interface for all Index calculators
 * Implemented by Reliability, Maintenance, Insurance, OperationalReadiness, DataQuality
 */
export interface IndexCalculator {
  /**
   * Calculate index based on input
   * Returns deterministic calculation result
   */
  calculate(request: IndexCalculationRequest): Promise<IndexCalculationResult>;
}
