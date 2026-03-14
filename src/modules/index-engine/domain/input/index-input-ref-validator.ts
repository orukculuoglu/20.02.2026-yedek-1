import { IndexInputRef } from './schemas/index-input-ref';
import { RefType } from './enums/ref-type';
import { RelationType } from './enums/relation-type';

/**
 * Validates IndexInputRef contracts.
 */
export class IndexInputRefValidator {
  /**
   * Validates a complete IndexInputRef object.
   * 
   * @param ref - The IndexInputRef to validate
   * @throws Error with detailed validation failure message
   */
  static validate(ref: IndexInputRef): void {
    this.validateRefType(ref.refType);
    this.validateRefId(ref.refId);
    this.validateSourceModule(ref.sourceModule);
    this.validateRelationType(ref.relationType);
    this.validateObservedAt(ref.observedAt);
  }

  private static validateRefType(refType: RefType): void {
    if (!Object.values(RefType).includes(refType)) {
      throw new Error(`IndexInputRef.refType must be one of: ${Object.values(RefType).join(', ')}`);
    }
  }

  private static validateRefId(refId: string): void {
    if (!refId || typeof refId !== 'string') {
      throw new Error('IndexInputRef.refId must be a non-empty string');
    }
  }

  private static validateSourceModule(sourceModule: string): void {
    if (!sourceModule || typeof sourceModule !== 'string') {
      throw new Error('IndexInputRef.sourceModule must be a non-empty string');
    }
  }

  private static validateRelationType(relationType: RelationType): void {
    if (!Object.values(RelationType).includes(relationType)) {
      throw new Error(`IndexInputRef.relationType must be one of: ${Object.values(RelationType).join(', ')}`);
    }
  }

  private static validateObservedAt(observedAt: Date): void {
    if (!(observedAt instanceof Date) || isNaN(observedAt.getTime())) {
      throw new Error('IndexInputRef.observedAt must be a valid Date');
    }
  }
}
