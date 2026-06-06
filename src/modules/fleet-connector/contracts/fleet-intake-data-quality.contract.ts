/**
 * Fleet Intake Data Quality Contract
 * 
 * Defines the contract for data quality findings during evaluation.
 * 
 * Data quality findings are enumerated issues detected during evaluation
 * that may affect usability or reliability of the normalized record.
 * 
 * Each finding is:
 * - Enum-based (no free-text messages)
 * - Severity-classified
 * - Traceable to the evaluation input
 * - Used to inform acceptance decisions
 * 
 * Contract-only: contains no runtime evaluation logic.
 */

/**
 * FleetIntakeDataQualitySeverity
 * 
 * Severity level of a data quality finding.
 * Used to determine impact on acceptance and routing decisions.
 */
export enum FleetIntakeDataQualitySeverity {
  /** Informational - no impact on usability */
  INFO = 'info',
  
  /** Warning - potential issue but usable */
  WARNING = 'warning',
  
  /** Error - issue affecting usability */
  ERROR = 'error',
  
  /** Critical - record may not be usable */
  CRITICAL = 'critical',
}

/**
 * FleetIntakeDataQualityCode
 * 
 * Standardized data quality issue codes.
 * No free-text messages - all issues are enumerated.
 */
export enum FleetIntakeDataQualityCode {
  /** Required field is missing from the record */
  MISSING_REQUIRED_FIELD = 'missing-required-field',
  
  /** Multiple status fields are inconsistent with each other */
  INCONSISTENT_STATUS = 'inconsistent-status',
  
  /** Source record last updated is stale/old */
  STALE_SOURCE_RECORD = 'stale-source-record',
  
  /** Mileage value is invalid or impossible */
  INVALID_MILEAGE = 'invalid-mileage',
  
  /** Status combination is unsupported or invalid */
  UNSUPPORTED_STATUS_COMBINATION = 'unsupported-status-combination',
  
  /** This normalized record appears to be a duplicate */
  DUPLICATE_NORMALIZED_RECORD = 'duplicate-normalized-record',
  
  /** Connector scope does not match connector access level */
  CONNECTOR_SCOPE_MISMATCH = 'connector-scope-mismatch',
  
  /** Operational context is incomplete (missing related data) */
  INCOMPLETE_OPERATIONAL_CONTEXT = 'incomplete-operational-context',
  
  /** Rental state is blocked but reason code missing */
  BLOCKED_RENTAL_STATE = 'blocked-rental-state',
  
  /** Service state conflicts with operational state */
  SERVICE_STATE_CONFLICT = 'service-state-conflict',
}

/**
 * FleetIntakeDataQualityFinding
 * 
 * A single data quality finding from evaluation.
 * 
 * Safety principles:
 * - No free-text message field
 * - No raw data field
 * - All information encoded in enum codes and severity
 * - Severity determines impact on acceptance
 */
export interface FleetIntakeDataQualityFinding {
  /** Unique identifier for this finding */
  findingId: string;
  
  /** Evaluation input that produced this finding */
  evaluationInputId: string;
  
  /** Connector context */
  connectorId: string;
  
  /** Tenant context */
  tenantId: string;
  
  /** Fleet context (optional) */
  fleetId?: string;
  
  /** Severity of this finding */
  severity: FleetIntakeDataQualitySeverity;
  
  /** Standardized code identifying the issue */
  code: FleetIntakeDataQualityCode;
  
  /**
   * When this finding was created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller at finding creation time.
   */
  createdAt: string;
}
