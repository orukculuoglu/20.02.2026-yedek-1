import { DispatchRetryStrategy, DispatchEscalationLevel, DispatchBehaviorDisposition } from './dispatch-behavior.enums';
import { DispatchRetryPolicy } from './dispatch-retry-policy.types';
import { DispatchEscalationPolicy } from './dispatch-escalation-policy.types';
import { DispatchBehaviorProfile } from './dispatch-behavior.types';
import type { EscalationTriggerSpec } from './dispatch-escalation-trigger.types';
import type { EscalationTargetRouting } from './dispatch-escalation-target.types';
import type { EscalationNotificationSpec } from './dispatch-escalation-notification.types';
import type { EscalationConstraintsCollection, EscalationConstraintBoundary } from './dispatch-escalation-constraint.types';

/**
 * Input contract for creating a DispatchRetryPolicy
 *
 * All parameters must be explicitly provided from behavior source layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateDispatchRetryPolicyInput {
  /**
   * Retry policy ID (explicitly provided, not generated)
   */
  retryPolicyId: string;

  /**
   * The dispatch ID
   */
  dispatchId: string;

  /**
   * Retry strategy
   */
  strategy: DispatchRetryStrategy;

  /**
   * Maximum attempts
   */
  maxAttempts: number;

  /**
   * Initial delay in milliseconds
   */
  initialDelayMs: number;

  /**
   * Maximum delay cap in milliseconds
   */
  maxDelayMs: number;

  /**
   * Backoff multiplier
   */
  backoffMultiplier: number;

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
 * Input contract for creating a DispatchEscalationPolicy
 *
 * All parameters must be explicitly provided from behavior source layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateDispatchEscalationPolicyInput {
  /**
   * Escalation policy ID (explicitly provided, not generated)
   */
  escalationPolicyId: string;

  /**
   * The dispatch ID
   */
  dispatchId: string;

  /**
   * Escalation level
   */
  escalationLevel: DispatchEscalationLevel;

  /**
   * Escalation trigger specification
   * Defines what conditions trigger this escalation policy
   */
  triggerSpec: EscalationTriggerSpec;

  /**
   * Escalation target routing
   * Defines where escalations are routed
   */
  targetRouting: EscalationTargetRouting;

  /**
   * Escalation notification specification
   * Defines how escalations are communicated
   */
  notificationSpec: EscalationNotificationSpec;

  /**
   * Escalation constraints
   * Defines limits and boundaries on escalation behavior
   */
  constraints: EscalationConstraintsCollection;

  /**
   * Escalation constraint boundaries
   * Hard limits on escalation frequency, count, time, cost
   */
  constraintBoundary: EscalationConstraintBoundary;

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
 * Input contract for creating a DispatchBehaviorProfile
 *
 * All parameters must be explicitly provided from behavior source layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateDispatchBehaviorProfileInput {
  /**
   * Behavior profile ID (explicitly provided, not generated)
   */
  behaviorProfileId: string;

  /**
   * The dispatch ID
   */
  dispatchId: string;

  /**
   * Retry policy (required)
   */
  retryPolicy: DispatchRetryPolicy;

  /**
   * Escalation policy (required)
   */
  escalationPolicy: DispatchEscalationPolicy;

  /**
   * Default behavior disposition
   */
  defaultDisposition: DispatchBehaviorDisposition;

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
 * Factory function to create a DispatchRetryPolicy
 *
 * Produces a deterministic retry policy entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateDispatchRetryPolicyInput
 * @returns DispatchRetryPolicy - Immutable retry policy object
 */
export function createDispatchRetryPolicy(
  input: CreateDispatchRetryPolicyInput
): DispatchRetryPolicy {
  return Object.freeze({
    retryPolicyId: input.retryPolicyId,
    dispatchId: input.dispatchId,
    strategy: input.strategy,
    maxAttempts: input.maxAttempts,
    initialDelayMs: input.initialDelayMs,
    maxDelayMs: input.maxDelayMs,
    backoffMultiplier: input.backoffMultiplier,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a DispatchEscalationPolicy
 *
 * Produces a deterministic escalation policy entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateDispatchEscalationPolicyInput
 * @returns DispatchEscalationPolicy - Immutable escalation policy object
 */
export function createDispatchEscalationPolicy(
  input: CreateDispatchEscalationPolicyInput
): DispatchEscalationPolicy {
  return Object.freeze({
    escalationPolicyId: input.escalationPolicyId,
    dispatchId: input.dispatchId,
    escalationLevel: input.escalationLevel,
    triggerSpec: input.triggerSpec,
    targetRouting: input.targetRouting,
    notificationSpec: input.notificationSpec,
    constraints: input.constraints,
    constraintBoundary: input.constraintBoundary,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a DispatchBehaviorProfile
 *
 * Produces a deterministic behavior profile entity combining retry and escalation policies.
 *
 * Constraints:
 * - No Date.now() - timestamps explicitly provided
 * - No Math.random() - no randomness
 * - No input mutation - creates new object
 * - All parameters explicit
 * - All timestamps explicit
 * - Pure deterministic assembly only
 *
 * @param input - CreateDispatchBehaviorProfileInput
 * @returns DispatchBehaviorProfile - Immutable behavior profile object
 */
export function createDispatchBehaviorProfile(
  input: CreateDispatchBehaviorProfileInput
): DispatchBehaviorProfile {
  return Object.freeze({
    behaviorProfileId: input.behaviorProfileId,
    dispatchId: input.dispatchId,
    retryPolicy: input.retryPolicy,
    escalationPolicy: input.escalationPolicy,
    defaultDisposition: input.defaultDisposition,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
