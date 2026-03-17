import { DispatchEscalationLevel } from './dispatch-behavior.enums';

/**
 * Dispatch Escalation Target Types
 *
 * Models the explicit targets and routing semantics for escalated dispatches.
 *
 * Purpose:
 * Escalation targets capture where and how an escalation should be routed,
 * separate from escalation policy. Provides deterministic routing contracts.
 */

/**
 * Escalation Target Type Enum
 *
 * Categorizes different types of escalation targets.
 *
 * Types:
 * - PERSON: Individual person/team member
 * - GROUP: Team or group of people
 * - SYSTEM: Automated system handler
 * - EXTERNAL: External service or provider
 * - HIERARCHY: Organizational hierarchy routing
 * - CUSTOM: Custom application-defined target
 */
export enum EscalationTargetType {
  PERSON = 'PERSON',
  GROUP = 'GROUP',
  SYSTEM = 'SYSTEM',
  EXTERNAL = 'EXTERNAL',
  HIERARCHY = 'HIERARCHY',
  CUSTOM = 'CUSTOM',
}

/**
 * Escalation Target Route Type
 *
 * Represents a single routing destination for an escalated dispatch.
 *
 * Immutable:
 * Target routes are immutable once created.
 */
export interface EscalationTargetRoute {
  /**
   * Unique identifier for this target route
   * Explicitly provided from escalation targeting layer
   */
  routeId: string;

  /**
   * Type of escalation target
   * Categorizes the kind of target
   */
  targetType: EscalationTargetType;

  /**
   * Target identification handle
   * System identifier, email, phone, URI, or reference
   * What identifies the target uniquely
   */
  targetHandle: string;

  /**
   * Human-readable name or description of target
   * Display name for the target
   */
  targetName: string;

  /**
   * Priority order for this routing destination
   * Lower numbers = higher priority
   * 0 = primary, 1 = secondary fallback, etc.
   */
  routePriority: number;

  /**
   * Optional routing condition
   * If provided, escalation to this target only occurs if condition is met
   * Examples: 'BUSINESS_HOURS_ONLY', 'PRIORITY_HIGH_ONLY', etc.
   * null if no condition
   */
  routeCondition: string | null;

  /**
   * Metadata contextual to this target route
   * Additional structured data about target
   */
  metadata: Record<string, unknown>;

  /**
   * Timestamp when this route was created (milliseconds since epoch)
   * Explicitly provided from escalation targeting layer
   */
  createdAt: number;

  /**
   * Timestamp when this route was last updated (milliseconds since epoch)
   * Explicitly provided from escalation targeting layer
   */
  updatedAt: number;
}

/**
 * Escalation Target Routing Specification Type
 *
 * Represents the complete set of routing destinations for a dispatch escalation.
 *
 * Immutable:
 * Routing specifications are immutable once created.
 */
export interface EscalationTargetRouting {
  /**
   * Unique identifier for this routing specification
   * Explicitly provided from escalation targeting layer
   */
  routingSpecId: string;

  /**
   * The dispatch ID this routing applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Escalation level this routing applies to
   * LOW, MEDIUM, HIGH, CRITICAL
   * Different routing for different severity levels
   */
  escalationLevel: DispatchEscalationLevel;

  /**
   * All active target routes for this escalation
   * Immutable collection of ordered routing destinations
   */
  routes: readonly EscalationTargetRoute[];

  /**
   * Broadcast to all active routes
   * true if escalation should be sent to all routes simultaneously
   * false if only primary route + fallbacks on failure
   */
  isBroadcastMode: boolean;

  /**
   * Timestamp when this routing specification was created (milliseconds since epoch)
   * Explicitly provided from escalation targeting layer
   */
  createdAt: number;

  /**
   * Timestamp when this specification was last updated (milliseconds since epoch)
   * Explicitly provided from escalation targeting layer
   */
  updatedAt: number;
}
