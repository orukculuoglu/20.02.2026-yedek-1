import { DispatchEscalationLevel } from './dispatch-behavior.enums';

/**
 * Dispatch Escalation Constraint Types
 *
 * Models the explicit constraints that govern escalation behavior.
 *
 * Purpose:
 * Escalation constraints capture hard boundaries on escalation attempts,
 * separate from escalation policy. Provides deterministic constraint boundaries.
 */

/**
 * Escalation Constraint Value Type
 *
 * Strict scalar type for escalation constraint values.
 * Prevents overly loose unknown types while allowing diverse value kinds.
 */
export type EscalationConstraintValue = string | number | boolean | null;

/**
 * Escalation Constraint Type Enum
 *
 * Categorizes different types of escalation constraints.
 *
 * Types:
 * - FREQUENCY_LIMIT: Minimum time between escalations
 * - ESCALATION_LIMIT: Maximum number of escalations
 * - TIME_WINDOW_LIMIT: Maximum time window for escalations
 * - COST_LIMIT: Maximum cost/quota for escalations
 * - RESOURCE_LIMIT: Maximum resource allocation for escalations
 * - RATE_LIMIT: Rate limiting on escalation frequency
 * - CUSTOM: Custom application-defined constraint
 */
export enum EscalationConstraintType {
  FREQUENCY_LIMIT = 'FREQUENCY_LIMIT',
  ESCALATION_LIMIT = 'ESCALATION_LIMIT',
  TIME_WINDOW_LIMIT = 'TIME_WINDOW_LIMIT',
  COST_LIMIT = 'COST_LIMIT',
  RESOURCE_LIMIT = 'RESOURCE_LIMIT',
  RATE_LIMIT = 'RATE_LIMIT',
  CUSTOM = 'CUSTOM',
}

/**
 * Escalation Constraint Status Enum
 *
 * Represents the current violation state of an escalation constraint.
 *
 * States:
 * - VALID: Constraint is not violated
 * - WARNING: Constraint approaching violation threshold
 * - VIOLATED: Constraint is violated
 * - UNENFORCEABLE: Constraint cannot be enforced
 */
export enum EscalationConstraintStatus {
  VALID = 'VALID',
  WARNING = 'WARNING',
  VIOLATED = 'VIOLATED',
  UNENFORCEABLE = 'UNENFORCEABLE',
}

/**
 * Individual Escalation Constraint Type
 *
 * Represents a single constraint on escalation behavior.
 *
 * Immutable:
 * Constraints are immutable once created.
 */
export interface EscalationConstraint {
  /**
   * Unique identifier for this constraint
   * Explicitly provided from constraint source
   */
  constraintId: string;

  /**
   * The dispatch ID this constraint applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Type of constraint
   * Categorizes what is being constrained
   */
  type: EscalationConstraintType;

  /**
   * Current enforcement status
   * Whether constraint is respected, warned, or violated
   */
  status: EscalationConstraintStatus;

  /**
   * Constraint limit value
   * The boundary that must not be exceeded
   * Scalar type: string | number | boolean | null
   */
  limitValue: EscalationConstraintValue;

  /**
   * Current usage/consumption against constraint
   * How much of the limit has been used
   * Scalar type: string | number | boolean | null
   */
  currentUsage: EscalationConstraintValue;

  /**
   * Whether constraint is currently violated
   * true if currentUsage exceeds limitValue
   */
  isViolated: boolean;

  /**
   * Violation threshold warning level (0-100)
   * When to trigger warning before actual violation
   * Example: 80 means warn when 80% of limit consumed
   */
  warningThresholdPercent: number;

  /**
   * Whether constraint is currently in warning state
   * true if usage exceeds warning threshold but not limit
   */
  isWarning: boolean;

  /**
   * Optional enforcement action if violated
   * What should happen if constraint is violated
   * Examples: BLOCK_ESCALATION, ALERT, LOG_ONLY
   */
  enforcementAction: string | null;

  /**
   * Description of what this constraint enforces
   * Human-readable explanation
   */
  description: string;

  /**
   * Timestamp when this constraint was created (milliseconds since epoch)
   * Explicitly provided from constraint source
   */
  createdAt: number;

  /**
   * Timestamp when this constraint was last updated (milliseconds since epoch)
   * Explicitly provided from constraint source
   */
  updatedAt: number;
}

/**
 * Escalation Constraints Collection Type
 *
 * Represents all constraints applying to an escalation.
 *
 * Immutable:
 * Collections are immutable once created.
 */
export interface EscalationConstraintsCollection {
  /**
   * The dispatch ID these constraints apply to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * All constraints applicable to this escalation
   * Immutable collection of constraints
   */
  constraints: readonly EscalationConstraint[];

  /**
   * Overall constraint compliance status
   * VALID if all constraints valid, VIOLATED if any violated
   */
  overallStatus: EscalationConstraintStatus;

  /**
   * Constraints that are currently violated
   * Subset of constraints with status = VIOLATED
   */
  violatedConstraints: readonly EscalationConstraint[];

  /**
   * Constraints in warning state
   * Subset of constraints with status = WARNING
   */
  warningConstraints: readonly EscalationConstraint[];

  /**
   * Whether any constraint blocks escalation
   * true if any constraint with BLOCK_ESCALATION action is violated
   */
  isEscalationBlocked: boolean;

  /**
   * Whether any constraint requires additional alerting
   * true if any constraint with ALERT action is violated
   */
  requiresAlert: boolean;

  /**
   * Timestamp when this collection was created (milliseconds since epoch)
   * Explicitly provided from constraint source
   */
  createdAt: number;

  /**
   * Timestamp when this collection was last updated (milliseconds since epoch)
   * Explicitly provided from constraint source
   */
  updatedAt: number;
}

/**
 * Escalation Constraint Boundary Type
 *
 * Represents hard boundaries on escalation behavior.
 *
 * Immutable:
 * Boundaries are immutable once created.
 */
export interface EscalationConstraintBoundary {
  /**
   * Maximum escalations allowed
   * Hard upper limit on escalation attempts
   * null if no limit
   */
  absoluteMaxEscalations: number | null;

  /**
   * Minimum time between escalations (milliseconds)
   * Hard lower bound on escalation frequency
   * null if no limit
   */
  absoluteMinFrequencyMs: number | null;

  /**
   * Maximum time window for escalations (milliseconds)
   * Hard upper bound on duration span for escalations
   * null if no limit
   */
  absoluteMaxTimeWindowMs: number | null;

  /**
   * Maximum cost/quota allowed for escalations
   * Hard upper bound on resource usage
   * null if no limit
   */
  absoluteMaxCost: number | null;

  /**
   * Maximum escalation level allowed
   * Hard upper bound on severity (LOW < MEDIUM < HIGH < CRITICAL)
   * null if no limit
   */
  absoluteMaxEscalationLevel: DispatchEscalationLevel | null;
}
