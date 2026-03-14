import { IndexCalculationRequest } from './schemas/index-calculation-request';
import { IndexCalculationResult } from './schemas/index-calculation-result';

/**
 * Base interface for all index calculators.
 * All index type calculators must implement this interface.
 * 
 * Calculators receive IndexCalculationRequest and produce IndexCalculationResult.
 * All calculations must be deterministic and explainable.
 */
export interface IIndexCalculator {
  /**
   * Calculates an index score and returns complete result with breakdown.
   * 
   * @param request - The calculation request with input data
   * @returns Complete calculation result with score, factors, penalties, explanation
   * @throws Error if calculation cannot be completed or validation fails
   */
  calculate(request: IndexCalculationRequest): IndexCalculationResult;
}
