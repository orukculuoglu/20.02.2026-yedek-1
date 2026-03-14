/**
 * Enumeration of all supported index types in the Index Engine.
 * Each index type measures a specific dimension of vehicle intelligence.
 * 
 * - RELIABILITY_INDEX: Measures vehicle component reliability and failure probability
 * - MAINTENANCE_INDEX: Measures maintenance urgency and service requirement patterns
 * - INSURANCE_RISK_INDEX: Measures insurance risk profile and claim likelihood
 * - OPERATIONAL_READINESS_INDEX: Measures vehicle operational status and availability
 * - DATA_QUALITY_INDEX: Measures data completeness, freshness, and reliability
 */
export enum IndexType {
  RELIABILITY_INDEX = 'RELIABILITY_INDEX',
  MAINTENANCE_INDEX = 'MAINTENANCE_INDEX',
  INSURANCE_RISK_INDEX = 'INSURANCE_RISK_INDEX',
  OPERATIONAL_READINESS_INDEX = 'OPERATIONAL_READINESS_INDEX',
  DATA_QUALITY_INDEX = 'DATA_QUALITY_INDEX',
}
