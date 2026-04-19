/**
 * Optimization Constraint Contract
 * Defines explicit structural boundaries that optimization must respect.
 * Caller-provided boundaries for feasibility, scope, and deterministic control.
 * No feasibility evaluation runtime, no policy override logic, no validation engine.
 * 
 * CONSTRAINT SEMANTICS CLOSURE (Phase 2):
 * This layer defines what constraints CAN be expressed, but not all constraints are equally evaluable at feasibility time.
 * 
 * FEASIBILITY-RELEVANT CONSTRAINTS (evaluable from candidate alone at feasibility time):
 * - ForbiddenActionConstraint: explicit exclusion of specific actions/entities
 * - RegionalRestrictionConstraint: geographic/regional membership checks (for region-aware candidates)
 * 
 * DEFERRED / NON-FEASIBILITY-RELEVANT CONSTRAINTS (require runtime/selection context):
 * - CapacityConstraint: requires current capacity state (not candidate property)
 * - StockConstraint: requires current stock state (not candidate property)
 * - SLATimeConstraint: requires timing state and current SLA position (not candidate property)
 * - RequiredActionConstraint: determines selection requirement (not feasibility evaluation)
 * - DeterministicControlConstraint: ordering/precedence (selection concern, not feasibility)
 * 
 * CONSTRAINT BOUNDARY ENFORCEMENT:
 * - Feasibility evaluator ONLY evaluates feasibility-relevant constraints
 * - Deferred constraints are explicitly NOT evaluated at feasibility time
 * - Selection phase may later consume deferred constraints if needed
 * - Execution phase may later consume all constraint types if needed
 * - This design eliminates "fake completeness" - no silent multi-phase constraint application
 * 
 * RESPONSIBILITY SEPARATION:
 * - Feasibility boundary: what is evaluable from candidate properties alone
 * - Selection boundary: what requires ordering and selection logic
 * - Execution boundary: what requires runtime state and execution context
 * - No cross-boundary semantic drift; each constraint is explicitly positioned
 */

/**
 * CapacityConstraint
 * Defines capacity limits for specific resources or entities.
 * 
 * EVALUATION STATUS: DEFERRED (not feasibility-relevant)
 * Reason: Requires current capacity state which is not a candidate property.
 * This constraint is intended for execution-phase validation or selection optimization.
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
 * 
 * EVALUATION STATUS: DEFERRED (not feasibility-relevant)
 * Reason: Requires current stock state which is not a candidate property.
 * This constraint is intended for execution-phase validation or selection optimization.
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
 * 
 * EVALUATION STATUS: DEFERRED (not feasibility-relevant)
 * Reason: Requires timing state and current SLA position which are not candidate properties.
 * This constraint is intended for execution-phase validation or selection optimization.
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
 * 
 * EVALUATION STATUS: FEASIBILITY-RELEVANT (for region-aware candidates only)
 * Evaluable at feasibility time for candidates with region information.
 * Evaluates: is candidate's destination region in allowed regions?
 * Applicable to: regional_balancing candidates (have destinationRegionId property)
 * Non-applicable to: routing candidates, stock candidates (no region property)
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
 * 
 * EVALUATION STATUS: DEFERRED (not feasibility-relevant)
 * Reason: This is a selection requirement, not a feasibility constraint.
 * A candidate can be feasible but not required; selection phase determines inclusion.
 * This constraint is intended for selection-phase logic.
 */
export interface RequiredActionConstraint {
  readonly kind: "required_action";

  /** Action or entity identifier that must be selected (caller-provided) */
  readonly requiredId: string;
}

/**
 * ForbiddenActionConstraint
 * Defines actions or entities that must NOT be included in solution.
 * 
 * EVALUATION STATUS: FEASIBILITY-RELEVANT
 * Evaluable at feasibility time from candidate id alone.
 * Evaluates: does candidate.candidateId match forbidden id?
 * If yes: candidate is infeasible and rejected immediately.
 */
export interface ForbiddenActionConstraint {
  readonly kind: "forbidden_action";

  /** Action or entity identifier that must be excluded (caller-provided) */
  readonly forbiddenId: string;
}

/**
 * DeterministicControlConstraint
 * Defines deterministic ordering or precedence for tie-breaking without hidden logic.
 * 
 * EVALUATION STATUS: DEFERRED (not feasibility-relevant)
 * Reason: This is an ordering/tie-break preference, not a feasibility constraint.
 * All candidates matching other constraints remain feasible regardless of ordering.
 * This constraint is intended for selection-phase ordering logic.
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
 * 
 * Note: Not all constraint types are evaluated at feasibility time.
 * See each constraint's EVALUATION STATUS above.
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
 * Collection of constraints that define the optimization boundaries.
 * 
 * Note: Feasibility evaluator only evaluates feasibility-relevant constraints.
 * Other constraints are preserved for later phases but not applied at feasibility time.
 */
export interface OptimizationConstraintSet {
  /** Collection of constraints (readonly, all caller-provided) */
  readonly constraints: readonly OptimizationConstraint[];
}

/**
 * Constraint behavior:
 * - Structural-only definition of boundaries
 * - Explicitly positioned constraints (feasibility-relevant vs deferred)
 * - No fake completeness: deferred constraints are not evaluated at feasibility time
 * - No policy override or exception handling
 * - Caller defines all constraints explicitly
 * - Optimizer or evaluator respects constraints during decision-making
 * - All values are caller-provided; no runtime generation or inference
 * 
 * Deterministic constraint doctrine:
 * - Same constraint input means same constraint semantics across all invocations
 * - Feasibility-relevant constraints always evaluated at feasibility time
 * - Deferred constraints never evaluated at feasibility time (eliminates surprise evaluations)
 * - No fallback constraint semantics
 * - No metadata overflow
 * - No semantic drift between candidate/feasible/selected boundaries
 */
