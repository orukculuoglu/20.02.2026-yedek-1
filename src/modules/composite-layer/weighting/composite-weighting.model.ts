/**
 * Deterministic base weight profiles for each composite type
 */

import { CompositeType } from '../core/composite.enums';
import type { CompositeWeightProfile, CompositeWeightDefinition } from './composite-weighting.types';
import { getCompositeInputContract } from '../contracts/composite-input.validation';

/**
 * VEHICLE_HEALTH weight profile
 * Combines reliability, maintenance, readiness, insurance, and data quality
 *
 * Weights sum to 1.0
 */
const vehicleHealthWeights: CompositeWeightDefinition[] = [
  { slotKey: 'reliability', weight: 0.30 },
  { slotKey: 'maintenance', weight: 0.25 },
  { slotKey: 'readiness', weight: 0.20 },
  { slotKey: 'insurance', weight: 0.10 },
  { slotKey: 'dataQuality', weight: 0.15 },
];

export const VEHICLE_HEALTH_WEIGHT_PROFILE: CompositeWeightProfile = {
  compositeType: CompositeType.VEHICLE_HEALTH,
  weights: vehicleHealthWeights,
  version: '1.0.0',
};

/**
 * OPERATIONAL_RISK weight profile
 * Combines readiness, maintenance, reliability, and data quality
 *
 * Weights sum to 1.0
 */
const operationalRiskWeights: CompositeWeightDefinition[] = [
  { slotKey: 'readiness', weight: 0.35 },
  { slotKey: 'maintenance', weight: 0.30 },
  { slotKey: 'reliability', weight: 0.25 },
  { slotKey: 'dataQuality', weight: 0.10 },
];

export const OPERATIONAL_RISK_WEIGHT_PROFILE: CompositeWeightProfile = {
  compositeType: CompositeType.OPERATIONAL_RISK,
  weights: operationalRiskWeights,
  version: '1.0.0',
};

/**
 * INSURANCE_EXPOSURE weight profile
 * Combines insurance risk, maintenance, reliability, and data quality
 *
 * Weights sum to 1.0
 */
const insuranceExposureWeights: CompositeWeightDefinition[] = [
  { slotKey: 'insurance', weight: 0.40 },
  { slotKey: 'maintenance', weight: 0.30 },
  { slotKey: 'reliability', weight: 0.20 },
  { slotKey: 'dataQuality', weight: 0.10 },
];

export const INSURANCE_EXPOSURE_WEIGHT_PROFILE: CompositeWeightProfile = {
  compositeType: CompositeType.INSURANCE_EXPOSURE,
  weights: insuranceExposureWeights,
  version: '1.0.0',
};

/**
 * FLEET_VEHICLE weight profile
 * Combines reliability, maintenance, data quality, readiness, and insurance
 *
 * Weights sum to 1.0
 */
const fleetVehicleWeights: CompositeWeightDefinition[] = [
  { slotKey: 'reliability', weight: 0.30 },
  { slotKey: 'maintenance', weight: 0.25 },
  { slotKey: 'dataQuality', weight: 0.20 },
  { slotKey: 'readiness', weight: 0.15 },
  { slotKey: 'insurance', weight: 0.10 },
];

export const FLEET_VEHICLE_WEIGHT_PROFILE: CompositeWeightProfile = {
  compositeType: CompositeType.FLEET_VEHICLE,
  weights: fleetVehicleWeights,
  version: '1.0.0',
};

/**
 * TRUST_ADJUSTED weight profile
 * Data quality dominant with optional contributions from other indexes
 *
 * Weights sum to 1.0
 */
const trustAdjustedWeights: CompositeWeightDefinition[] = [
  { slotKey: 'dataQuality', weight: 0.50 },
  { slotKey: 'reliability', weight: 0.20 },
  { slotKey: 'maintenance', weight: 0.15 },
  { slotKey: 'insurance', weight: 0.10 },
  { slotKey: 'readiness', weight: 0.05 },
];

export const TRUST_ADJUSTED_WEIGHT_PROFILE: CompositeWeightProfile = {
  compositeType: CompositeType.TRUST_ADJUSTED,
  weights: trustAdjustedWeights,
  version: '1.0.0',
};

/**
 * Registry of all composite weight profiles
 * Keyed by CompositeType for deterministic lookup
 */
export const CompositeWeightProfiles: Record<CompositeType, CompositeWeightProfile> = {
  [CompositeType.VEHICLE_HEALTH]: VEHICLE_HEALTH_WEIGHT_PROFILE,
  [CompositeType.OPERATIONAL_RISK]: OPERATIONAL_RISK_WEIGHT_PROFILE,
  [CompositeType.INSURANCE_EXPOSURE]: INSURANCE_EXPOSURE_WEIGHT_PROFILE,
  [CompositeType.FLEET_VEHICLE]: FLEET_VEHICLE_WEIGHT_PROFILE,
  [CompositeType.TRUST_ADJUSTED]: TRUST_ADJUSTED_WEIGHT_PROFILE,
};

/**
 * Validate that all weight profiles sum to exactly 1.0 and match contracts
 * Throws if validation fails
 *
 * Checks:
 * - sum(weights) === 1.0 within deterministic tolerance
 * - no duplicate slotKey inside a profile
 * - every slotKey exists in the composite input contract for the same compositeType
 */
export function validateWeightProfiles(): void {
  for (const [compositeType, profile] of Object.entries(CompositeWeightProfiles)) {
    // Check sum === 1.0
    const sum = profile.weights.reduce((acc, w) => acc + w.weight, 0);
    if (Math.abs(sum - 1.0) > 1e-10) {
      throw new Error(
        `Weight profile for ${compositeType} sums to ${sum}, expected 1.0`,
      );
    }

    // Check no duplicate slotKeys
    const slotKeys = new Set<string>();
    for (const weightDef of profile.weights) {
      if (slotKeys.has(weightDef.slotKey)) {
        throw new Error(
          `Weight profile for ${compositeType} has duplicate slotKey: ${weightDef.slotKey}`,
        );
      }
      slotKeys.add(weightDef.slotKey);
    }

    // Check every slotKey exists in contract
    try {
      const contract = getCompositeInputContract(compositeType as CompositeType);
      for (const weightDef of profile.weights) {
        const slotExists = contract.slots.some((slot) => slot.slotKey === weightDef.slotKey);
        if (!slotExists) {
          throw new Error(
            `Weight profile for ${compositeType} references slotKey '${weightDef.slotKey}' that does not exist in the input contract`,
          );
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `Failed to validate weight profile for ${compositeType} against contract`,
      );
    }
  }
}
