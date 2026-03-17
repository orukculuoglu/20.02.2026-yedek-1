/**
 * Dispatch Retry Eligibility Types
 *
 * Models the conditions and criteria that determine whether a dispatch is eligible for retry.
 *
 * Purpose:
 * Retry eligibility explicitly captures what circumstances allow or prevent a retry,
 * separate from retry policy constraints. Provides deterministic eligibility judgement.
 */

/**
 * Retry Eligibility Status Enum
 *
 * Represents the current eligibility state for a dispatch retry.
 *
 * States:
 * - ELIGIBLE: Dispatch is eligible for retry
 * - NOT_ELIGIBLE: Dispatch is not eligible for retry
 * - ELIGIBILITY_PENDING: Eligibility cannot be determined yet
 * - CONDITION_DEPENDENT: Eligibility depends on external conditions
 */
export enum RetryEligibilityStatus {
  ELIGIBLE = 'ELIGIBLE',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  ELIGIBILITY_PENDING = 'ELIGIBILITY_PENDING',
  CONDITION_DEPENDENT = 'CONDITION_DEPENDENT',
}

/**
 * Retry Eligibility Criteria Type
 *
 * Defines the structured criteria used to determine retry eligibility.
 *
 * Criteria may include:
 * - Failure type examination (transient vs permanent)
 * - Dispatch actor state
 * - Delivery channel state
 * - Temporal constraints
 * - Business rules constraints
 *
 * Immutable:
 * Eligibility criteria are immutable once created.
 */
export interface RetryEligibilityCriteria {
  /**
   * Unique identifier for this eligibility criteria
   * Explicitly provided from retry policy evaluation layer
   */
  criteriaId: string;

  /**
   * The dispatch ID this criteria applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Failure classification that may allow or prevent retry
   * Examples: TRANSIENT_NETWORK_ERROR, PERMANENT_VALIDATION_ERROR, etc.
   * Used to determine eligibility based on failure type
   */
  failureClassification: string;

  /**
   * Actor availability state that affects retry eligibility
   * Examples: AVAILABLE, UNAVAILABLE, UNKNOWN
   * Determines if target actor is able to receive retry
   */
  actorAvailability: string;

  /**
   * Channel operability state that affects retry eligibility
   * Examples: OPERATIONAL, DEGRADED, OFFLINE
   * Determines if delivery channel can support retry
   */
  channelOperability: string;

  /**
   * Temporal constraint that may block retries
   * Examples: WITHIN_RETRY_WINDOW, OUTSIDE_RETRY_WINDOW
   * Determines if current time allows retry attempt
   */
  temporalConstraint: string;

  /**
   * Business rule that may block eligibility
   * Explicit rule reference if business rules prevent retry
   * null if no business rule prevents retry
   */
  blockingBusinessRule: string | null;

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
 * Retry Eligibility Record Type
 *
 * Represents the current eligibility state and verdict for dispatch retry.
 *
 * Immutable:
 * Eligibility records are immutable once created.
 */
export interface RetryEligibilityRecord {
  /**
   * Unique identifier for this eligibility record
   * Explicitly provided from retry policy evaluation layer
   */
  eligibilityRecordId: string;

  /**
   * The dispatch ID this eligibility applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Current eligibility status
   * The verdict on whether retry is allowed
   */
  status: RetryEligibilityStatus;

  /**
   * The eligibility criteria used for this assessment
   * Immutable reference to evaluation criteria
   */
  criteria: RetryEligibilityCriteria;

  /**
   * Reason for eligibility status
   * Explicit explanation of why eligible or not eligible
   * Examples: "Transient error detected", "Actor unavailable", "Business rule violation"
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
