import { IndexInput } from './schemas/index-input';
import { IndexSubjectType } from '../enums/index-subject-type';
import { IndexInputRefValidator } from './index-input-ref-validator';
import { IndexInputEvidenceValidator } from './index-input-evidence-validator';
import { IndexInputSnapshotValidator } from './index-input-snapshot-validator';
import { IndexInputFeatureSetValidator } from './index-input-feature-set-validator';

/**
 * Validates IndexInput contracts and business rules.
 */
export class IndexInputValidator {
  /**
   * Validates a complete IndexInput for correctness and consistency.
   * 
   * @param input - The IndexInput to validate
   * @throws Error with detailed validation failure message
   */
  static validate(input: IndexInput): void {
    this.validateInputId(input.inputId);
    this.validateSubjectType(input.subjectType);
    this.validateSubjectId(input.subjectId);
    this.validateDates(input.observedAt, input.validAt, input.validFrom, input.validTo);
    this.validateCounts(input.eventCount, input.sourceCount, input.intelligenceCount, input.signalCount);
    this.validateScores(input.trustScore, input.provenanceScore, input.dataQualityScore);
    this.validateRefs(input.refs);
    this.validateEvidence(input.evidence);
    this.validateFeatureSet(input.featureSet);
    this.validateSnapshot(input.snapshot);
  }

  private static validateInputId(inputId: string): void {
    if (!inputId || typeof inputId !== 'string') {
      throw new Error('IndexInput.inputId must be a non-empty string');
    }
  }

  private static validateSubjectType(subjectType: IndexSubjectType): void {
    if (!Object.values(IndexSubjectType).includes(subjectType)) {
      throw new Error(`IndexInput.subjectType must be one of: ${Object.values(IndexSubjectType).join(', ')}`);
    }
  }

  private static validateSubjectId(subjectId: string): void {
    if (!subjectId || typeof subjectId !== 'string') {
      throw new Error('IndexInput.subjectId must be a non-empty string');
    }
  }

  private static validateDates(observedAt: Date, validAt: Date, validFrom: Date, validTo: Date): void {
    const dates = { observedAt, validAt, validFrom, validTo };
    for (const [key, date] of Object.entries(dates)) {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error(`IndexInput.${key} must be a valid Date`);
      }
    }

    if (validFrom > validTo) {
      throw new Error('IndexInput.validFrom must not be after validTo');
    }

    if (validAt < validFrom || validAt > validTo) {
      throw new Error('IndexInput.validAt must be within the valid period [validFrom, validTo]');
    }
  }

  private static validateCounts(eventCount: number, sourceCount: number, intelligenceCount: number, signalCount: number): void {
    const counts = { eventCount, sourceCount, intelligenceCount, signalCount };
    for (const [key, count] of Object.entries(counts)) {
      if (typeof count !== 'number' || count < 0) {
        throw new Error(`IndexInput.${key} must be a non-negative number`);
      }
    }
  }

  private static validateScores(trustScore: number, provenanceScore: number, dataQualityScore: number): void {
    const scores = { trustScore, provenanceScore, dataQualityScore };
    for (const [key, score] of Object.entries(scores)) {
      if (typeof score !== 'number' || isNaN(score)) {
        throw new Error(`IndexInput.${key} must be a valid number`);
      }
      if (score < 0.0 || score > 1.0) {
        throw new Error(`IndexInput.${key} must be between 0.0 and 1.0`);
      }
    }
  }

  private static validateRefs(refs: any[]): void {
    if (!Array.isArray(refs)) {
      throw new Error('IndexInput.refs must be an array');
    }
    if (refs.length === 0) {
      throw new Error('IndexInput.refs must contain at least one reference');
    }
    refs.forEach((ref, index) => {
      try {
        IndexInputRefValidator.validate(ref);
      } catch (error) {
        throw new Error(`IndexInput.refs[${index}]: ${(error as Error).message}`);
      }
    });
  }

  private static validateEvidence(evidence: any[]): void {
    if (!Array.isArray(evidence)) {
      throw new Error('IndexInput.evidence must be an array');
    }
    if (evidence.length === 0) {
      throw new Error('IndexInput.evidence must contain at least one evidence item');
    }
    evidence.forEach((evidenceItem, index) => {
      try {
        IndexInputEvidenceValidator.validate(evidenceItem);
      } catch (error) {
        throw new Error(`IndexInput.evidence[${index}]: ${(error as Error).message}`);
      }
    });
  }

  private static validateFeatureSet(featureSet: any): void {
    try {
      IndexInputFeatureSetValidator.validate(featureSet);
    } catch (error) {
      throw new Error(`IndexInput.featureSet: ${(error as Error).message}`);
    }
  }

  private static validateSnapshot(snapshot: any): void {
    try {
      IndexInputSnapshotValidator.validate(snapshot);
    } catch (error) {
      throw new Error(`IndexInput.snapshot: ${(error as Error).message}`);
    }
  }
}
