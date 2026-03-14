import { IndexCalculationRequest } from './schemas/index-calculation-request';
import { IndexType } from '../enums/index-type';

/**
 * Validates IndexCalculationRequest contracts.
 */
export class IndexCalculationRequestValidator {
  /**
   * Validates a complete IndexCalculationRequest object.
   * 
   * @param request - The IndexCalculationRequest to validate
   * @throws Error with detailed validation failure message
   */
  static validate(request: IndexCalculationRequest): void {
    this.validateIndexType(request.indexType);
    this.validateInput(request.input);
    this.validateRequestedAt(request.requestedAt);
    if (request.weightingProfile) {
      this.validateWeightingProfile(request.weightingProfile);
    }
  }

  private static validateIndexType(indexType: IndexType): void {
    if (!Object.values(IndexType).includes(indexType)) {
      throw new Error(`IndexCalculationRequest.indexType must be one of: ${Object.values(IndexType).join(', ')}`);
    }
  }

  private static validateInput(input: any): void {
    if (!input || typeof input !== 'object') {
      throw new Error('IndexCalculationRequest.input must be an IndexInput object');
    }
  }

  private static validateRequestedAt(requestedAt: Date): void {
    if (!(requestedAt instanceof Date) || isNaN(requestedAt.getTime())) {
      throw new Error('IndexCalculationRequest.requestedAt must be a valid Date');
    }
  }

  private static validateWeightingProfile(profile: any): void {
    if (!profile.profileId || typeof profile.profileId !== 'string') {
      throw new Error('WeightingProfile.profileId must be a non-empty string');
    }
    if (!profile.weights || typeof profile.weights !== 'object') {
      throw new Error('WeightingProfile.weights must be an object');
    }
  }
}
