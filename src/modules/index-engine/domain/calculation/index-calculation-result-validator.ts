import { IndexCalculationResult } from './schemas/index-calculation-result';
import { IndexType } from '../enums/index-type';
import { IndexSubjectType } from '../enums/index-subject-type';
import { IndexBand } from '../enums/index-band';

/**
 * Validates IndexCalculationResult contracts.
 */
export class IndexCalculationResultValidator {
  /**
   * Validates a complete IndexCalculationResult object.
   * 
   * @param result - The IndexCalculationResult to validate
   * @throws Error with detailed validation failure message
   */
  static validate(result: IndexCalculationResult): void {
    this.validateIndexType(result.indexType);
    this.validateSubjectType(result.subjectType);
    this.validateSubjectId(result.subjectId);
    this.validateScores(result.rawScore, result.normalizedScore);
    this.validateBand(result.band, result.normalizedScore);
    this.validateConfidence(result.confidence);
    this.validateBreakdown(result.breakdown);
    this.validateFactors(result.factors);
    this.validatePenalties(result.penalties);
    this.validateExplanation(result.explanation);
    this.validateCalculatedAt(result.calculatedAt);
  }

  private static validateIndexType(indexType: IndexType): void {
    if (!Object.values(IndexType).includes(indexType)) {
      throw new Error(`IndexCalculationResult.indexType must be one of: ${Object.values(IndexType).join(', ')}`);
    }
  }

  private static validateSubjectType(subjectType: IndexSubjectType): void {
    if (!Object.values(IndexSubjectType).includes(subjectType)) {
      throw new Error(`IndexCalculationResult.subjectType must be one of: ${Object.values(IndexSubjectType).join(', ')}`);
    }
  }

  private static validateSubjectId(subjectId: string): void {
    if (!subjectId || typeof subjectId !== 'string') {
      throw new Error('IndexCalculationResult.subjectId must be a non-empty string');
    }
  }

  private static validateScores(rawScore: number, normalizedScore: number): void {
    if (typeof rawScore !== 'number' || isNaN(rawScore)) {
      throw new Error('IndexCalculationResult.rawScore must be a valid number');
    }
    if (typeof normalizedScore !== 'number' || isNaN(normalizedScore)) {
      throw new Error('IndexCalculationResult.normalizedScore must be a valid number');
    }
    if (normalizedScore < 0.0 || normalizedScore > 1.0) {
      throw new Error('IndexCalculationResult.normalizedScore must be between 0.0 and 1.0');
    }
  }

  private static validateBand(band: IndexBand, score: number): void {
    if (!Object.values(IndexBand).includes(band)) {
      throw new Error(`IndexCalculationResult.band must be one of: ${Object.values(IndexBand).join(', ')}`);
    }
    // Could add band consistency validation here if needed
  }

  private static validateConfidence(confidence: number): void {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      throw new Error('IndexCalculationResult.confidence must be a valid number');
    }
    if (confidence < 0.0 || confidence > 1.0) {
      throw new Error('IndexCalculationResult.confidence must be between 0.0 and 1.0');
    }
  }

  private static validateBreakdown(breakdown: any): void {
    if (!breakdown || typeof breakdown !== 'object') {
      throw new Error('IndexCalculationResult.breakdown must be an object');
    }
    if (typeof breakdown.finalScore !== 'number' || breakdown.finalScore < 0 || breakdown.finalScore > 1) {
      throw new Error('IndexCalculationResult.breakdown.finalScore must be between 0 and 1');
    }
  }

  private static validateFactors(factors: any[]): void {
    if (!Array.isArray(factors)) {
      throw new Error('IndexCalculationResult.factors must be an array');
    }
  }

  private static validatePenalties(penalties: any[]): void {
    if (!Array.isArray(penalties)) {
      throw new Error('IndexCalculationResult.penalties must be an array');
    }
  }

  private static validateExplanation(explanation: any): void {
    if (!explanation || typeof explanation !== 'object') {
      throw new Error('IndexCalculationResult.explanation must be an object');
    }
  }

  private static validateCalculatedAt(calculatedAt: Date): void {
    if (!(calculatedAt instanceof Date) || isNaN(calculatedAt.getTime())) {
      throw new Error('IndexCalculationResult.calculatedAt must be a valid Date');
    }
  }
}
