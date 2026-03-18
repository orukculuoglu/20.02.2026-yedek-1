import {
  RetryEvaluationStatus,
  EscalationEvaluationStatus,
  EvaluatedRetryVerdict,
  EvaluatedEscalationVerdict,
  SourceOutcomeReference,
  DispatchBehaviorEvaluationInput,
  DispatchBehaviorEvaluationResult,
} from './dispatch-behavior-evaluation.types';
import { DispatchBehaviorDisposition } from './dispatch-behavior.enums';

/**
 * Input contract for creating an evaluated retry verdict
 *
 * All parameters must be explicitly provided from evaluation layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateEvaluatedRetryVerdictInput {
  /**
   * Verdict ID (explicitly provided, not generated)
   */
  verdictId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Retry evaluation status
   */
  status: RetryEvaluationStatus;

  /**
   * Policy reference
   */
  policyRef: string;

  /**
   * Allow reason (nullable)
   */
  allowReason: string | null;

  /**
   * Blocking reason (nullable)
   */
  blockingReason: string | null;

  /**
   * Timestamp of evaluation (explicitly provided)
   */
  evaluatedAt: number;
}

/**
 * Input contract for creating an evaluated escalation verdict
 *
 * All parameters must be explicitly provided from evaluation layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateEvaluatedEscalationVerdictInput {
  /**
   * Verdict ID (explicitly provided, not generated)
   */
  verdictId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Escalation evaluation status
   */
  status: EscalationEvaluationStatus;

  /**
   * Policy reference
   */
  policyRef: string;

  /**
   * Allow reason (nullable)
   */
  allowReason: string | null;

  /**
   * Blocking reason (nullable)
   */
  blockingReason: string | null;

  /**
   * Timestamp of evaluation (explicitly provided)
   */
  evaluatedAt: number;
}

/**
 * Input contract for creating a behavior evaluation result
 *
 * All parameters must be explicitly provided from evaluation layer.
 *
 * Constraints:
 * - No calculation of final disposition
 * - All parameters explicitly provided
 * - All timestamps explicit
 * - No side effects
 */
export interface CreateDispatchBehaviorEvaluationResultInput {
  /**
   * Evaluation ID (explicitly provided, not generated)
   */
  evaluationId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Source outcome reference
   */
  sourceOutcomeRef: string;

  /**
   * Retry verdict from evaluation
   */
  retryVerdict: EvaluatedRetryVerdict;

  /**
   * Escalation verdict from evaluation
   */
  escalationVerdict: EvaluatedEscalationVerdict;

  /**
   * Final disposition (explicitly provided, not derived)
   */
  finalDisposition: DispatchBehaviorDisposition;

  /**
   * Trace reference
   */
  traceRef: string;

  /**
   * Timestamp of creation (explicitly provided)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided)
   */
  updatedAt: number;
}

/**
 * Factory function to create an evaluated retry verdict
 *
 * Produces a deterministic verdict entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateEvaluatedRetryVerdictInput
 * @returns EvaluatedRetryVerdict - Immutable retry verdict object
 */
export function createEvaluatedRetryVerdict(
  input: CreateEvaluatedRetryVerdictInput
): EvaluatedRetryVerdict {
  return Object.freeze({
    verdictId: input.verdictId,
    dispatchId: input.dispatchId,
    status: input.status,
    policyRef: input.policyRef,
    allowReason: input.allowReason,
    blockingReason: input.blockingReason,
    evaluatedAt: input.evaluatedAt,
  });
}

/**
 * Factory function to create an evaluated escalation verdict
 *
 * Produces a deterministic verdict entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateEvaluatedEscalationVerdictInput
 * @returns EvaluatedEscalationVerdict - Immutable escalation verdict object
 */
export function createEvaluatedEscalationVerdict(
  input: CreateEvaluatedEscalationVerdictInput
): EvaluatedEscalationVerdict {
  return Object.freeze({
    verdictId: input.verdictId,
    dispatchId: input.dispatchId,
    status: input.status,
    policyRef: input.policyRef,
    allowReason: input.allowReason,
    blockingReason: input.blockingReason,
    evaluatedAt: input.evaluatedAt,
  });
}

/**
 * Factory function to create a behavior evaluation result
 *
 * Produces a deterministic evaluation result entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - No disposition calculation
 * - Pure deterministic assembly only
 *
 * @param input - CreateDispatchBehaviorEvaluationResultInput
 * @returns DispatchBehaviorEvaluationResult - Immutable evaluation result object
 */
export function createDispatchBehaviorEvaluationResult(
  input: CreateDispatchBehaviorEvaluationResultInput
): DispatchBehaviorEvaluationResult {
  return Object.freeze({
    evaluationId: input.evaluationId,
    dispatchId: input.dispatchId,
    sourceOutcomeRef: input.sourceOutcomeRef,
    retryVerdict: input.retryVerdict,
    escalationVerdict: input.escalationVerdict,
    finalDisposition: input.finalDisposition,
    traceRef: input.traceRef,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
