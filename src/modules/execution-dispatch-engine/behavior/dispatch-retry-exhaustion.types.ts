/**
 * Dispatch Retry Exhaustion Types
 *
 * Models the conditions and state that indicate retry attempts have been exhausted.
 *
 * Purpose:
 * Retry exhaustion explicitly captures when and why a dispatch can no longer be retried,
 * separate from policy constraints. Provides deterministic exhaustion semantics.
 */

/**
 * Retry Exhaustion Status Enum
 *
 * Represents the current exhaustion state for a dispatch.
 *
 * States:
 * - NOT_EXHAUSTED: Retries remaining, dispatch can still be retried
 * - ATTEMPT_LIMIT_EXHAUSTED: Maximum retry attempts reached
 * - BACKOFF_LIMIT_EXHAUSTED: Backoff delay constraints prevent further retry
 * - TIME_WINDOW_EXHAUSTED: Retry time window has expired
 * - RESOURCE_EXHAUSTED: Retry resources depleted
 * - MULTIPLE_EXHAUSTION: Multiple exhaustion conditions triggered
 */
export enum RetryExhaustionStatus {
  NOT_EXHAUSTED = 'NOT_EXHAUSTED',
  ATTEMPT_LIMIT_EXHAUSTED = 'ATTEMPT_LIMIT_EXHAUSTED',
  BACKOFF_LIMIT_EXHAUSTED = 'BACKOFF_LIMIT_EXHAUSTED',
  TIME_WINDOW_EXHAUSTED = 'TIME_WINDOW_EXHAUSTED',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  MULTIPLE_EXHAUSTION = 'MULTIPLE_EXHAUSTION',
}

/**
 * Retry Attempt Counter Type
 *
 * Tracks the number of retry attempts without evaluation logic.
 *
 * Immutable:
 * Counters are immutable once created.
 */
export interface RetryAttemptCounter {
  /**
   * Total number of retry attempts made
   * Explicit count, not calculated
   */
  totalAttempts: number;

  /**
   * Maximum allowed retry attempts
   * Explicit limit from policy
   */
  maxAttempts: number;

  /**
   * Number of remaining retry attempts
   * Calculated as maxAttempts - totalAttempts
   */
  remainingAttempts: number;

  /**
   * Whether attempt limit has been reached
   * true if totalAttempts >= maxAttempts
   */
  isAttemptLimitReached: boolean;
}

/**
 * Retry Backoff Exhaustion Type
 *
 * Models backoff-related exhaustion conditions.
 *
 * Immutable:
 * Backoff exhaustion records are immutable once created.
 */
export interface RetryBackoffExhaustion {
  /**
   * Current backoff delay in milliseconds
   * Explicit delay value, not calculated
   */
  currentDelayMs: number;

  /**
   * Maximum allowed backoff delay cap
   * From retry policy configuration
   */
  maxDelayCapMs: number;

  /**
   * Whether backoff delay exceeds maximum cap
   * true if currentDelayMs >= maxDelayCapMs
   */
  isDelayCapExceeded: boolean;

  /**
   * Backoff multiplier applicable
   * From exponential or linear backoff strategy
   */
  backoffMultiplier: number;

  /**
   * Cumulative backoff duration to date (milliseconds)
   * Total of all backoff delays consumed so far
   */
  cumulativeBackoffDurationMs: number;

  /**
   * Maximum cumulative backoff allowed (milliseconds)
   * Hard limit on total backoff duration
   * null if no limit
   */
  maxCumulativeBackoffMs: number | null;

  /**
   * Whether cumulative backoff limit exceeded
   * true if maxCumulativeBackoffMs is set and cumulativeBackoffDurationMs exceeds it
   */
  isCumulativeBackoffLimitExceeded: boolean;
}

/**
 * Retry Time Window Type
 *
 * Models temporal constraints on retry attempts.
 *
 * Immutable:
 * Time window records are immutable once created.
 */
export interface RetryTimeWindow {
  /**
   * Timestamp when retry window started (milliseconds since epoch)
   * Explicit start time from policy or initiation
   */
  windowStartAt: number;

  /**
   * Timestamp when retry window ends (milliseconds since epoch)
   * Maximum time within which retries must occur
   * Explicitly provided from policy
   */
  windowEndsAt: number;

  /**
   * Current timestamp reference (milliseconds since epoch)
   * Used to determine if window has expired
   * Explicitly provided for determinism
   */
  currentTimeAt: number;

  /**
   * Whether retry time window has expired
   * true if currentTimeAt >= windowEndsAt
   */
  isWindowExpired: boolean;

  /**
   * Remaining time in window (milliseconds)
   * windowEndsAt - currentTimeAt, or 0 if expired
   */
  remainingTimeMs: number;
}

/**
 * Retry Exhaustion Record Type
 *
 * Represents the complete exhaustion state for a dispatch.
 *
 * Immutable:
 * Exhaustion records are immutable once created.
 */
export interface RetryExhaustionRecord {
  /**
   * Unique identifier for this exhaustion record
   * Explicitly provided from exhaustion evaluation layer
   */
  exhaustionRecordId: string;

  /**
   * The dispatch ID this exhaustion applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Current exhaustion status
   * The verdict on whether retries are exhausted
   */
  status: RetryExhaustionStatus;

  /**
   * Attempt counter state
   * Tracks how many attempts have been made
   */
  attemptCounter: RetryAttemptCounter;

  /**
   * Backoff exhaustion state
   * Tracks backoff-related exhaustion
   */
  backoffExhaustion: RetryBackoffExhaustion;

  /**
   * Time window state
   * Tracks temporal retry boundaries
   */
  timeWindow: RetryTimeWindow;

  /**
   * All exhaustion reasons
   * Explicit list of conditions triggering exhaustion
   */
  exhaustionReasons: readonly string[];

  /**
   * Timestamp when this record was created (milliseconds since epoch)
   * Explicitly provided from exhaustion evaluation layer
   */
  createdAt: number;

  /**
   * Timestamp when this record was last updated (milliseconds since epoch)
   * Explicitly provided from exhaustion evaluation layer
   */
  updatedAt: number;
}
