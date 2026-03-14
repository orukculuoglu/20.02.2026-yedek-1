import { IndexInputFeatureSet } from './schemas/index-input-feature-set';

/**
 * Validates IndexInputFeatureSet contracts.
 */
export class IndexInputFeatureSetValidator {
  /**
   * Validates a complete IndexInputFeatureSet object.
   * All fields are optional, but if present, must be valid.
   * 
   * @param featureSet - The IndexInputFeatureSet to validate
   * @throws Error with detailed validation failure message
   */
  static validate(featureSet: IndexInputFeatureSet): void {
    if (!featureSet || typeof featureSet !== 'object') {
      throw new Error('IndexInputFeatureSet must be an object');
    }
    
    this.validateOptionalNumberFields(featureSet);
    this.validateCustomFeatures(featureSet.customFeatures);
  }

  private static validateOptionalNumberFields(featureSet: IndexInputFeatureSet): void {
    const numberFields = [
      'repeatedFailureCount',
      'maintenanceDelayDays',
      'unresolvedSignalCount',
      'entityAgeInDays',
      'totalDataPoints',
    ] as const;

    numberFields.forEach((field) => {
      const value = featureSet[field];
      if (value !== undefined && typeof value !== 'number') {
        throw new Error(`IndexInputFeatureSet.${field} must be a number`);
      }
      if (value !== undefined && value < 0) {
        throw new Error(`IndexInputFeatureSet.${field} must be non-negative`);
      }
    });

    const scoreFields = ['sourceDiversity', 'eventRecencyScore', 'trustWeightedEvidenceScore', 'provenanceStrength', 'utilizationRate'] as const;

    scoreFields.forEach((field) => {
      const value = featureSet[field];
      if (value !== undefined) {
        if (typeof value !== 'number' || isNaN(value)) {
          throw new Error(`IndexInputFeatureSet.${field} must be a valid number`);
        }
        if (value < 0.0 || value > 1.0) {
          throw new Error(`IndexInputFeatureSet.${field} must be between 0.0 and 1.0`);
        }
      }
    });
  }

  private static validateCustomFeatures(customFeatures: Record<string, unknown> | undefined): void {
    if (customFeatures === undefined) {
      return;
    }

    if (typeof customFeatures !== 'object' || customFeatures === null) {
      throw new Error('IndexInputFeatureSet.customFeatures must be an object');
    }

    for (const [key, value] of Object.entries(customFeatures)) {
      const type = typeof value;
      if (type !== 'string' && type !== 'number' && type !== 'boolean') {
        throw new Error(`IndexInputFeatureSet.customFeatures.${key} must be a string, number, or boolean`);
      }
    }
  }
}
