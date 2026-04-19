/**
 * Capacity Feasibility Contract
 *
 * Defines structural support for capacity-aware feasibility evaluation.
 * Capacity constraints determine whether a candidate action can proceed
 * given available resource capacity.
 *
 * RESPONSIBILITY:
 * - Define what capacity information is needed for feasibility evaluation
 * - Show how candidates relate to capacity requirements
 * - Carry feasibility outcome (can/cannot proceed given capacity)
 * - No execution, no persistence, no real capacity data integration
 * - Structural only: defines surfaces, not algorithms
 *
 * SCOPE:
 * - Feasibility-stage constraint (pre-selection filtering)
 * - Evaluates: does candidate require capacity that's unavailable?
 * - Uses: CapacityState from RuntimeContext
 * - Output: feasible or infeasible (not "recommended" or "optimal")
 * - Deterministic: same candidate + same capacity state = same result
 *
 * INTEGRATION:
 * - Consumed by optimization feasibility evaluation (Phase 1)
 * - Uses RuntimeContext.capacityState if provided
 * - No modification of CapacityState
 * - No fallback behavior or hidden inference
 */

/**
 * CapacityRequirement: What capacity a candidate action needs
 *
 * RESPONSIBILITY:
 * - Identifies which resource is needed
 * - States how much capacity is required
 * - Caller-provided: no generation, no inference
 * - Used to evaluate against available capacity
 *
 * SCOPE:
 * - Structural only: what is needed
 * - No policy about how to calculate requirements
 * - No default values or hidden assumptions
 * - No optimization of requirements
 */
export interface CapacityRequirement {
  /**
   * Which resource capacity is needed.
   * Caller-provided: identifies the capacity dimension.
   * Links to CapacityMeasurement.capacityResourceId in CapacityState.
   */
  readonly capacityResourceId: string;

  /**
   * How much capacity is required.
   * Caller-provided: numeric quantity needed.
   * Later evaluated against available capacity.
   */
  readonly requiredCapacity: number;
}

/**
 * CandidateCapacityProfile: Capacity requirements for a specific candidate
 *
 * RESPONSIBILITY:
 * - Lists all capacity requirements for a candidate
 * - Attached to candidate for feasibility evaluation
 * - Caller-provided: no generation, no inference
 * - Used during feasibility checking
 */
export interface CandidateCapacityProfile {
  /**
   * Capacity requirements this candidate needs.
   * Empty array if candidate has no capacity requirements.
   * Caller-provided: what this candidate specifically needs.
   */
  readonly requirements: ReadonlyArray<CapacityRequirement>;
}

/**
 * CapacityFeasibility: Outcome of capacity feasibility evaluation
 *
 * RESPONSIBILITY:
 * - Shows whether candidate is feasible from capacity perspective
 * - Carries evaluation outcome with deterministic semantics
 * - Carries diagnostic information for tracing
 * - No hidden behavior or assumptions
 * - Deterministic: same input = same result
 *
 * OUTCOME STATES:
 * - "yes": candidate evaluated and has sufficient capacity available
 * - "no": candidate evaluated and does not have required capacity
 * - "unknown": constraint not evaluated due to missing required runtime state (structural, not caller decision)
 */
export interface CapacityFeasibility {
  /**
   * Is this candidate feasible from capacity perspective?
   * "yes" = evaluated and sufficient capacity available
   * "no" = evaluated and insufficient capacity
   * "unknown" = not evaluated: required runtime state (capacityState) not provided
   * ("unknown" is structural fact, not a fallback or caller-decided outcome)
   */
  readonly outcome: "yes" | "no" | "unknown";

  /**
   * Why is this the outcome? Diagnostic reason for tracing.
   * Examples:
   * - outcome="yes": "capacity available for all requirements"
   * - outcome="no": "insufficient capacity for: [resource1, resource2]"
   * - outcome="unknown": "not evaluated (runtime capacity state not provided)"
   * Used for tracing; not used in constraint evaluation logic.
   */
  readonly reason: string;

  /**
   * Which resources were checked (if relevant).
   * List of capacityResourceId values that were evaluated.
   * Used for tracing; empty if not evaluated.
   */
  readonly checkedResources: ReadonlyArray<string>;

  /**
   * Which resources failed (if outcome is "no").
   * List of capacityResourceId values where capacity was insufficient.
   * Used for tracing; empty if outcome is not "no".
   */
  readonly failedResources: ReadonlyArray<string>;
}

/**
 * Capacity Feasibility Semantics:
 *
 * OUTCOME MEANINGS:
 * - "yes": Constraint successfully evaluated; candidate has required capacity
 * - "no": Constraint successfully evaluated; candidate lacks required capacity
 * - "unknown": Constraint not evaluated (structural): required runtime state not provided
 *
 * WHAT THIS ENABLES:
 * - Capacity-aware feasibility evaluation during optimization Phase 1
 * - Deterministic filtering of candidates without required capacity
 * - Explicit, traceable capacity constraint assessment
 * - Structural distinction: evaluated constraint vs unevaluated constraint
 *
 * WHAT THIS IS NOT:
 * - Not capacity allocation (execution/operational concern)
 * - Not capacity optimization (selection concern; separate from feasibility)
 * - Not real capacity data source (no integration yet)
 * - Not fallback behavior ("unknown" is structural, not "assume yes")
 * - Not policy enforcement (just mechanism)
 *
 * UNKNOWN SEMANTICS:
 * - "unknown" is NOT a vague or caller-decided outcome
 * - "unknown" is structural: constraint cannot be evaluated without runtime state
 * - When outcome="unknown": capacityState was null or candidate had no requirements
 * - How "unknown" is handled at optimization boundary is optimization implementation responsibility (deterministic)
 * - Possible approaches: fail-safe, pass-through, or track separately - but must be deterministic, not vague
 *
 * HOW OPTIMIZATION USES THIS:
 * - Phase 1 (Feasibility): For each candidate, check CapacityFeasibility.outcome
 * - outcome="yes": candidate passes this dimension
 * - outcome="no": candidate fails this dimension (rejected)
 * - outcome="unknown": handled deterministically by optimization implementation (not caller-decided)
 *
 * DETERMINISM GUARANTEE:
 * - Same candidate + same CapacityState = same CapacityFeasibility
 * - No randomness, no adaptive behavior, no hidden state
 * - Result deterministic based on input values only
 * - Fully traceable: can verify result by re-evaluating
 *
 * INTEGRATION PATTERN:
 * - Candidate provides: CandidateCapacityProfile with requirements
 * - RuntimeContext provides: CapacityState with measurements
 * - Feasibility evaluator produces: CapacityFeasibility outcome
 * - Optimizer Phase 1 uses outcome for feasibility filtering
 * - No interaction between capacity feasibility and selection logic
 */
