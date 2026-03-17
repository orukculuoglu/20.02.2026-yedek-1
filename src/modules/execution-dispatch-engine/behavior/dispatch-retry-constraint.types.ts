/**
 * Dispatch Retry Constraint Types
 *
 * Models the explicit constraints that govern retry behavior.
 *
 * Purpose:
 * Retry constraints capture hard boundaries and limits on retry attempts,
 * separate from policy. Provides deterministic constraint boundaries.
 */

/**
 * Retry Constraint Value Type
 *
 * Strict scalar type for constraint limit and usage values.
 * Prevents overly loose unknown types while allowing diverse value kinds.
 */
export type RetryConstraintValue = string | number | boolean | null;

/**
 * Retry Constraint Type Enum
 *
 * Categorizes different types of retry constraints.
 *
 * Types:
 * - ATTEMPT_LIMIT: Maximum number of retry attempts
 * - DURATION_LIMIT: Maximum total duration for all retries
 * - TIME_WINDOW_LIMIT: Maximum time window for retries
 * - DELAY_LIMIT: Maximum individual delay or cumulative delay
 * - RESOURCE_LIMIT: Maximum resource allocation for retries
 * - FREQUENCY_LIMIT: Minimum time between retry attempts
 * - COST_LIMIT: Maximum cost/quota allocation for retries
 * - CUSTOM: Custom application-defined constraint
 */
export enum RetryConstraintType {
  ATTEMPT_LIMIT = 'ATTEMPT_LIMIT',
  DURATION_LIMIT = 'DURATION_LIMIT',
  TIME_WINDOW_LIMIT = 'TIME_WINDOW_LIMIT',
  DELAY_LIMIT = 'DELAY_LIMIT',
  RESOURCE_LIMIT = 'RESOURCE_LIMIT',
  FREQUENCY_LIMIT = 'FREQUENCY_LIMIT',
  COST_LIMIT = 'COST_LIMIT',
  CUSTOM = 'CUSTOM',
}

/**
 * Retry Constraint Enforcement Status Enum
 *
 * Represents the current violation state of a constraint.
 *
 * States:
 * - VALID: Constraint is not violated
 * - WARNING: Constraint approaching violation threshold
 * - VIOLATED: Constraint is violated
 * - UNENFORCEABLE: Constraint cannot be enforced
 */
export enum RetryConstraintStatus {
  VALID = 'VALID',
  WARNING = 'WARNING',
  VIOLATED = 'VIOLATED',
  UNENFORCEABLE = 'UNENFORCEABLE',
}

/**
 * Individual Retry Constraint Type
 *
 * Represents a single constraint on retry behavior.
 *
 * Immutable:
 * Constraints are immutable once created.
 */
export interface RetryConstraint {
  /**
   * Unique identifier for this constraint
   * Explicitly provided from constraint source
   */
  constraintId: string;

  /**
   * The dispatch ID this constraint applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Type of constraint
   * Categorizes what is being constrained
   */
  type: RetryConstraintType;

  /**
   * Current enforcement status
   * Whether constraint is respected, warned, or violated
   */
  status: RetryConstraintStatus;

  /**
   * Constraint limit value
   * The boundary that must not be exceeded
   * Scalar type: string | number | boolean | null
   */
  limitValue: RetryConstraintValue;

  /**
   * Current usage/consumption against constraint
   * How much of the limit has been used
   * Scalar type: string | number | boolean | null
   */
  currentUsage: RetryConstraintValue;

  /**
   * Whether constraint is currently violated
   * true if currentUsage exceeds limitValue
   */
  isViolated: boolean;

  /**
   * Violation threshold warning level (0-100)
   * When to trigger warning before actual violation
   * Example: 80 means warn when 80% of limit consumed
   */
  warningThresholdPercent: number;

  /**
   * Whether constraint is currently in warning state
   * true if usage exceeds warning threshold but not limit
   */
  isWarning: boolean;

  /**
   * Optional enforcement action if violated
   * What should happen if constraint is violated
   * Examples: BLOCK_RETRY, ESCALATE, LOG_ONLY
   */
  enforcementAction: string | null;

  /**
   * Description of what this constraint enforces
   * Human-readable explanation
   */
  description: string;

  /**
   * Timestamp when this constraint was created (milliseconds since epoch)
   * Explicitly provided from constraint source
   */
  createdAt: number;

  /**
   * Timestamp when this constraint was last updated (milliseconds since epoch)
   * Explicitly provided from constraint source
   */
  updatedAt: number;
}

/**
 * Retry Constraints Collection Type
 *
 * Represents all constraints applying to a dispatch.
 *
 * Immutable:
 * Collections are immutable once created.
 */
export interface RetryConstraintsCollection {
  /**
   * The dispatch ID these constraints apply to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * All constraints applicable to this dispatch
   * Immutable collection of constraints
   */
  constraints: readonly RetryConstraint[];

  /**
   * Overall constraint compliance status
   * VALID if all constraints valid, VIOLATED if any violated
   */
  overallStatus: RetryConstraintStatus;

  /**
   * Constraints that are currently violated
   * Subset of constraints with status = VIOLATED
   */
  violatedConstraints: readonly RetryConstraint[];

  /**
   * Constraints in warning state
   * Subset of constraints with status = WARNING
   */
  warningConstraints: readonly RetryConstraint[];

  /**
   * Whether any constraint blocks retry
   * true if any constraint with BLOCK_RETRY action is violated
   */
  isRetryBlocked: boolean;

  /**
   * Whether any constraint requires escalation
   * true if any constraint with ESCALATE action is violated
   */
  requiresEscalation: boolean;

  /**
   * Timestamp when this collection was created (milliseconds since epoch)
   * Explicitly provided from constraint source
   */
  createdAt: number;

  /**
   * Timestamp when this collection was last updated (milliseconds since epoch)
   * Explicitly provided from constraint source
   */
  updatedAt: number;
}

/**
 * Retry Constraint Boundary Type
 *
 * Represents hard boundaries on retry behavior.
 *
 * Immutable:
 * Boundaries are immutable once created.
 */
export interface RetryConstraintBoundary {
  /**
   * Maximum attempts allowed
   * Hard upper limit on retry attempts
   * null if no limit
   */
  absoluteMaxAttempts: number | null;

  /**
   * Maximum total duration in milliseconds
   * Hard upper limit on time for all retries
   * null if no limit
   */
  absoluteMaxDurationMs: number | null;

  /**
   * Minimum time between retry attempts (milliseconds)
   * Hard lower bound on retry frequency
   * null if no limit
   */
  absoluteMinFrequencyMs: number | null;

  /**
   * Maximum delay for single retry attempt (milliseconds)
   * Hard upper bound on individual delay
   * null if no limit
   */
  absoluteMaxDelayMs: number | null;

  /**
   * Maximum cumulative delay (milliseconds)
   * Hard upper bound on total delay time
   * null if no limit
   */
  absoluteMaxCumulativeDelayMs: number | null;
}
