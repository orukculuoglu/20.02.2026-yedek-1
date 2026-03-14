/**
 * Enumeration of composite measurement types
 * Each composite represents a higher-level measurement derived from base indexes
 */
export enum CompositeType {
  /**
   * Overall vehicle health assessment combining reliability, maintenance, and data quality
   */
  VEHICLE_HEALTH = 'VEHICLE_HEALTH',

  /**
   * Operational risk assessment combining maintenance urgency and reliability
   */
  OPERATIONAL_RISK = 'OPERATIONAL_RISK',

  /**
   * Insurance exposure assessment combining insurance risk and operational readiness
   */
  INSURANCE_EXPOSURE = 'INSURANCE_EXPOSURE',

  /**
   * Fleet vehicle performance comparison composite
   */
  FLEET_VEHICLE = 'FLEET_VEHICLE',

  /**
   * Trust-adjusted composite with provenance and data quality factored
   */
  TRUST_ADJUSTED = 'TRUST_ADJUSTED',
}
