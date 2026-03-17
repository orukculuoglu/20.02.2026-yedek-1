/**
 * Dispatch Retry Reason / Block Reason Types
 *
 * Models the explicit reasons why retries are allowed or blocked.
 *
 * Purpose:
 * Retry reason model captures deterministic reasons for retry decisions,
 * providing auditability and explicit control. Separates blocking reasons from policy.
 */

/**
 * Retry Reason Category Enum
 *
 * Categorizes different types of retry reasons.
 *
 * Categories:
 * - FAILURE_CAUSE: Reason relates to failure classification
 * - CAPABILITY_CHECK: Reason relates to actor/channel capability
 * - BUSINESS_RULE: Reason relates to business rule evaluation
 * - TEMPORAL: Reason relates to time/temporal constraints
 * - RESOURCE: Reason relates to resource availability
 * - EXHAUSTION: Reason relates to retry exhaustion
 * - CONSTRAINT: Reason relates to constraint violation
 * - OPERATIONAL: Reason relates to operational state
 */
export enum RetryReasonCategory {
  FAILURE_CAUSE = 'FAILURE_CAUSE',
  CAPABILITY_CHECK = 'CAPABILITY_CHECK',
  BUSINESS_RULE = 'BUSINESS_RULE',
  TEMPORAL = 'TEMPORAL',
  RESOURCE = 'RESOURCE',
  EXHAUSTION = 'EXHAUSTION',
  CONSTRAINT = 'CONSTRAINT',
  OPERATIONAL = 'OPERATIONAL',
}

/**
 * Retry Allow Reason Type
 *
 * Represents explicit reason why a retry is allowed.
 *
 * Immutable:
 * Allow reasons are immutable once created.
 */
export interface RetryAllowReason {
  /**
   * Unique identifier for this reason
   * Explicitly provided from reason source
   */
  reasonId: string;

  /**
   * Reason category
   * Categorizes the type of allow reason
   */
  category: RetryReasonCategory;

  /**
   * Failure classification allowing retry
   * Examples: TRANSIENT_NETWORK_ERROR, TIMEOUT, RATE_LIMITED
   * null if not failure-cause related
   */
  failureClassification: string | null;

  /**
   * Code identifying this specific allow reason
   * Examples: RETRY_TRANSIENT_ERROR, RETRY_ACTOR_RECOVERING, RETRY_WINDOW_AVAILABLE
   */
  reasonCode: string;

  /**
   * Human-readable description of why retry is allowed
   */
  description: string;

  /**
   * Whether this reason allows another retry to be attempted
   * Must be true for allow reasons
   */
  allowsRetry: boolean;

  /**
   * Priority of this reason (0-100)
   * Higher priority reasons take precedence if multiple reasons present
   */
  priority: number;

  /**
   * Metadata contextual to this allow reason
   * Additional details about the reason
   */
  metadata: Record<string, unknown>;

  /**
   * Timestamp when this reason was recorded (milliseconds since epoch)
   * Explicitly provided from reason source
   */
  recordedAt: number;

  /**
   * Timestamp when this reason was last updated (milliseconds since epoch)
   * Explicitly provided from reason source
   */
  updatedAt: number;
}

/**
 * Retry Block Reason Type
 *
 * Represents explicit reason why a retry is blocked.
 *
 * Immutable:
 * Block reasons are immutable once created.
 */
export interface RetryBlockReason {
  /**
   * Unique identifier for this reason
   * Explicitly provided from reason source
   */
  reasonId: string;

  /**
   * Reason category
   * Categorizes the type of block reason
   */
  category: RetryReasonCategory;

  /**
   * Failure classification blocking retry
   * Examples: PERMANENT_VALIDATION_ERROR, INVALID_DISPATCH_INTENT, AUTH_FAILURE
   * null if not failure-cause related
   */
  failureClassification: string | null;

  /**
   * Code identifying this specific block reason
   * Examples: BLOCK_PERMANENT_ERROR, BLOCK_ACTOR_INCOMPATIBLE, BLOCK_CONSTRAINT_VIOLATED
   */
  reasonCode: string;

  /**
   * Human-readable description of why retry is blocked
   */
  description: string;

  /**
   * Whether this reason blocks all future retries
   * true if permanent block, false if temporary block
   */
  isBlockPermanent: boolean;

  /**
   * Priority of this reason (0-100)
   * Higher priority reasons take precedence if multiple reasons present
   */
  priority: number;

  /**
   * Severity of the block (INFORMATIONAL, WARNING, ERROR, CRITICAL)
   * How serious the block is
   */
  severity: string;

  /**
   * Metadata contextual to this block reason
   * Additional details about the block
   */
  metadata: Record<string, unknown>;

  /**
   * Timestamp when this reason was recorded (milliseconds since epoch)
   * Explicitly provided from reason source
   */
  recordedAt: number;

  /**
   * Timestamp when this reason was last updated (milliseconds since epoch)
   * Explicitly provided from reason source
   */
  updatedAt: number;
}

/**
 * Retry Reason Verdict Type
 *
 * Represents the final structure of retry reasons without evaluation logic.
 *
 * Pure domain contract capturing:
 * - All contributing allow reasons
 * - All contributing block reasons
 * - Primary reasons by priority
 * - Verdict status classification
 *
 * Immutable:
 * Verdicts are immutable once created.
 */
export interface RetryReasonVerdict {
  /**
   * Unique identifier for this verdict
   * Explicitly provided from reason source
   */
  verdictId: string;

  /**
   * The dispatch ID this verdict applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Verdict status classification
   * ALLOWED: All contributing reasons support retry
   * BLOCKED: At least one reason blocks retry
   * MIXED: Both allow and block reasons present
   * UNRESOLVED: No reasons available for verdict
   */
  verdictStatus: 'ALLOWED' | 'BLOCKED' | 'MIXED' | 'UNRESOLVED';

  /**
   * All allow reasons contributing to verdict
   * Immutable collection of reasons supporting retry
   */
  allowReasons: readonly RetryAllowReason[];

  /**
   * All block reasons contributing to verdict
   * Immutable collection of reasons blocking retry
   */
  blockReasons: readonly RetryBlockReason[];

  /**
   * Highest priority allow reason
   * The allow reason with highest priority if any allow reasons exist
   * null if no allow reasons
   */
  primaryAllowReason: RetryAllowReason | null;

  /**
   * Highest priority block reason
   * The block reason with highest priority if any block reasons exist
   * null if no block reasons
   */
  primaryBlockReason: RetryBlockReason | null;

  /**
   * Timestamp when this verdict was created (milliseconds since epoch)
   * Explicitly provided from reason source
   */
  createdAt: number;

  /**
   * Timestamp when this verdict was last updated (milliseconds since epoch)
   * Explicitly provided from reason source
   */
  updatedAt: number;
}
