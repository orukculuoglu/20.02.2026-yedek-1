import type { IndexCalculationRequest } from '../domain/calculation/schemas/index-calculation-request';
import type { IndexCalculationResult } from '../domain/calculation/schemas/index-calculation-result';
import type { IndexType } from '../domain/enums/index-type';
import { IndexExecutionErrorClass } from './contracts';

/**
 * Runtime calculator interface
 * Async wrapper around domain IIndexCalculator for async execution
 */
export interface IndexCalculator {
  calculate(request: IndexCalculationRequest): Promise<IndexCalculationResult>;
}

export class IndexCalculationRunner {
  private calculators: Map<string, IndexCalculator> = new Map();

  /**
   * Register a calculator for an IndexType
   */
  register(indexType: string, calculator: IndexCalculator): void {
    if (this.calculators.has(indexType)) {
      console.warn(`Overwriting existing calculator for ${indexType}`);
    }
    this.calculators.set(indexType, calculator);
  }

  /**
   * Register multiple calculators at once
   */
  registerMultiple(calculators: Array<{ indexType: string; calculator: IndexCalculator }>): void {
    for (const { indexType, calculator } of calculators) {
      this.register(indexType, calculator);
    }
  }

  /**
   * Get available calculator types
   */
  getAvailableTypes(): string[] {
    return Array.from(this.calculators.keys());
  }

  /**
   * Check if calculator is registered
   */
  hasCalculator(indexType: string): boolean {
    return this.calculators.has(indexType);
  }

  /**
   * Resolve calculator by IndexType
   * Fails deterministically if not found
   */
  private resolveCalculator(indexType: string): IndexCalculator {
    const calculator = this.calculators.get(indexType);
    if (!calculator) {
      const error = new IndexExecutionErrorClass(
        `No calculator registered for IndexType: ${indexType}. Available: ${this.getAvailableTypes().join(', ')}`,
        'CALCULATION_RUNNER_ERROR',
      );
      error.details = { indexType, availableTypes: this.getAvailableTypes() };
      throw error;
    }
    return calculator;
  }

  /**
   * Execute calculator by IndexType
   * Deterministic: throws if calculator not found
   * No silent failures or fallbacks
   */
  async execute(indexType: string, request: IndexCalculationRequest): Promise<IndexCalculationResult> {
    const startTime = Date.now();

    try {
      const calculator = this.resolveCalculator(indexType);

      // Verify calculator has required method
      if (typeof calculator.calculate !== 'function') {
        const error = new IndexExecutionErrorClass(
          `Calculator for ${indexType} does not implement calculate() method`,
          'CALCULATION_RUNNER_ERROR',
        );
        error.details = { indexType, calculatorName: calculator.constructor.name };
        throw error;
      }

      // Execute calculation
      const result = await calculator.calculate(request);

      // Verify result structure
      if (!result || typeof result !== 'object') {
        const error = new IndexExecutionErrorClass(
          `Calculator for ${indexType} returned invalid result: ${typeof result}`,
          'CALCULATION_RUNNER_ERROR',
        );
        error.details = { indexType, resultType: typeof result };
        throw error;
      }

      return result;
    } catch (err) {
      if (err instanceof IndexExecutionErrorClass) {
        throw err;
      }

      const error = new IndexExecutionErrorClass(
        `Calculator execution failed for ${indexType}: ${err instanceof Error ? err.message : String(err)}`,
        'CALCULATION_RUNNER_ERROR',
      );
      error.details = { indexType, originalError: err instanceof Error ? err.message : String(err) };
      if (err instanceof Error) {
        error.stack = err.stack;
      }
      throw error;
    }
  }

  /**
   * Get calculator instance info for diagnostics
   */
  getCalculatorInfo(indexType: string): { name: string; version?: string } | null {
    const calculator = this.calculators.get(indexType);
    if (!calculator) return null;

    return {
      name: calculator.constructor.name,
      version: (calculator as unknown as Record<string, unknown>).version as string | undefined,
    };
  }
}
