import { DispatchEscalationLevel } from './dispatch-behavior.enums';

/**
 * Dispatch Escalation Reason Types
 *
 * Models the explicit reasons why escalation is allowed or blocked.
 *
 * Purpose:
 * Escalation reason model captures deterministic reasons for escalation decisions,
 * providing auditability and explicit control. Separates escalation reasons from policy.
 */

/**
 * Escalation Reason Category Enum
 *
 * Categorizes different types of escalation reasons.
 *
 * Categories:
 * - FAILURE_CAUSE: Reason relates to failure classification
 * - EXHAUSTION: Reason relates to retry/resource exhaustion
 * - CONSTRAINT: Reason relates to constraint violation
 * - TIMEOUT: Reason relates to timeout condition
 * - ACTOR_UNAVAILABLE: Reason relates to actor/channel unavailability
 * - BUSINESS_RULE: Reason relates to business rule evaluation
 * - OPERATIONAL: Reason relates to operational state
 * - MANUAL: Reason relates to manual escalation request
 */
export enum EscalationReasonCategory {
  FAILURE_CAUSE = 'FAILURE_CAUSE',
  EXHAUSTION = 'EXHAUSTION',
  CONSTRAINT = 'CONSTRAINT',
  TIMEOUT = 'TIMEOUT',
  ACTOR_UNAVAILABLE = 'ACTOR_UNAVAILABLE',
  BUSINESS_RULE = 'BUSINESS_RULE',
  OPERATIONAL = 'OPERATIONAL',
  MANUAL = 'MANUAL',
}

/**
 * Escalation Allow Reason Type
 *
 * Represents explicit reason why an escalation is allowed.
 *
 * Immutable:
 * Allow reasons are immutable once created.
 */
export interface EscalationAllowReason {
  /**
   * Unique identifier for this reason
   * Explicitly provided from reason source
   */
  reasonId: string;

  /**
   * Reason category
   * Categorizes the type of allow reason
   */
  category: EscalationReasonCategory;

  /**
   * Failure classification triggering escalation
   * Examples: PERMANENT_ERROR, TIMEOUT, ACTOR_DOWN
   * null if not failure-cause related
   */
  failureClassification: string | null;

  /**
   * Code identifying this specific allow reason
   * Examples: ESCALATE_PERMANENT_ERROR, ESCALATE_TIMEOUT, ESCALATE_ACTOR_UNAVAILABLE
   */
  reasonCode: string;

  /**
   * Human-readable description of why escalation is allowed
   */
  description: string;

  /**
   * Whether this reason allows escalation to proceed
   * Must be true for allow reasons
   */
  allowsEscalation: boolean;

  /**
   * Recommended escalation level
   * LOW, MEDIUM, HIGH, CRITICAL
   * Suggested severity based on this reason
   */
  recommendedEscalationLevel: DispatchEscalationLevel;

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
 * Escalation Block Reason Type
 *
 * Represents explicit reason why an escalation is blocked.
 *
 * Immutable:
 * Block reasons are immutable once created.
 */
export interface EscalationBlockReason {
  /**
   * Unique identifier for this reason
   * Explicitly provided from reason source
   */
  reasonId: string;

  /**
   * Reason category
   * Categorizes the type of block reason
   */
  category: EscalationReasonCategory;

  /**
   * Condition blocking escalation
   * Examples: CONSTRAINT_VIOLATED, FREQUENCY_EXCEEDED, COST_LIMIT_EXCEEDED
   * null if not constraint-related
   */
  blockingCondition: string | null;

  /**
   * Code identifying this specific block reason
   * Examples: BLOCK_CONSTRAINT_VIOLATED, BLOCK_FREQUENCY_EXCEEDED,BLOCK_COST_EXCEEDED
   */
  reasonCode: string;

  /**
   * Human-readable description of why escalation is blocked
   */
  description: string;

  /**
   * Whether this reason permanently blocks escalation
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
 * Escalation Reason Verdict Type
 *
 * Represents the final structure of escalation reasons without evaluation logic.
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
export interface EscalationReasonVerdict {
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
   * ALLOWED: All contributing reasons support escalation
   * BLOCKED: At least one reason blocks escalation
   * MIXED: Both allow and block reasons present
   * UNRESOLVED: No reasons available for verdict
   */
  verdictStatus: 'ALLOWED' | 'BLOCKED' | 'MIXED' | 'UNRESOLVED';

  /**
   * All allow reasons contributing to verdict
   * Immutable collection of reasons supporting escalation
   */
  allowReasons: readonly EscalationAllowReason[];

  /**
   * All block reasons contributing to verdict
   * Immutable collection of reasons blocking escalation
   */
  blockReasons: readonly EscalationBlockReason[];

  /**
   * Highest priority allow reason
   * The allow reason with highest priority if any allow reasons exist
   * null if no allow reasons
   */
  primaryAllowReason: EscalationAllowReason | null;

  /**
   * Highest priority block reason
   * The block reason with highest priority if any block reasons exist
   * null if no block reasons
   */
  primaryBlockReason: EscalationBlockReason | null;

  /**
   * Recommended escalation level from allow reasons
   * Aggregate recommendation from all allow reasons
   * null if no recommended level
   */
  recommendedEscalationLevel: DispatchEscalationLevel | null;

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
