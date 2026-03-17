/**
 * Dispatch Escalation Trigger Types
 *
 * Models the explicit conditions and signals that trigger escalation of a dispatch.
 *
 * Purpose:
 * Escalation triggers capture deterministic conditions that initiate escalation,
 * separate from escalation policy. Provides explicit control over when escalation occurs.
 */

/**
 * Escalation Trigger Type Enum
 *
 * Categorizes different types of escalation triggers.
 *
 * Types:
 * - FAILURE_CLASSIFICATION: Trigger based on failure type/category
 * - TIMEOUT: Trigger based on timeout condition
 * - EXHAUSTION: Trigger based on retry/resource exhaustion
 * - CONSTRAINT_VIOLATION: Trigger based on constraint violation
 * - ACTOR_UNAVAILABLE: Trigger based on actor/channel unavailability
 * - BUSINESS_RULE: Trigger based on business rule violation
 * - MANUAL: Trigger based on manual request
 * - CUSTOM: Custom application-defined trigger
 */
export enum EscalationTriggerType {
  FAILURE_CLASSIFICATION = 'FAILURE_CLASSIFICATION',
  TIMEOUT = 'TIMEOUT',
  EXHAUSTION = 'EXHAUSTION',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  ACTOR_UNAVAILABLE = 'ACTOR_UNAVAILABLE',
  BUSINESS_RULE = 'BUSINESS_RULE',
  MANUAL = 'MANUAL',
  CUSTOM = 'CUSTOM',
}

/**
 * Escalation Trigger Condition Type
 *
 * Represents a single condition that can trigger escalation.
 *
 * Immutable:
 * Trigger conditions are immutable once created.
 */
export interface EscalationTriggerCondition {
  /**
   * Unique identifier for this trigger condition
   * Explicitly provided from escalation policy definition
   */
  conditionId: string;

  /**
   * Trigger type
   * Categorizes what kind of condition triggers escalation
   */
  type: EscalationTriggerType;

  /**
   * Condition classification or category
   * Specific condition being evaluated
   * Examples: PERMANENT_ERROR, TIMEOUT_EXCEEDED, ACTOR_DOWN, etc.
   */
  classification: string;

  /**
   * Threshold or boundary value for this trigger
   * Explicit value that activates trigger
   * Examples: timeout milliseconds, attempt count, etc.
   * null if trigger is binary (no threshold)
   */
  thresholdValue: number | string | null;

  /**
   * Description of what this trigger condition represents
   * Human-readable explanation
   */
  description: string;

  /**
   * Metadata contextual to this trigger condition
   * Additional structured data about the trigger
   */
  metadata: Record<string, unknown>;

  /**
   * Timestamp when this trigger condition was created (milliseconds since epoch)
   * Explicitly provided from escalation policy layer
   */
  createdAt: number;
}

/**
 * Escalation Trigger Specification Type
 *
 * Represents the set of conditions that can trigger escalation for a dispatch.
 *
 * Immutable:
 * Trigger specifications are immutable once created.
 */
export interface EscalationTriggerSpec {
  /**
   * Unique identifier for this trigger specification
   * Explicitly provided from escalation policy definition
   */
  triggerSpecId: string;

  /**
   * The dispatch ID this trigger specification applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * All trigger conditions applicable to this dispatch
   * Immutable collection of conditions
   */
  conditions: readonly EscalationTriggerCondition[];

  /**
   * Timestamp when this trigger specification was created (milliseconds since epoch)
   * Explicitly provided from escalation policy layer
   */
  createdAt: number;

  /**
   * Timestamp when this specification was last updated (milliseconds since epoch)
   * Explicitly provided from escalation policy layer
   */
  updatedAt: number;
}
