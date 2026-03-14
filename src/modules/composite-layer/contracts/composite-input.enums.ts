/**
 * Enumeration of index types that can be inputs to composite calculations
 */
export enum CompositeInputIndexType {
  /**
   * Reliability index - measures historical reliability patterns
   */
  RELIABILITY_INDEX = 'RELIABILITY_INDEX',

  /**
   * Maintenance index - measures maintenance urgency and backlog
   */
  MAINTENANCE_INDEX = 'MAINTENANCE_INDEX',

  /**
   * Insurance risk index - measures insurance exposure
   */
  INSURANCE_RISK_INDEX = 'INSURANCE_RISK_INDEX',

  /**
   * Operational readiness index - measures readiness for operation
   */
  OPERATIONAL_READINESS_INDEX = 'OPERATIONAL_READINESS_INDEX',

  /**
   * Data quality index - measures data freshness and completeness
   */
  DATA_QUALITY_INDEX = 'DATA_QUALITY_INDEX',
}

/**
 * Requirement level for composite input slots
 */
export enum CompositeInputRequirement {
  /**
   * This input must be present for composite validation to succeed
   */
  REQUIRED = 'REQUIRED',

  /**
   * This input is optional but improves confidence if present
   */
  OPTIONAL = 'OPTIONAL',
}

/**
 * Eligibility status for an input against a slot definition
 */
export enum CompositeInputEligibilityStatus {
  /**
   * Input is eligible and can be used
   */
  ELIGIBLE = 'ELIGIBLE',

  /**
   * Required input is missing
   */
  MISSING_REQUIRED = 'MISSING_REQUIRED',

  /**
   * Input confidence is below the threshold
   */
  BELOW_CONFIDENCE_THRESHOLD = 'BELOW_CONFIDENCE_THRESHOLD',

  /**
   * Input is outside its validity window
   */
  OUTSIDE_VALIDITY_WINDOW = 'OUTSIDE_VALIDITY_WINDOW',

  /**
   * Input type is not allowed for this slot
   */
  TYPE_NOT_ALLOWED = 'TYPE_NOT_ALLOWED',

  /**
   * Input reference is malformed or invalid
   */
  INVALID_REFERENCE = 'INVALID_REFERENCE',
}

/**
 * Validity enforcement policy for composite inputs
 */
export enum CompositeValidityPolicy {
  /**
   * STRICT: Input must be explicitly within validity window
   * Absence of validFrom/validTo does not grant automatic eligibility
   */
  STRICT = 'STRICT',

  /**
   * LENIENT: Allow missing validity metadata
   * Input is allowed unless explicitly outside a defined window
   */
  LENIENT = 'LENIENT',
}
