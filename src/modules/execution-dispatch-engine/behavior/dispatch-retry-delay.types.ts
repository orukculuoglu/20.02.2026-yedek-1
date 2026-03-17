/**
 * Dispatch Retry Delay Model Types
 *
 * Models the delay calculation parameters and boundaries for retry attempts.
 *
 * Purpose:
 * Retry delay model explicitly captures how delays between retries are determined,
 * separate from execution. Provides deterministic delay boundaries.
 */

/**
 * Retry Delay State Enum
 *
 * Represents the current delay state.
 *
 * States:
 * - IMMEDIATE: Next retry should occur immediately
 * - PENDING_DELAY: Waiting for delay period to elapse
 * - DELAY_READY: Delay period has elapsed, ready to retry
 * - DELAY_EXCEEDED: Delay calculation exceeded maximum
 */
export enum RetryDelayState {
  IMMEDIATE = 'IMMEDIATE',
  PENDING_DELAY = 'PENDING_DELAY',
  DELAY_EXCEEDED = 'DELAY_EXCEEDED',
}

/**
 * Retry Delay Boundary Type
 *
 * Represents the temporal boundaries for delay application.
 *
 * Immutable:
 * Delay boundaries are immutable once created.
 */
export interface RetryDelayBoundary {
  /**
   * Minimum delay in milliseconds
   * Explicit lower bound for retry delays
   */
  minDelayMs: number;

  /**
   * Maximum delay in milliseconds
   * Explicit upper bound for retry delays
   * Prevents delay explosion
   */
  maxDelayMs: number;

  /**
   * Current delay in milliseconds
   * Explicit delay value for next retry
   */
  currentDelayMs: number;

  /**
   * Whether current delay respects boundaries
   * true if minDelayMs <= currentDelayMs <= maxDelayMs
   */
  isWithinBoundaries: boolean;
}

/**
 * Retry Backoff Function Specification Type
 *
 * Describes how backoff delay is calculated without implementing the calculation.
 *
 * Immutable:
 * Specifications are immutable once created.
 */
export interface RetryBackoffFunctionSpec {
  /**
   * Strategy identifier matching DispatchRetryStrategy enum
   * EXPONENTIAL_BACKOFF, LINEAR_BACKOFF, FIXED_DELAY, etc.
   */
  strategy: string;

  /**
   * Initial delay in milliseconds
   * Starting point for backoff calculation
   */
  initialDelayMs: number;

  /**
   * Backoff multiplier
   * For exponential: nextDelay = currentDelay * multiplier
   * For linear: nextDelay = currentDelay + (initialDelayMs * multiplier)
   */
  multiplier: number;

  /**
   * Maximum delay cap in milliseconds
   * Calculated delays are capped at this value
   */
  maxDelayMs: number;

  /**
   * Jitter configuration
   * null if no jitter
   * If set, contains jitter boundaries as percentage or milliseconds
   */
  jitterConfig: Record<string, unknown> | null;

  /**
   * Calculation parameters
   * Strategy-specific parameters for delay calculation
   * Empty if strategy is FIXED_DELAY or IMMEDIATE
   */
  calculationParams: Record<string, unknown>;
}

/**
 * Retry Delay Schedule Type
 *
 * Represents the schedule of delays across multiple retry attempts.
 *
 * Pure structural domain contract without runtime evaluation.
 *
 * Immutable:
 * Schedules are immutable once created.
 */
export interface RetryDelaySchedule {
  /**
   * The delay schedule specification
   * Describes how delays are calculated
   */
  backoffSpec: RetryBackoffFunctionSpec;

  /**
   * Sequence of planned delays (milliseconds)
   * Explicit delays for each retry attempt
   * null if schedule is dynamic/unbounded
   */
  plannedDelays: readonly number[] | null;

  /**
   * Current attempt number (0-indexed)
   * Which retry this is
   */
  currentAttemptNumber: number;

  /**
   * Delay for current attempt in milliseconds
   * Explicit delay value
   */
  delayForCurrentAttempt: number;
}

/**
 * Retry Delay Record Type
 *
 * Represents the complete delay state for a dispatch.
 *
 * Immutable:
 * Delay records are immutable once created.
 */
export interface RetryDelayRecord {
  /**
   * Unique identifier for this delay record
   * Explicitly provided from delay modeling layer
   */
  delayRecordId: string;

  /**
   * The dispatch ID this delay applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Current delay state
   * The status of delay processing
   */
  state: RetryDelayState;

  /**
   * Delay boundary constraints
   * The min/max bounds for delays
   */
  boundary: RetryDelayBoundary;

  /**
   * Delay schedule information
   * Complete schedule context for delays
   */
  schedule: RetryDelaySchedule;

  /**
   * Total cumulative delay applied (milliseconds)
   * Sum of all delays applied to date
   */
  cumulativeDelayMs: number;

  /**
   * Maximum cumulative delay allowed (milliseconds)
   * Hard limit on total delay across all retries
   * null if no limit
   */
  maxCumulativeDelayMs: number | null;

  /**
   * Timestamp when this record was created (milliseconds since epoch)
   * Explicitly provided from delay modeling layer
   */
  createdAt: number;

  /**
   * Timestamp when this record was last updated (milliseconds since epoch)
   * Explicitly provided from delay modeling layer
   */
  updatedAt: number;
}
