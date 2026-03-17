/**
 * Dispatch Escalation Eligibility Types
 *
 * Models the conditions and criteria that determine whether a dispatch is eligible for escalation.
 *
 * Purpose:
 * Escalation eligibility explicitly captures what circumstances allow or prevent escalation,
 * separate from escalation policy constraints. Provides deterministic eligibility judgement.
 */

/**
 * Escalation Eligibility Status Enum
 *
 * Represents the current eligibility state for a dispatch escalation.
 *
 * States:
 * - ELIGIBLE: Dispatch is eligible for escalation
 * - NOT_ELIGIBLE: Dispatch is not eligible for escalation
 * - ELIGIBILITY_PENDING: Eligibility cannot be determined yet
 * - CONDITION_DEPENDENT: Eligibility depends on external conditions
 */
export enum EscalationEligibilityStatus {
  ELIGIBLE = 'ELIGIBLE',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  ELIGIBILITY_PENDING = 'ELIGIBILITY_PENDING',
  CONDITION_DEPENDENT = 'CONDITION_DEPENDENT',
}

/**
 * Escalation Eligibility Criteria Type
 *
 * Defines the structured criteria used to determine escalation eligibility.
 *
 * Criteria may include:
 * - Failure type examination (escalatable vs non-escalatable)
 * - Dispatch actor state
 * - Delivery channel state
 * - Temporal constraints
 * - Business rules constraints
 * - Resource availability
 *
 * Immutable:
 * Eligibility criteria are immutable once created.
 */
export interface EscalationEligibilityCriteria {
  /**
   * Unique identifier for this eligibility criteria
   * Explicitly provided from escalation policy evaluation layer
   */
  criteriaId: string;

  /**
   * The dispatch ID this criteria applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Failure classification that may allow or prevent escalation
   * Examples: PERMANENT_ERROR, TIMEOUT, ACTOR_UNAVAILABLE
   * Determines eligibility based on failure type
   */
  failureClassification: string;

  /**
   * Actor availability state that affects escalation eligibility
   * Examples: AVAILABLE, UNAVAILABLE, UNKNOWN
   * Determines if target actor can be contacted for escalation
   */
  actorAvailability: string;

  /**
   * Channel operability state that affects escalation eligibility
   * Examples: OPERATIONAL, DEGRADED, OFFLINE
   * Determines if escalation channels are functional
   */
  channelOperability: string;

  /**
   * Temporal constraint that may block escalations
   * Examples: WITHIN_ESCALATION_WINDOW, OUTSIDE_ESCALATION_WINDOW
   * Determines if current time allows escalation attempt
   */
  temporalConstraint: string;

  /**
   * Business rule that may block eligibility
   * Explicit rule reference if business rules prevent escalation
   * null if no business rule prevents escalation
   */
  blockingBusinessRule: string | null;

  /**
   * Whether escalation has been previously attempted
   * Tracks if dispatch has already been escalated
   */
  hasBeenEscalatedBefore: boolean;

  /**
   * Number of previous escalation attempts
   * Count of prior escalations for this dispatch
   */
  escalationAttemptCount: number;

  /**
   * Timestamp when this eligibility was assessed (milliseconds since epoch)
   * Explicitly provided from eligibility evaluation layer
   */
  assessedAt: number;

  /**
   * Timestamp when this eligibility assessment expires (milliseconds since epoch)
   * null if eligibility assessment never expires
   * Explicitly provided from eligibility evaluation layer
   */
  expiresAt: number | null;
}

/**
 * Escalation Eligibility Record Type
 *
 * Represents the current eligibility state and verdict for dispatch escalation.
 *
 * Immutable:
 * Eligibility records are immutable once created.
 */
export interface EscalationEligibilityRecord {
  /**
   * Unique identifier for this eligibility record
   * Explicitly provided from escalation policy evaluation layer
   */
  eligibilityRecordId: string;

  /**
   * The dispatch ID this eligibility applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Current eligibility status
   * The verdict on whether escalation is allowed
   */
  status: EscalationEligibilityStatus;

  /**
   * The eligibility criteria used for this assessment
   * Immutable reference to evaluation criteria
   */
  criteria: EscalationEligibilityCriteria;

  /**
   * Reason for eligibility status
   * Explicit explanation of why eligible or not eligible
   * Examples: "Escalatable failure detected", "Actor unavailable", "Business rule violation"
   */
  reason: string;

  /**
   * Additional metadata about eligibility determination
   * Structured context for eligibility verdict
   */
  metadata: Record<string, unknown>;

  /**
   * Timestamp when this eligibility record was created (milliseconds since epoch)
   * Explicitly provided from eligibility evaluation layer
   */
  createdAt: number;

  /**
   * Timestamp when this record was last updated (milliseconds since epoch)
   * Explicitly provided from eligibility evaluation layer
   */
  updatedAt: number;
}
