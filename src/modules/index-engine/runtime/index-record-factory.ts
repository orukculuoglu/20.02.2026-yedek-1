import type { IndexInput } from '../domain/input/schemas/index-input';
import type { IndexCalculationResult } from '../domain/calculation/schemas/index-calculation-result';
import type { IndexRecord } from '../domain/schemas/index-record';
import type { IndexType } from '../domain/enums/index-type';
import type { IndexBand } from '../domain/enums/index-band';
import { IndexExecutionErrorClass } from './contracts';

/**
 * Transforms IndexCalculationResult into publishable IndexRecord
 * Preserves all critical fields and maintains traceability
 */
export class IndexRecordFactory {
  /**
   * Create IndexRecord from calculation result
   * Deterministically preserves:
   * - indexType, subjectType, subjectId (from calculationResult)
   * - score, band, confidence, explanation (from calculationResult)
   * - validity windows (validAt, validFrom, validTo from indexInput)
   * - metadata preserving traceability
   */
  static create(
    calculationResult: IndexCalculationResult,
    indexInput: IndexInput,
    executionId: string,
  ): IndexRecord {
    try {
      // Validate inputs
      if (!calculationResult || typeof calculationResult !== 'object') {
        throw new Error(`Invalid calculation result: ${typeof calculationResult}`);
      }

      if (!indexInput || typeof indexInput !== 'object') {
        throw new Error(`Invalid index input: ${typeof indexInput}`);
      }

      // Validate required calculation fields
      const required = ['normalizedScore', 'band', 'confidence', 'explanation'];
      for (const field of required) {
        if (!(field in calculationResult)) {
          throw new Error(`Missing required field in calculation result: ${field}`);
        }
      }

      // Build IndexRecord from calculation result and input
      // Use score (alias for normalizedScore), band, and explanation from calcation result
      // Use time windows and traceability from input  
      const indexRecord: IndexRecord = {
        indexId: `${calculationResult.indexType}:${calculationResult.subjectId}:${calculationResult.calculatedAt.getTime()}`,
        indexType: calculationResult.indexType,
        subjectType: calculationResult.subjectType,
        subjectId: calculationResult.subjectId,
        score: calculationResult.normalizedScore,
        band: calculationResult.band,
        confidence: calculationResult.confidence,
        calculatedAt: calculationResult.calculatedAt,
        validAt: indexInput.validAt,
        validFrom: indexInput.validFrom,
        validTo: indexInput.validTo,
        explanation: calculationResult.explanation,
        metadata: {
          eventCount: indexInput.eventCount,
          sourceCount: indexInput.sourceCount,
          calculationModel: 'IndexEngine/v1.0.0',
          dataFreshnessInDays: Math.floor(
            (calculationResult.calculatedAt.getTime() - indexInput.observedAt.getTime()) / (1000 * 60 * 60 * 24),
          ),
        },
      };

      return indexRecord;
    } catch (err) {
      const error = new IndexExecutionErrorClass(
        `IndexRecordFactory failed to create record: ${err instanceof Error ? err.message : String(err)}`,
        'FACTORY_ERROR',
      );
      error.details = {
        calculationResult: typeof calculationResult,
        indexInput: typeof indexInput,
        originalError: err instanceof Error ? err.message : String(err),
      };
      throw error;
    }
  }
  /**
   * Validate IndexRecord structure
   * Quick validation to ensure record has required fields
   */
  static validate(record: unknown): boolean {
    if (!record || typeof record !== 'object') {
      return false;
    }

    const r = record as Record<string, unknown>;

    // Required fields
    const required = ['indexId', 'indexType', 'subjectType', 'subjectId', 'score', 'band', 'confidence', 'explanation', 'calculatedAt'];
    for (const field of required) {
      if (!(field in r)) {
        return false;
      }
    }

    // Type checks for score and confidence ranges
    if (typeof r.score !== 'number' || (r.score as number) < 0 || (r.score as number) > 1) {
      return false;
    }

    if (typeof r.confidence !== 'number' || (r.confidence as number) < 0 || (r.confidence as number) > 1) {
      return false;
    }

    return true;
  }
}
