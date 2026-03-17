/**
 * Dispatch Behavior Domain Enums
 *
 * Defines the core enumeration types for the behavior layer that classify
 * deterministic system responses to dispatch execution outcomes.
 */

/**
 * Dispatch Retry Strategy Enum
 *
 * Defines the backoff strategy for retry policies when dispatch execution fails.
 *
 * Strategies:
 * - IMMEDIATE: Retry immediately without delay
 * - EXPONENTIAL_BACKOFF: Delay doubles with each retry attempt
 * - LINEAR_BACKOFF: Delay increases linearly with each retry attempt
 * - FIXED_DELAY: Same delay between all retry attempts
 * - NO_RETRY: Do not retry, fail on first attempt
 */
export enum DispatchRetryStrategy {
  IMMEDIATE = 'IMMEDIATE',
  EXPONENTIAL_BACKOFF = 'EXPONENTIAL_BACKOFF',
  LINEAR_BACKOFF = 'LINEAR_BACKOFF',
  FIXED_DELAY = 'FIXED_DELAY',
  NO_RETRY = 'NO_RETRY',
}

/**
 * Dispatch Escalation Level Enum
 *
 * Defines the severity and escalation requirement when dispatch execution fails.
 *
 * Levels:
 * - LOW: Low priority escalation
 * - MEDIUM: Medium priority escalation
 * - HIGH: High priority escalation
 * - CRITICAL: Critical priority escalation
 */
export enum DispatchEscalationLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Dispatch Behavior Disposition Enum
 *
 * Defines the behavioral disposition (how the system should respond) to a dispatch outcome.
 *
 * Dispositions:
 * - CONTINUE: Continue normal processing, no special behavior needed
 * - RETRY: Attempt to retry the dispatch according to retry policy
 * - ESCALATE: Escalate the issue according to escalation policy
 * - CANCEL: Cancel the dispatch, terminate it, no further processing
 * - DEFER: Defer the dispatch, hold it for later retry when conditions improve
 * - MANUAL_REVIEW: Require manual review before proceeding
 */
export enum DispatchBehaviorDisposition {
  CONTINUE = 'CONTINUE',
  RETRY = 'RETRY',
  ESCALATE = 'ESCALATE',
  CANCEL = 'CANCEL',
  DEFER = 'DEFER',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}
