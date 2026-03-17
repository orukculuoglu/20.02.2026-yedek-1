import { DispatchEscalationLevel } from './dispatch-behavior.enums';
import { EscalationTriggerSpec } from './dispatch-escalation-trigger.types';
import { EscalationTargetRouting } from './dispatch-escalation-target.types';
import { EscalationNotificationSpec } from './dispatch-escalation-notification.types';
import { EscalationConstraintsCollection, EscalationConstraintBoundary } from './dispatch-escalation-constraint.types';

/**
 * Dispatch Escalation Policy Type
 *
 * Represents a deterministic aggregate combining all escalation policies
 * that govern how a dispatch escalates when execution outcomes occur.
 *
 * An escalation policy specifies:
 * - The escalation level (severity classification)
 * - Escalation trigger conditions
 * - Escalation target routing
 * - Notification strategy
 * - Escalation constraints
 * - Escalation boundaries
 *
 * Purpose:
 * Escalation policies provide explicit, deterministic control over escalation behavior
 * without implicit assumptions or magic numbers. Each dispatch can have its own
 * escalation policy applied based on criticality and operational requirements.
 *
 * Immutable:
 * Escalation policies are immutable once created. Updates create new policy instances.
 */
export interface DispatchEscalationPolicy {
  /**
   * Unique identifier for this escalation policy
   * Explicitly provided from escalation policy source layer
   */
  escalationPolicyId: string;

  /**
   * The dispatch intent ID this policy applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Escalation level determining severity and response
   * Must be one of DispatchEscalationLevel enum values
   */
  escalationLevel: DispatchEscalationLevel;

  /**
   * Escalation trigger specification
   * Defines what conditions trigger this escalation policy
   */
  triggerSpec: EscalationTriggerSpec;

  /**
   * Escalation target routing
   * Defines where escalations are routed (targets, routing order, broadcast mode)
   */
  targetRouting: EscalationTargetRouting;

  /**
   * Escalation notification specification
   * Defines how escalations are communicated (channels, templates, delivery strategy)
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
   * Timestamp when this escalation policy was created (milliseconds since epoch)
   * Explicitly provided from escalation policy layer
   */
  createdAt: number;

  /**
   * Timestamp when this escalation policy was last updated (milliseconds since epoch)
   * Explicitly provided from escalation policy layer
   */
  updatedAt: number;
}
