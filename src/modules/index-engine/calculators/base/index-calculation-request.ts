import type { IndexInput } from '../../domain/input/schemas/index-input';

/**
 * Calculation request passed to calculators
 */
export interface IndexCalculationRequest {
  indexInput: IndexInput;
  context?: Record<string, unknown>;
}
