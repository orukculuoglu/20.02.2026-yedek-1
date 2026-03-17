import { DispatchRetryStrategy } from './dispatch-behavior.enums';

/**
 * Dispatch Retry Policy Type
 *
 * Represents a deterministic policy that governs automatic retry behavior
 * when a dispatch execution fails.
 *
 * A retry policy specifies:
 * - The retry strategy (backoff approach)
 * - Maximum number of retry attempts
 * - Initial delay before first retry
 * - Maximum delay cap for backoff strategies
 * - Backoff multiplier for exponential/linear strategies
 *
 * Purpose:
 * Retry policies provide explicit, deterministic control over dispatch retry behavior
 * without implicit assumptions or magic numbers. Each dispatch can have its own
 * retry policy applied based on business rules and operational requirements.
 *
 * Immutable:
 * Retry policies are immutable once created. Updates create new policy instances.
 */
export interface DispatchRetryPolicy {
  /**
   * Unique identifier for this retry policy
   * Explicitly provided from retry policy source layer
   */
  retryPolicyId: string;

  /**
   * The dispatch intent ID this policy applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Retry strategy determining backoff approach
   * Must be one of DispatchRetryStrategy enum values
   */
  strategy: DispatchRetryStrategy;

  /**
   * Maximum number of retry attempts allowed
   * Must be >= 1 for any retry (0 means NO_RETRY)
   */
  maxAttempts: number;

  /**
   * Initial delay in milliseconds before first retry attempt
   * Must be >= 0
   * Ignored if strategy is IMMEDIATE or NO_RETRY
   */
  initialDelayMs: number;

  /**
   * Maximum delay cap in milliseconds for backoff strategies
   * Prevents delay explosion in exponential backoff
   * Must be >= initialDelayMs
   */
  maxDelayMs: number;

  /**
   * Backoff multiplier for exponential/linear strategies
   * For EXPONENTIAL_BACKOFF: nextDelay = currentDelay * backoffMultiplier
   * For LINEAR_BACKOFF: nextDelay = currentDelay + (initialDelayMs * backoffMultiplier)
   * Must be > 1.0 for backoff strategies
   */
  backoffMultiplier: number;

  /**
   * Timestamp when this retry policy was created (milliseconds since epoch)
   * Explicitly provided from retry policy layer
   */
  createdAt: number;

  /**
   * Timestamp when this retry policy was last updated (milliseconds since epoch)
   * Explicitly provided from retry policy layer
   */
  updatedAt: number;
}
