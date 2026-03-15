import type { CompositeInputIndexType } from '../contracts/composite-input.enums';
import type { CompositeType } from '../core/composite.enums';
import { CompositeType as CompositeTypeEnum } from '../core/composite.enums';

/**
 * Deterministic mapping of index types to affected composite types.
 */
const COMPOSITE_TRIGGER_MAP: Record<CompositeInputIndexType, CompositeType[]> = {
  RELIABILITY_INDEX: [
    CompositeTypeEnum.VEHICLE_HEALTH,
    CompositeTypeEnum.OPERATIONAL_RISK,
    CompositeTypeEnum.INSURANCE_EXPOSURE,
    CompositeTypeEnum.FLEET_VEHICLE,
    CompositeTypeEnum.TRUST_ADJUSTED,
  ],
  MAINTENANCE_INDEX: [
    CompositeTypeEnum.VEHICLE_HEALTH,
    CompositeTypeEnum.OPERATIONAL_RISK,
    CompositeTypeEnum.INSURANCE_EXPOSURE,
    CompositeTypeEnum.FLEET_VEHICLE,
    CompositeTypeEnum.TRUST_ADJUSTED,
  ],
  INSURANCE_RISK_INDEX: [
    CompositeTypeEnum.VEHICLE_HEALTH,
    CompositeTypeEnum.INSURANCE_EXPOSURE,
    CompositeTypeEnum.FLEET_VEHICLE,
    CompositeTypeEnum.TRUST_ADJUSTED,
  ],
  OPERATIONAL_READINESS_INDEX: [
    CompositeTypeEnum.VEHICLE_HEALTH,
    CompositeTypeEnum.OPERATIONAL_RISK,
    CompositeTypeEnum.FLEET_VEHICLE,
    CompositeTypeEnum.TRUST_ADJUSTED,
  ],
  DATA_QUALITY_INDEX: [
    CompositeTypeEnum.VEHICLE_HEALTH,
    CompositeTypeEnum.OPERATIONAL_RISK,
    CompositeTypeEnum.INSURANCE_EXPOSURE,
    CompositeTypeEnum.FLEET_VEHICLE,
    CompositeTypeEnum.TRUST_ADJUSTED,
  ],
};

/**
 * Get affected composite types for a given index type.
 *
 * Returns deterministic ordered list of composite types that should be
 * recalculated when the given index type changes.
 *
 * @param indexType - Source index type
 * @returns Deterministically ordered array of affected CompositeType values
 */
export function getAffectedCompositeTypesForIndex(
  indexType: CompositeInputIndexType,
): CompositeType[] {
  return COMPOSITE_TRIGGER_MAP[indexType] ?? [];
}

export { COMPOSITE_TRIGGER_MAP };
