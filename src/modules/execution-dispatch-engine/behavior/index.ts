/**
 * Dispatch Behavior Layer Module
 *
 * Layer 9 Phase 1: Behavior Domain Model
 *
 * This module provides the core domain structures for behavior layer that defines
 * deterministic system behavior after execution outcomes occur.
 *
 * Exports:
 * - Behavior domain enums (retry strategy, escalation level, disposition)
 * - Retry policy contract
 * - Escalation policy contract
 * - Behavior profile aggregate
 * - Factory functions for creating behavior domain objects
 *
 * Purpose:
 * The behavior layer governs how the dispatch system responds when execution
 * outcomes occur. It provides explicit, deterministic policies for:
 * - Automatic retry with configurable backoff strategies
 * - Escalation with severity levels and notification
 * - Behavioral disposition (continue, retry, escalate, cancel, defer)
 *
 * Constraints:
 * - No evaluation logic - only domain contracts
 * - No orchestration - only model definitions
 * - No side effects - pure deterministic contracts
 * - Fully typed - no any types
 * - Enterprise-grade naming
 * - Deterministic contracts only
 *
 * Phase 1 Scope:
 * This phase establishes the foundational domain model only.
 *
 * Later phases will implement:
 * - Phase 2: Retry Policy Model
 * - Phase 3: Escalation Policy Model
 * - Phase 4: Behavior Profile (Aggregate)
 * - Phase 5: Behavior Evaluation Engine
 * - Phase 6: Behavior Runtime Integration Contract
 * - Phase 7: Behavior Snapshot / Trace Hooks
 * - Phase 8: Behavior API Surface
 * - Phase 9: Technical Closure
 */

export {
  DispatchRetryStrategy,
  DispatchEscalationLevel,
  DispatchBehaviorDisposition,
} from './dispatch-behavior.enums';

export type { DispatchRetryPolicy } from './dispatch-retry-policy.types';

export type { DispatchEscalationPolicy } from './dispatch-escalation-policy.types';

export type { DispatchBehaviorProfile } from './dispatch-behavior.types';

export {
  createDispatchRetryPolicy,
  createDispatchEscalationPolicy,
  createDispatchBehaviorProfile,
  type CreateDispatchRetryPolicyInput,
  type CreateDispatchEscalationPolicyInput,
  type CreateDispatchBehaviorProfileInput,
} from './dispatch-behavior.entity';

// Retry Policy Model Types
export {
  RetryEligibilityStatus,
  type RetryEligibilityCriteria,
  type RetryEligibilityRecord,
} from './dispatch-retry-eligibility.types';

export {
  RetryExhaustionStatus,
  type RetryAttemptCounter,
  type RetryBackoffExhaustion,
  type RetryTimeWindow,
  type RetryExhaustionRecord,
} from './dispatch-retry-exhaustion.types';

export {
  RetryDelayState,
  type RetryDelayBoundary,
  type RetryBackoffFunctionSpec,
  type RetryDelaySchedule,
  type RetryDelayRecord,
} from './dispatch-retry-delay.types';

export {
  RetryConstraintType,
  RetryConstraintStatus,
  type RetryConstraint,
  type RetryConstraintsCollection,
  type RetryConstraintBoundary,
} from './dispatch-retry-constraint.types';

export {
  RetryReasonCategory,
  type RetryAllowReason,
  type RetryBlockReason,
  type RetryReasonVerdict,
} from './dispatch-retry-reason.types';

// Escalation Policy Model Types
export {
  EscalationTriggerType,
  type EscalationTriggerCondition,
  type EscalationTriggerSpec,
} from './dispatch-escalation-trigger.types';

export {
  EscalationTargetType,
  type EscalationTargetRoute,
  type EscalationTargetRouting,
} from './dispatch-escalation-target.types';

export {
  NotificationChannel,
  NotificationPriority,
  type NotificationChannelPreference,
  type EscalationNotificationTemplate,
  type EscalationNotificationSpec,
} from './dispatch-escalation-notification.types';

export {
  EscalationConstraintType,
  EscalationConstraintStatus,
  type EscalationConstraint,
  type EscalationConstraintsCollection,
  type EscalationConstraintBoundary,
} from './dispatch-escalation-constraint.types';

export {
  EscalationReasonCategory,
  type EscalationAllowReason,
  type EscalationBlockReason,
  type EscalationReasonVerdict,
} from './dispatch-escalation-reason.types';

export {
  EscalationEligibilityStatus,
  type EscalationEligibilityCriteria,
  type EscalationEligibilityRecord,
} from './dispatch-escalation-eligibility.types';
