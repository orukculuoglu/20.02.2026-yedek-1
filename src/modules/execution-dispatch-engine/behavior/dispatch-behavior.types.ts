import { DispatchRetryPolicy } from './dispatch-retry-policy.types';
import { DispatchEscalationPolicy } from './dispatch-escalation-policy.types';
import { DispatchBehaviorDisposition } from './dispatch-behavior.enums';

/**
 * Dispatch Behavior Profile Type
 *
 * Represents a deterministic aggregate combining all behavioral policies
 * that govern how a dispatch behaves when execution outcomes occur.
 *
 * A behavior profile encapsulates:
 * - The dispatch identity
 * - Retry policy (if applicable)
 * - Escalation policy (if applicable)
 * - Behavior disposition (how the system should respond)
 *
 * Purpose:
 * The behavior profile is the complete behavioral contract for a dispatch.
 * It defines what the system should do when the dispatch fails, succeeds,
 * times out, or encounters other outcomes. It combines all policy knowledge
 * into a single, queryable artifact.
 *
 * Immutable:
 * Behavior profiles are immutable once created. Updates create new profile instances.
 *
 * Lifecycle:
 * CREATED → (evaluated against outcomes) → Determines behavioral response
 */
export interface DispatchBehaviorProfile {
  /**
   * Unique identifier for this behavior profile
   * Explicitly provided from behavior profile source layer
   */
  behaviorProfileId: string;

  /**
   * The dispatch intent ID this profile governs
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * The retry policy governing automatic retry behavior
   * Optional - may be null if no retry is configured
   */
  retryPolicy: DispatchRetryPolicy | null;

  /**
   * The escalation policy governing escalation behavior
   * Optional - may be null if no escalation is configured
   */
  escalationPolicy: DispatchEscalationPolicy | null;

  /**
   * Current behavioral disposition for this dispatch
   * Determines the system's response when outcomes occur
   * Must be one of DispatchBehaviorDisposition enum values
   */
  disposition: DispatchBehaviorDisposition;

  /**
   * Timestamp when this behavior profile was created (milliseconds since epoch)
   * Explicitly provided from behavior profile layer
   */
  createdAt: number;

  /**
   * Timestamp when this behavior profile was last updated (milliseconds since epoch)
   * Explicitly provided from behavior profile layer
   */
  updatedAt: number;
}
