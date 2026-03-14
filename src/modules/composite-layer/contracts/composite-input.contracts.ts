/**
 * Canonical contract definitions for each composite type
 * Declares which inputs are allowed and required
 */

import { CompositeType } from '../core/composite.enums';
import {
  CompositeInputIndexType,
  CompositeInputRequirement,
  CompositeValidityPolicy,
} from './composite-input.enums';
import type {
  CompositeInputContractDefinition,
  CompositeInputSlotDefinition,
} from './composite-input.types';

/**
 * VEHICLE_HEALTH contract
 * Combines reliability, maintenance readiness, operational readiness, and data quality
 */
const vehicleHealthSlots: CompositeInputSlotDefinition[] = [
  {
    slotKey: 'reliability',
    allowedIndexType: CompositeInputIndexType.RELIABILITY_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.7,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Historical reliability performance required',
  },
  {
    slotKey: 'maintenance',
    allowedIndexType: CompositeInputIndexType.MAINTENANCE_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Maintenance status and backlog required',
  },
  {
    slotKey: 'readiness',
    allowedIndexType: CompositeInputIndexType.OPERATIONAL_READINESS_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.65,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Operational readiness status required',
  },
  {
    slotKey: 'insurance',
    allowedIndexType: CompositeInputIndexType.INSURANCE_RISK_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Insurance risk optional but improves estimate',
  },
  {
    slotKey: 'dataQuality',
    allowedIndexType: CompositeInputIndexType.DATA_QUALITY_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.5,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Data freshness and completeness required',
  },
];

export const VEHICLE_HEALTH_CONTRACT: CompositeInputContractDefinition = {
  compositeType: CompositeType.VEHICLE_HEALTH,
  slots: vehicleHealthSlots,
  minimumRequiredInputs: 4,
  description: 'Vehicle health requires reliability, maintenance, readiness, and data quality',
  version: '1.0.0',
};

/**
 * OPERATIONAL_RISK contract
 * Combines readiness, maintenance, reliability, and optionally data quality
 */
const operationalRiskSlots: CompositeInputSlotDefinition[] = [
  {
    slotKey: 'readiness',
    allowedIndexType: CompositeInputIndexType.OPERATIONAL_READINESS_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.65,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Operational readiness required',
  },
  {
    slotKey: 'maintenance',
    allowedIndexType: CompositeInputIndexType.MAINTENANCE_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Maintenance status required',
  },
  {
    slotKey: 'reliability',
    allowedIndexType: CompositeInputIndexType.RELIABILITY_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.7,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Reliability history required',
  },
  {
    slotKey: 'dataQuality',
    allowedIndexType: CompositeInputIndexType.DATA_QUALITY_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.5,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Data quality optional for risk assessment',
  },
];

export const OPERATIONAL_RISK_CONTRACT: CompositeInputContractDefinition = {
  compositeType: CompositeType.OPERATIONAL_RISK,
  slots: operationalRiskSlots,
  minimumRequiredInputs: 3,
  description: 'Operational risk requires readiness, maintenance, and reliability',
  version: '1.0.0',
};

/**
 * INSURANCE_EXPOSURE contract
 * Combines insurance risk and maintenance, optionally reliability and data quality
 */
const insuranceExposureSlots: CompositeInputSlotDefinition[] = [
  {
    slotKey: 'insurance',
    allowedIndexType: CompositeInputIndexType.INSURANCE_RISK_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Insurance risk exposure required',
  },
  {
    slotKey: 'maintenance',
    allowedIndexType: CompositeInputIndexType.MAINTENANCE_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Maintenance backlog affects exposure',
  },
  {
    slotKey: 'reliability',
    allowedIndexType: CompositeInputIndexType.RELIABILITY_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.7,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Reliability history optional for exposure assessment',
  },
  {
    slotKey: 'dataQuality',
    allowedIndexType: CompositeInputIndexType.DATA_QUALITY_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.5,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Data quality optional',
  },
];

export const INSURANCE_EXPOSURE_CONTRACT: CompositeInputContractDefinition = {
  compositeType: CompositeType.INSURANCE_EXPOSURE,
  slots: insuranceExposureSlots,
  minimumRequiredInputs: 2,
  description: 'Insurance exposure requires insurance risk and maintenance',
  version: '1.0.0',
};

/**
 * FLEET_VEHICLE contract
 * Combines reliability, maintenance, data quality, optionally readiness and insurance
 */
const fleetVehicleSlots: CompositeInputSlotDefinition[] = [
  {
    slotKey: 'reliability',
    allowedIndexType: CompositeInputIndexType.RELIABILITY_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.7,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Reliability required for fleet comparison',
  },
  {
    slotKey: 'maintenance',
    allowedIndexType: CompositeInputIndexType.MAINTENANCE_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Maintenance status required',
  },
  {
    slotKey: 'dataQuality',
    allowedIndexType: CompositeInputIndexType.DATA_QUALITY_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.5,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Data quality required for fleet metrics',
  },
  {
    slotKey: 'readiness',
    allowedIndexType: CompositeInputIndexType.OPERATIONAL_READINESS_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.65,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Readiness optional for fleet comparison',
  },
  {
    slotKey: 'insurance',
    allowedIndexType: CompositeInputIndexType.INSURANCE_RISK_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Insurance risk optional for fleet analysis',
  },
];

export const FLEET_VEHICLE_CONTRACT: CompositeInputContractDefinition = {
  compositeType: CompositeType.FLEET_VEHICLE,
  slots: fleetVehicleSlots,
  minimumRequiredInputs: 3,
  description: 'Fleet vehicle comparison requires reliability, maintenance, and data quality',
  version: '1.0.0',
};

/**
 * TRUST_ADJUSTED contract
 * Requires data quality, all other indexes optional
 */
const trustAdjustedSlots: CompositeInputSlotDefinition[] = [
  {
    slotKey: 'reliability',
    allowedIndexType: CompositeInputIndexType.RELIABILITY_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.7,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Reliability optional in trust-adjusted model',
  },
  {
    slotKey: 'maintenance',
    allowedIndexType: CompositeInputIndexType.MAINTENANCE_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Maintenance optional in trust-adjusted model',
  },
  {
    slotKey: 'insurance',
    allowedIndexType: CompositeInputIndexType.INSURANCE_RISK_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.6,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Insurance risk optional in trust-adjusted model',
  },
  {
    slotKey: 'readiness',
    allowedIndexType: CompositeInputIndexType.OPERATIONAL_READINESS_INDEX,
    requirement: CompositeInputRequirement.OPTIONAL,
    minimumConfidence: 0.65,
    validityPolicy: CompositeValidityPolicy.LENIENT,
    description: 'Readiness optional in trust-adjusted model',
  },
  {
    slotKey: 'dataQuality',
    allowedIndexType: CompositeInputIndexType.DATA_QUALITY_INDEX,
    requirement: CompositeInputRequirement.REQUIRED,
    minimumConfidence: 0.5,
    validityPolicy: CompositeValidityPolicy.STRICT,
    description: 'Data quality required for trust adjustment',
  },
];

export const TRUST_ADJUSTED_CONTRACT: CompositeInputContractDefinition = {
  compositeType: CompositeType.TRUST_ADJUSTED,
  slots: trustAdjustedSlots,
  minimumRequiredInputs: 1,
  description: 'Trust-adjusted model requires only data quality index',
  version: '1.0.0',
};

/**
 * Registry of all composite input contracts
 * Keyed by CompositeType for deterministic lookup
 */
export const CompositeInputContractRegistry: Record<
  CompositeType,
  CompositeInputContractDefinition
> = {
  [CompositeType.VEHICLE_HEALTH]: VEHICLE_HEALTH_CONTRACT,
  [CompositeType.OPERATIONAL_RISK]: OPERATIONAL_RISK_CONTRACT,
  [CompositeType.INSURANCE_EXPOSURE]: INSURANCE_EXPOSURE_CONTRACT,
  [CompositeType.FLEET_VEHICLE]: FLEET_VEHICLE_CONTRACT,
  [CompositeType.TRUST_ADJUSTED]: TRUST_ADJUSTED_CONTRACT,
};
