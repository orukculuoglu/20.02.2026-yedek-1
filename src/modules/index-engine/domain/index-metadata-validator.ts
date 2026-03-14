import { IndexMetadata } from './schemas/index-metadata';

/**
 * Validates IndexMetadata contracts.
 */
export class IndexMetadataValidator {
  /**
   * Validates a complete IndexMetadata object.
   * 
   * @param metadata - The IndexMetadata to validate
   * @throws Error with detailed validation failure message
   */
  static validate(metadata: IndexMetadata): void {
    this.validateEventCount(metadata.eventCount);
    this.validateSourceCount(metadata.sourceCount);
    this.validateCalculationModel(metadata.calculationModel);
    this.validateOptionalFields(metadata);
  }

  private static validateEventCount(eventCount: number): void {
    if (typeof eventCount !== 'number' || eventCount < 0) {
      throw new Error('IndexMetadata.eventCount must be a non-negative number');
    }
  }

  private static validateSourceCount(sourceCount: number): void {
    if (typeof sourceCount !== 'number' || sourceCount < 0) {
      throw new Error('IndexMetadata.sourceCount must be a non-negative number');
    }
  }

  private static validateCalculationModel(calculationModel: string): void {
    if (typeof calculationModel !== 'string' || !calculationModel.trim()) {
      throw new Error('IndexMetadata.calculationModel must be a non-empty string');
    }
  }

  private static validateOptionalFields(metadata: IndexMetadata): void {
    if (metadata.vehicleYear !== undefined && typeof metadata.vehicleYear !== 'number') {
      throw new Error('IndexMetadata.vehicleYear must be a number');
    }

    if (metadata.dataFreshnessInDays !== undefined && typeof metadata.dataFreshnessInDays !== 'number') {
      throw new Error('IndexMetadata.dataFreshnessInDays must be a number');
    }

    if (metadata.dataFreshnessInDays !== undefined && metadata.dataFreshnessInDays < 0) {
      throw new Error('IndexMetadata.dataFreshnessInDays must be non-negative');
    }

    if (metadata.tags !== undefined && typeof metadata.tags !== 'object') {
      throw new Error('IndexMetadata.tags must be an object');
    }

    if (metadata.caveats !== undefined && !Array.isArray(metadata.caveats)) {
      throw new Error('IndexMetadata.caveats must be an array');
    }
  }
}
