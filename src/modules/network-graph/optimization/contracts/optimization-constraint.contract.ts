/**
 * Optimization Constraint Contract
 * Defines explicit structural boundaries that optimization must respect.
 * Caller-provided boundaries for feasibility, scope, and deterministic control.
 * No feasibility evaluation runtime, no policy override logic, no validation engine.
 */

/**
 * CapacityConstraint
 * Defines capacity limits for specific resources or entities.
 */
export interface CapacityConstraint {
  readonly kind: "capacity";

  /** Resource or entity identifier (caller-provided) */
  readonly resourceId: string;

  /** Maximum capacity allowed (caller-provided) */
  readonly maxCapacity: number;

  /** Optional minimum capacity requirement (caller-provided) */
  readonly minCapacity?: number;
}

/**
 * StockConstraint
 * Defines available inventory or stock limits.
 */
export interface StockConstraint {
  readonly kind: "stock";

  /** Stock item identifier (caller-provided) */
  readonly itemId: string;

  /** Available quantity (caller-provided) */
  readonly availableQuantity: number;

  /** Optional minimum stock level (caller-provided) */
  readonly minimumLevel?: number;
}

/**
 * SLATimeConstraint
 * Defines SLA or time-based limits.
 */
export interface SLATimeConstraint {
  readonly kind: "sla_time";

  /** SLA entity or operation identifier (caller-provided) */
  readonly entityId: string;

  /** Maximum time allowed in milliseconds (caller-provided) */
  readonly maxTimeMs: number;

  /** Optional minimum response time in milliseconds (caller-provided) */
  readonly minTimeMs?: number;
}

/**
 * RegionalRestrictionConstraint
 * Defines geographic or regional boundaries.
 */
export interface RegionalRestrictionConstraint {
  readonly kind: "regional_restriction";

  /** Entity or service identifier (caller-provided) */
  readonly entityId: string;

  /** Allowed regions (caller-provided) */
  readonly allowedRegions: readonly string[];
}

/**
 * RequiredActionConstraint
 * Defines actions or entities that must be included in solution.
 */
export interface RequiredActionConstraint {
  readonly kind: "required_action";

  /** Action or entity identifier that must be selected (caller-provided) */
  readonly requiredId: string;
}

/**
 * ForbiddenActionConstraint
 * Defines actions or entities that must NOT be included in solution.
 */
export interface ForbiddenActionConstraint {
  readonly kind: "forbidden_action";

  /** Action or entity identifier that must be excluded (caller-provided) */
  readonly forbiddenId: string;
}

/**
 * DeterministicControlConstraint
 * Defines deterministic ordering or precedence for tie-breaking without hidden logic.
 */
export interface DeterministicControlConstraint {
  readonly kind: "deterministic_control";

  /** Explicit ordering rule name (caller-provided) */
  readonly controlName: string;

  /** Ordered list of entity/action IDs defining explicit precedence (caller-provided) */
  readonly precedenceOrder: readonly string[];
}

/**
 * OptimizationConstraint
 * Discriminated union of all constraint types.
 * Each constraint type is explicit and responsibility-based.
 */
export type OptimizationConstraint =
  | CapacityConstraint
  | StockConstraint
  | SLATimeConstraint
  | RegionalRestrictionConstraint
  | RequiredActionConstraint
  | ForbiddenActionConstraint
  | DeterministicControlConstraint;

/**
 * OptimizationConstraintSet
 * Collection of constraints that define the feasibility boundary.
 */
export interface OptimizationConstraintSet {
  /** Collection of constraints (readonly, all caller-provided) */
  readonly constraints: readonly OptimizationConstraint[];
}

/**
 * Constraint behavior:
 * - Structural-only definition of boundaries
 * - No feasibility evaluation logic
 * - No policy override or exception handling
 * - Caller defines all constraints explicitly
 * - Optimizer or evaluator respects constraints during decision-making
 * - All values are caller-provided; no runtime generation or inference
 */
