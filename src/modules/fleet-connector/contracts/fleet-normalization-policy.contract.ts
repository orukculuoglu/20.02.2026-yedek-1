/**
 * Fleet Normalization Policy Contract
 * 
 * Defines the contract for normalization policies.
 * 
 * A normalization policy specifies the requirements and behavior for normalizing
 * external fleet records from a specific connector or provider type.
 * 
 * Policies are configuration contracts only:
 * - No runtime normalization logic
 * - No field validation or transformation
 * - Specify requirements and thresholds only
 * - Ready for consumption by a separate normalization engine
 * 
 * Contract-only: contains no runtime normalization logic.
 */

/**
 * FleetNormalizationPolicyStatus
 * 
 * Status of a normalization policy.
 */
export enum FleetNormalizationPolicyStatus {
  /** Policy is active and in use */
  ACTIVE = 'active',
  
  /** Policy is inactive and not applied */
  INACTIVE = 'inactive',
  
  /** Policy is in draft state, not yet applied */
  DRAFT = 'draft',
}

/**
 * FleetNormalizationRequiredField
 * 
 * Enumeration of fields that can be required by a normalization policy.
 * 
 * These represent the key data points that normalization can enforce as required.
 * Policies specify which fields must be present in external records.
 */
export enum FleetNormalizationRequiredField {
  /** External record reference must be present */
  EXTERNAL_RECORD_REF = 'external-record-ref',
  
  /** Connector ID must be present */
  CONNECTOR_ID = 'connector-id',
  
  /** Provider name must be present */
  PROVIDER_NAME = 'provider-name',
  
  /** Operational status must be present and valid */
  OPERATIONAL_STATUS = 'operational-status',
  
  /** Rental status must be present and valid */
  RENTAL_STATUS = 'rental-status',
  
  /** Maintenance status must be present and valid */
  MAINTENANCE_STATUS = 'maintenance-status',
  
  /** Source updated timestamp must be present */
  SOURCE_UPDATED_AT = 'source-updated-at',
}

/**
 * FleetNormalizationPolicy
 * 
 * Policy configuration for normalizing external fleet records.
 * 
 * A normalization policy specifies:
 * - Which fields are required in external records
 * - Whether partial records are allowed
 * - Whether to quarantine on critical issues
 * - Scope (connector-specific or provider-type generic)
 * 
 * Policies are configuration contracts intended for consumption by a
 * separate normalization engine. This interface does NOT contain
 * runtime normalization logic.
 * 
 * Security:
 * - No sensitive field requirements
 * - No transformation logic
 * - No validation rules beyond field presence
 * 
 * Timestamps:
 * - createdAt: when policy was created (caller-provided)
 * - updatedAt: when policy was last modified (caller-provided)
 * 
 * Applicability:
 * - Can be connector-specific (connectorId set)
 * - Can be provider-generic (providerType set)
 * - Connector-specific policies take precedence
 */
export interface FleetNormalizationPolicy {
  /**
   * Unique identifier for this policy.
   * 
   * Generated internally to uniquely identify this policy configuration.
   */
  policyId: string;
  
  /**
   * Connector ID this policy applies to (optional).
   * 
   * If set, this policy applies only to records from this specific connector.
   * If absent, this policy applies to the provider type instead (see providerType).
   * 
   * Connector-specific policies take precedence over provider-type policies.
   */
  connectorId?: string;
  
  /**
   * Provider type this policy applies to (optional).
   * 
   * If set, this policy applies to all connectors of this provider type
   * that do not have a more specific connector-level policy.
   * 
   * If connectorId is set, this field should be absent.
   * 
   * Examples: "sonepar", "fleet-management", "erp-system"
   */
  providerType?: string;
  
  /**
   * Status of this policy.
   * 
   * Indicates whether policy is active, inactive, or still in draft.
   * Only ACTIVE policies are applied during normalization.
   */
  status: FleetNormalizationPolicyStatus;
  
  /**
   * Required fields for normalized records under this policy.
   * 
   * Specifies which fields must be present in external records
   * for normalization to accept the record (or accept-with-warnings).
   * 
   * Examples: ["external-record-ref", "connector-id", "operational-status"]
   */
  requiredFields: FleetNormalizationRequiredField[];
  
  /**
   * Whether to allow partial records (some optional fields missing).
   * 
   * true: Records with missing optional fields are accepted
   * false: Records must have all non-explicitly-optional fields
   * 
   * This applies to fields not in requiredFields list.
   */
  allowPartialRecords: boolean;
  
  /**
   * Whether to quarantine records when critical issues are detected.
   * 
   * true: Any CRITICAL severity issue causes record to be quarantined
   * false: CRITICAL issues may be overridden (depends on caller)
   * 
   * Quarantined records are not released for use until manually reviewed.
   */
  quarantineOnCriticalIssue: boolean;
  
  /**
   * ISO 8601 timestamp when this policy was created.
   * 
   * Caller-provided, not generated locally.
   * Used to track policy age and evolution.
   * 
   * Format: "2024-01-15T10:30:00Z" or "2024-01-15T10:30:00+02:00"
   */
  createdAt: string;
  
  /**
   * ISO 8601 timestamp when this policy was last updated.
   * 
   * Caller-provided, not generated locally.
   * Used to track when policy requirements changed.
   * Initially same as createdAt.
   * 
   * Format: "2024-01-15T10:30:00Z" or "2024-01-15T10:30:00+02:00"
   */
  updatedAt: string;
}
