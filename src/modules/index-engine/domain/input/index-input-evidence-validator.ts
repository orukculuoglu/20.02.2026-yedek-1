import { IndexInputEvidence } from './schemas/index-input-evidence';
import { EvidenceType } from './enums/evidence-type';

/**
 * Validates IndexInputEvidence contracts.
 */
export class IndexInputEvidenceValidator {
  /**
   * Validates a complete IndexInputEvidence object.
   * 
   * @param evidence - The IndexInputEvidence to validate
   * @throws Error with detailed validation failure message
   */
  static validate(evidence: IndexInputEvidence): void {
    this.validateEvidenceType(evidence.evidenceType);
    this.validateLabel(evidence.label);
    this.validateValue(evidence.value);
    this.validateConfidence(evidence.confidence);
    this.validateTimestamp(evidence.timestamp);
  }

  private static validateEvidenceType(evidenceType: EvidenceType): void {
    if (!Object.values(EvidenceType).includes(evidenceType)) {
      throw new Error(`IndexInputEvidence.evidenceType must be one of: ${Object.values(EvidenceType).join(', ')}`);
    }
  }

  private static validateLabel(label: string): void {
    if (typeof label !== 'string' || !label.trim()) {
      throw new Error('IndexInputEvidence.label must be a non-empty string');
    }
  }

  private static validateValue(value: unknown): void {
    if (value === undefined || value === null) {
      throw new Error('IndexInputEvidence.value must not be null or undefined');
    }
    const type = typeof value;
    if (type !== 'string' && type !== 'number' && type !== 'boolean' && type !== 'object') {
      throw new Error('IndexInputEvidence.value must be a string, number, boolean, or object');
    }
  }

  private static validateConfidence(confidence: number): void {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      throw new Error('IndexInputEvidence.confidence must be a valid number');
    }
    if (confidence < 0.0 || confidence > 1.0) {
      throw new Error('IndexInputEvidence.confidence must be between 0.0 and 1.0');
    }
  }

  private static validateTimestamp(timestamp: Date): void {
    if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
      throw new Error('IndexInputEvidence.timestamp must be a valid Date');
    }
  }
}
