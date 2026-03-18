/**
 * Dispatch Behavior Runtime Integration Types
 *
 * Models the explicit domain contracts for integrating Layer 8 runtime outcomes
 * with Layer 9 behavior evaluation, without runtime implementation logic.
 *
 * Purpose:
 * Runtime integration contracts define how Layer 8 execution outcomes are mapped
 * to Layer 9 behavior evaluation inputs, separate from execution or evaluation logic.
 * Provides deterministic integration contracts only.
 */

/**
 * Runtime Integration Status Enum
 *
 * Represents the status of runtime-to-behavior integration.
 *
 * States:
 * - CREATED: Integration contract created
 * - MAPPED: Runtime outcome mapped to behavior input
 * - HANDOFF_READY: Ready for behavior evaluation handoff
 * - EVALUATION_PENDING: Awaiting behavior evaluation
 * - INTEGRATION_COMPLETE: Integration phase complete
 */
export enum RuntimeIntegrationStatus {
  CREATED = 'CREATED',
  MAPPED = 'MAPPED',
  HANDOFF_READY = 'HANDOFF_READY',
  EVALUATION_PENDING = 'EVALUATION_PENDING',
  INTEGRATION_COMPLETE = 'INTEGRATION_COMPLETE',
}

/**
 * Runtime Outcome Reference Type
 *
 * Represents reference to the source runtime outcome.
 *
 * Immutable:
 * References are immutable once created.
 */
export interface RuntimeOutcomeReference {
  /**
   * Runtime outcome reference ID
   * Reference to the source runtime outcome artifact
   */
  outcomeRef: string;

  /**
   * Outcome type classification
   * What kind of outcome occurred (SUCCESS, FAILURE, TIMEOUT, ERROR, etc.)
   * String classification from Layer 8 runtime domain
   */
  outcomeType: string;

  /**
   * Outcome context from runtime
   * Additional structured context about the outcome
   */
  outcomeContext: Record<string, unknown>;

  /**
   * Timestamp when outcome occurred (milliseconds since epoch)
   * Explicitly provided from Layer 8 runtime
   */
  outcomeTimestamp: number;
}

/**
 * Behavior Evaluation Handoff Input Type
 *
 * Represents the contract for handing off to behavior evaluation.
 * Pure mapping of runtime outcome to behavior evaluation input.
 *
 * Immutable:
 * Handoff inputs are immutable once created.
 */
export interface BehaviorEvaluationHandoffInput {
  /**
   * Dispatch ID being evaluated
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Behavior profile reference
   * Reference to behavior profile to evaluate against
   */
  behaviorProfileRef: string;

  /**
   * Runtime outcome reference
   * Reference to the runtime outcome being evaluated
   */
  runtimeOutcomeRef: string;
}

/**
 * Behavior Integration Contract Type
 *
 * Represents the complete runtime-to-behavior integration contract.
 *
 * Pure domain contract capturing:
 * - Integration identity
 * - Runtime outcome reference
 * - Behavior profile reference
 * - Evaluation input reference
 * - Integration status
 * - Traceability references
 *
 * Immutable:
 * Contracts are immutable once created.
 */
export interface DispatchBehaviorRuntimeIntegrationContract {
  /**
   * Unique identifier for this integration
   * Explicitly provided from integration layer
   */
  integrationId: string;

  /**
   * Dispatch ID being integrated
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Runtime outcome reference
   * Reference to Layer 8 runtime outcome
   */
  runtimeOutcomeRef: string;

  /**
   * Behavior profile reference
   * Reference to Layer 9 behavior profile
   */
  behaviorProfileRef: string;

  /**
   * Evaluation input reference
   * Reference to evaluation input created for behavior layer
   */
  evaluationInputRef: string;

  /**
   * Integration trace reference
   * Reference for traceability and auditability
   */
  traceRef: string;

  /**
   * Current integration status
   * The state of runtime-to-behavior integration
   */
  status: RuntimeIntegrationStatus;

  /**
   * Timestamp when integration was created (milliseconds since epoch)
   * Explicitly provided from integration layer
   */
  createdAt: number;

  /**
   * Timestamp when integration was last updated (milliseconds since epoch)
   * Explicitly provided from integration layer
   */
  updatedAt: number;
}
