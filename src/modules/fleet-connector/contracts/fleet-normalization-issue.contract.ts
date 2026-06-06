/**
 * Fleet Normalization Issue Contract
 * 
 * Defines contracts for issues detected during normalization.
 * 
 * Issues are enum-based and cannot contain free-text messages.
 * This ensures:
 * - Consistent issue classification
 * - Safe logging and storage
 * - No exposure of sensitive external data
 * - Proper internationalization support
 * 
 * Contract-only: contains no runtime normalization logic.
 */

/**
 * FleetNormalizationIssueSeverity
 * 
 * Severity level of a normalization issue.
 */
export enum FleetNormalizationIssueSeverity {
  /** Informational issue, does not affect acceptance */
  INFO = 'info',
  
  /** Warning condition, record still accepted but with caution flag */
  WARNING = 'warning',
  
  /** Error condition, record typically rejected */
  ERROR = 'error',
  
  /** Critical security or safety issue, record quarantined */
  CRITICAL = 'critical',
}

/**
 * FleetNormalizationIssueCode
 * 
 * Standardized codes for issues detected during normalization.
 * 
 * Codes are fixed, enumerated values - never free-text messages.
 * This ensures safe, consistent issue handling and reporting.
 */
export enum FleetNormalizationIssueCode {
  /** External record did not include brand field */
  MISSING_BRAND = 'missing-brand',
  
  /** External record did not include model field */
  MISSING_MODEL = 'missing-model',
  
  /** Year field present but value is invalid (out of range, non-numeric, etc.) */
  INVALID_YEAR = 'invalid-year',
  
  /** Mileage field present but value is invalid (negative, non-numeric, etc.) */
  INVALID_MILEAGE = 'invalid-mileage',
  
  /** External record contains unknown or unmapped operational status value */
  UNKNOWN_OPERATIONAL_STATUS = 'unknown-operational-status',
  
  /** External record contains unknown or unmapped rental status value */
  UNKNOWN_RENTAL_STATUS = 'unknown-rental-status',
  
  /** External record contains unknown or unmapped maintenance status value */
  UNKNOWN_MAINTENANCE_STATUS = 'unknown-maintenance-status',
  
  /** Scope of connector does not allow this record (e.g., wrong fleet, wrong tenant) */
  SCOPE_NOT_ALLOWED = 'scope-not-allowed',
  
  /** External record format is not supported by this connector */
  UNSUPPORTED_PROVIDER_FORMAT = 'unsupported-provider-format',
  
  /** Duplicate external record reference detected in same normalization result */
  DUPLICATE_EXTERNAL_RECORD = 'duplicate-external-record',
  
  /** External record contains sensitive field that normalization policy rejects */
  REJECTED_SENSITIVE_FIELD = 'rejected-sensitive-field',
}

/**
 * FleetNormalizationIssue
 * 
 * A single issue detected during normalization of an external record.
 * 
 * Issues are NOT free-text messages; they are enum-based codes.
 * This prevents exposure of sensitive external data and ensures
 * consistent handling across the system.
 * 
 * Security:
 * - No free-text message field
 * - No direct sensitive vehicle identity
 * - Contains only safe references and standard codes
 * 
 * Timestamps:
 * - createdAt: when issue was detected (caller-provided)
 * 
 * Traceability:
 * - Linked to normalized record via normalizedRecordId
 * - Linked to connector via connectorId
 * - Linked to normalization result via issueId
 */
export interface FleetNormalizationIssue {
  /**
   * Unique identifier for this issue.
   * 
   * Generated internally to track individual issues.
   * Used to correlate with normalization results.
   */
  issueId: string;
  
  /**
   * Normalized record ID this issue is associated with.
   * 
   * Links to FleetNormalizedVehicleRecord.normalizedRecordId.
   * Allows tracking which normalized record generated this issue.
   */
  normalizedRecordId: string;
  
  /**
   * Connector ID that processed the record.
   * 
   * Links to FleetConnectorConfig.
   * Used for filtering issues by connector.
   */
  connectorId: string;
  
  /**
   * Severity level of this issue.
   * 
   * Determines how the issue affects record acceptance:
   * - INFO: no impact on acceptance
   * - WARNING: record accepted with caution flag
   * - ERROR: record typically rejected
   * - CRITICAL: record quarantined for manual review
   */
  severity: FleetNormalizationIssueSeverity;
  
  /**
   * Standardized issue code.
   * 
   * Fixed enumerated value indicating the type of issue.
   * Never contains free-text description or external values.
   * 
   * Codes indicate what aspect of normalization failed or produced warnings.
   */
  code: FleetNormalizationIssueCode;
  
  /**
   * ISO 8601 timestamp when this issue was detected and created.
   * 
   * Caller-provided, not generated locally.
   * Used to track when issues were identified during normalization.
   * 
   * Format: "2024-01-15T10:30:00Z" or "2024-01-15T10:30:00+02:00"
   */
  createdAt: string;
}
