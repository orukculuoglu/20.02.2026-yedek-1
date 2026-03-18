import { DispatchBehaviorDisposition } from './dispatch-behavior.enums';

/**
 * Dispatch Behavior Evaluation Types
 *
 * Models the explicit domain contracts for behavior evaluation without runtime semantics.
 *
 * Purpose:
 * Behavior evaluation contracts define the input/output structure for evaluating
 * how a dispatch should behave based on execution outcomes, separate from evaluation logic.
 * Provides deterministic evaluation contracts only.
 */

/**
 * Retry Evaluation Status Enum
 *
 * Represents the evaluated verdict on whether retry is allowed.
 *
 * States:
 * - ELIGIBLE: Retry is allowed given current conditions
 * - BLOCKED: Retry is blocked by policy or conditions
 * - EXHAUSTED: Retry has been exhausted
 */
export enum RetryEvaluationStatus {
  ELIGIBLE = 'ELIGIBLE',
  BLOCKED = 'BLOCKED',
  EXHAUSTED = 'EXHAUSTED',
}

/**
 * Escalation Evaluation Status Enum
 *
 * Represents the evaluated verdict on whether escalation is allowed.
 *
 * States:
 * - ELIGIBLE: Escalation is allowed given current conditions
 * - BLOCKED: Escalation is blocked by policy or conditions
 * - INELIGIBLE: Dispatch is not eligible for escalation
 */
export enum EscalationEvaluationStatus {
  ELIGIBLE = 'ELIGIBLE',
  BLOCKED = 'BLOCKED',
  INELIGIBLE = 'INELIGIBLE',
}

/**
 * Evaluated Retry Verdict Type
 *
 * Represents the evaluated verdict on retry behavior.
 *
 * Immutable:
 * Verdicts are immutable once created.
 */
export interface EvaluatedRetryVerdict {
  /**
   * Unique identifier for this verdict
   * Explicitly provided from evaluation layer
   */
  verdictId: string;

  /**
   * Dispatch ID this verdict applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Status of retry evaluation
   * The verdict on whether retry is eligible
   */
  status: RetryEvaluationStatus;

  /**
   * Policy reference from behavior profile
   * Reference to retry policy that was evaluated
   */
  policyRef: string;

  /**
   * Primary reason if retry is eligible
   * Human-readable explanation if retry is allowed
   * null if retry is not eligible
   */
  allowReason: string | null;

  /**
   * Primary reason if retry is blocked
   * Human-readable explanation if retry is blocked
   * null if retry is not blocked
   */
  blockingReason: string | null;

  /**
   * Timestamp when this verdict was evaluated (milliseconds since epoch)
   * Explicitly provided from evaluation layer
   */
  evaluatedAt: number;
}

/**
 * Evaluated Escalation Verdict Type
 *
 * Represents the evaluated verdict on escalation behavior.
 *
 * Immutable:
 * Verdicts are immutable once created.
 */
export interface EvaluatedEscalationVerdict {
  /**
   * Unique identifier for this verdict
   * Explicitly provided from evaluation layer
   */
  verdictId: string;

  /**
   * Dispatch ID this verdict applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Status of escalation evaluation
   * The verdict on whether escalation is eligible
   */
  status: EscalationEvaluationStatus;

  /**
   * Policy reference from behavior profile
   * Reference to escalation policy that was evaluated
   */
  policyRef: string;

  /**
   * Primary reason if escalation is eligible
   * Human-readable explanation if escalation is allowed
   * null if escalation is not eligible
   */
  allowReason: string | null;

  /**
   * Primary reason if escalation is blocked
   * Human-readable explanation if escalation is blocked
   * null if escalation is not blocked
   */
  blockingReason: string | null;

  /**
   * Timestamp when this verdict was evaluated (milliseconds since epoch)
   * Explicitly provided from evaluation layer
   */
  evaluatedAt: number;
}

/**
 * Source Outcome Reference Type
 *
 * Represents reference to the source outcome being evaluated.
 *
 * Immutable:
 * References are immutable once created.
 */
export interface SourceOutcomeReference {
  /**
   * Outcome reference ID
   * Reference to the source outcome artifact
   */
  outcomeRef: string;

  /**
   * Outcome type classification
   * What kind of outcome occurred (SUCCESS, FAILURE, TIMEOUT, etc.)
   * String classification from source outcome domain
   */
  outcomeType: string;

  /**
   * Outcome metadata
   * Additional context about the outcome
   */
  outcomeMetadata: Record<string, unknown>;
}

/**
 * Behavior Evaluation Input Type
 *
 * Represents the input contract for behavior evaluation.
 *
 * Immutable:
 * Inputs are immutable once created.
 */
export interface DispatchBehaviorEvaluationInput {
  /**
   * The dispatch ID being evaluated
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * The source outcome reference
   * What outcome triggered this evaluation
   */
  sourceOutcome: SourceOutcomeReference;

  /**
   * The behavior profile to evaluate against
   * Contains retry and escalation policies
   */
  behaviorProfileId: string;

  /**
   * Current timestamp for evaluation (milliseconds since epoch)
   * Explicitly provided for deterministic evaluation
   */
  evaluationTime: number;

  /**
   * Additional evaluation context
   * Context data for evaluation use
   */
  context: Record<string, unknown>;
}

/**
 * Behavior Evaluation Result Type
 *
 * Represents the complete evaluation result without runtime integration.
 *
 * Pure domain contract capturing:
 * - Evaluation identity
 * - Source outcome reference
 * - Evaluated retry verdict
 * - Evaluated escalation verdict
 * - Resolved final disposition
 * - Trace reference for auditability
 *
 * Immutable:
 * Results are immutable once created.
 */
export interface DispatchBehaviorEvaluationResult {
  /**
   * Unique identifier for this evaluation
   * Explicitly provided from evaluation layer
   */
  evaluationId: string;

  /**
   * Dispatch ID being evaluated
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Source outcome reference that triggered evaluation
   * Reference to the outcome being evaluated against
   */
  sourceOutcomeRef: string;

  /**
   * Evaluated retry verdict
   * The result of evaluating retry policy
   */
  retryVerdict: EvaluatedRetryVerdict;

  /**
   * Evaluated escalation verdict
   * The result of evaluating escalation policy
   */
  escalationVerdict: EvaluatedEscalationVerdict;

  /**
   * Final resolved disposition
   * The determined system behavior for this dispatch
   * Derived from verdicts but explicit in result
   */
  finalDisposition: DispatchBehaviorDisposition;

  /**
   * Trace reference for evaluation
   * Reference to evaluation trace for auditability
   */
  traceRef: string;

  /**
   * Timestamp when evaluation was completed (milliseconds since epoch)
   * Explicitly provided from evaluation layer
   */
  createdAt: number;

  /**
   * Timestamp when evaluation was last materialized (milliseconds since epoch)
   * Explicitly provided from evaluation layer
   */
  updatedAt: number;
}
