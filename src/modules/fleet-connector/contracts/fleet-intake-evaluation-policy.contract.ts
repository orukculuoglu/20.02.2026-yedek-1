/**
 * Fleet Intake Evaluation Policy Contract
 * 
 * Defines the contract for evaluation policy configuration.
 * 
 * Evaluation policies define the rules and thresholds that will be applied
 * during evaluation of normalized records. Policies are immutable contracts
 * with no runtime execution logic.
 * 
 * Policy configurations control:
 * - What fields are required
 * - What status combinations are valid
 * - When critical issues trigger quarantine
 * - When maintenance signals trigger routing
 * - When incomplete context requires review
 * 
 * Contract-only: contains no runtime policy execution logic.
 */

/**
 * FleetIntakeEvaluationPolicyStatus
 * 
 * Lifecycle status of an evaluation policy.
 */
export enum FleetIntakeEvaluationPolicyStatus {
  /** Policy is active and used for evaluation */
  ACTIVE = 'active',
  
  /** Policy is inactive and not used */
  INACTIVE = 'inactive',
  
  /** Policy is draft and not yet active */
  DRAFT = 'draft',
}

/**
 * FleetIntakeEvaluationRule
 * 
 * Individual evaluation rules that compose a policy.
 * Each rule represents a single evaluation concern or threshold.
 */
export enum FleetIntakeEvaluationRule {
  /** Operational status field is required for acceptance */
  REQUIRE_OPERATIONAL_STATUS = 'require-operational-status',
  
  /** Rental status field is required for acceptance */
  REQUIRE_RENTAL_STATUS = 'require-rental-status',
  
  /** Maintenance status field is required for acceptance */
  REQUIRE_MAINTENANCE_STATUS = 'require-maintenance-status',
  
  /** Critical data quality findings trigger quarantine */
  QUARANTINE_CRITICAL_FINDINGS = 'quarantine-critical-findings',
  
  /** Maintenance overdue findings trigger service routing candidate */
  ROUTE_MAINTENANCE_OVERDUE = 'route-maintenance-overdue',
  
  /** Open service state blocks acceptance */
  BLOCK_OPEN_SERVICE_STATE = 'block-open-service-state',
  
  /** Incomplete operational context requires manual review */
  REQUIRE_REVIEW_ON_INCOMPLETE_CONTEXT = 'require-review-on-incomplete-context',
}

/**
 * FleetIntakeEvaluationPolicy
 * 
 * Configuration for evaluation rules and thresholds.
 * 
 * Safety principles:
 * - Policy contract only
 * - No runtime rule execution logic
 * - Timestamps are caller-provided
 * - Policy defines configuration, not implementation
 * - Each enabled rule is enumerated
 */
export interface FleetIntakeEvaluationPolicy {
  /** Unique identifier for this policy */
  policyId: string;
  
  /**
   * Connector-specific policy (optional).
   * 
   * If provided, this policy applies to a specific connector.
   * If omitted, this policy is a default/fallback policy.
   */
  connectorId?: string;
  
  /** Tenant context */
  tenantId: string;
  
  /**
   * Fleet-specific policy (optional).
   * 
   * If provided, this policy applies to a specific fleet.
   * If omitted, policy applies to all fleets in the tenant.
   */
  fleetId?: string;
  
  /** Policy lifecycle status */
  status: FleetIntakeEvaluationPolicyStatus;
  
  /**
   * Rules enabled in this policy.
   * 
   * Each enabled rule controls an aspect of evaluation.
   * Rules are enumerated - no free-text configurations.
   */
  enabledRules: FleetIntakeEvaluationRule[];
  
  /**
   * When this policy was created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller at policy creation time.
   */
  createdAt: string;
  
  /**
   * When this policy was last updated.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller when policy is updated.
   */
  updatedAt: string;
}
