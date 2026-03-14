import { IndexRecord } from './schemas/index-record';
import { IndexType } from './enums/index-type';
import { IndexBand, calculateIndexBand } from './enums/index-band';
import { IndexSubjectType } from './enums/index-subject-type';

/**
 * Validates IndexRecord contracts and business rules.
 */
export class IndexRecordValidator {
  /**
   * Validates a complete IndexRecord for correctness and consistency.
   * 
   * @param record - The IndexRecord to validate
   * @throws Error with detailed validation failure message
   */
  static validate(record: IndexRecord): void {
    this.validateIndexId(record.indexId);
    this.validateIndexType(record.indexType);
    this.validateSubjectType(record.subjectType);
    this.validateSubjectId(record.subjectId);
    this.validateScore(record.score);
    this.validateBandConsistency(record.score, record.band);
    this.validateConfidence(record.confidence);
    this.validateDates(record.calculatedAt, record.validAt, record.validFrom, record.validTo);
    this.validateExplanation(record.explanation);
    this.validateMetadata(record.metadata);
  }

  private static validateIndexId(indexId: string): void {
    if (!indexId || typeof indexId !== 'string') {
      throw new Error('IndexRecord.indexId must be a non-empty string');
    }
    if (indexId.length === 0) {
      throw new Error('IndexRecord.indexId cannot be empty');
    }
  }

  private static validateIndexType(indexType: IndexType): void {
    if (!Object.values(IndexType).includes(indexType)) {
      throw new Error(`IndexRecord.indexType must be one of: ${Object.values(IndexType).join(', ')}`);
    }
  }

  private static validateSubjectType(subjectType: IndexSubjectType): void {
    if (!Object.values(IndexSubjectType).includes(subjectType)) {
      throw new Error(`IndexRecord.subjectType must be one of: ${Object.values(IndexSubjectType).join(', ')}`);
    }
  }

  private static validateSubjectId(subjectId: string): void {
    if (!subjectId || typeof subjectId !== 'string') {
      throw new Error('IndexRecord.subjectId must be a non-empty string');
    }
  }

  private static validateScore(score: number): void {
    if (typeof score !== 'number' || isNaN(score)) {
      throw new Error('IndexRecord.score must be a valid number');
    }
    if (score < 0.0 || score > 1.0) {
      throw new Error('IndexRecord.score must be between 0.0 and 1.0');
    }
  }

  private static validateBandConsistency(score: number, band: IndexBand): void {
    const expectedBand = calculateIndexBand(score);
    if (band !== expectedBand) {
      throw new Error(`IndexRecord.band (${band}) is inconsistent with score (${score}). Expected band: ${expectedBand}`);
    }
  }

  private static validateConfidence(confidence: number): void {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      throw new Error('IndexRecord.confidence must be a valid number');
    }
    if (confidence < 0.0 || confidence > 1.0) {
      throw new Error('IndexRecord.confidence must be between 0.0 and 1.0');
    }
  }

  private static validateDates(calculatedAt: Date, validAt: Date, validFrom: Date, validTo: Date): void {
    const dates = { calculatedAt, validAt, validFrom, validTo };
    for (const [key, date] of Object.entries(dates)) {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error(`IndexRecord.${key} must be a valid Date`);
      }
    }

    // Time-awareness business rules
    if (validFrom > validTo) {
      throw new Error('IndexRecord.validFrom must not be after validTo');
    }

    if (validAt < validFrom || validAt > validTo) {
      throw new Error('IndexRecord.validAt must be within the valid period [validFrom, validTo]');
    }
  }

  private static validateExplanation(explanation: any): void {
    if (!explanation || typeof explanation !== 'object') {
      throw new Error('IndexRecord.explanation must be an object');
    }
    if (typeof explanation.summary !== 'string' || !explanation.summary) {
      throw new Error('IndexRecord.explanation.summary must be a non-empty string');
    }
    if (!Array.isArray(explanation.positiveFactors)) {
      throw new Error('IndexRecord.explanation.positiveFactors must be an array');
    }
    if (!Array.isArray(explanation.negativeFactors)) {
      throw new Error('IndexRecord.explanation.negativeFactors must be an array');
    }
    if (!Array.isArray(explanation.recommendedActions)) {
      throw new Error('IndexRecord.explanation.recommendedActions must be an array');
    }
  }

  private static validateMetadata(metadata: any): void {
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('IndexRecord.metadata must be an object');
    }
    if (typeof metadata.eventCount !== 'number' || metadata.eventCount < 0) {
      throw new Error('IndexRecord.metadata.eventCount must be a non-negative number');
    }
    if (typeof metadata.sourceCount !== 'number' || metadata.sourceCount < 0) {
      throw new Error('IndexRecord.metadata.sourceCount must be a non-negative number');
    }
    if (typeof metadata.calculationModel !== 'string' || !metadata.calculationModel) {
      throw new Error('IndexRecord.metadata.calculationModel must be a non-empty string');
    }
  }
}
