/**
 * Availability/Readiness Feasibility Contract
 *
 * Defines structural support for availability-aware feasibility evaluation.
 * Availability constraints determine whether a candidate action can proceed
 * given resource readiness and operational conditions.
 *
 * RESPONSIBILITY:
 * - Define what availability information is needed for feasibility evaluation
 * - Show how candidates relate to resource availability requirements
 * - Carry feasibility outcome (can/cannot proceed given availability)
 * - No execution, no persistence, no real monitoring integration
 * - Structural only: defines surfaces, not algorithms
 *
 * SCOPE:
 * - Feasibility-stage constraint (pre-selection filtering)
 * - Evaluates: are required resources available and ready?
 * - Uses: AvailabilityState from RuntimeContext
 * - Output: feasible or infeasible (not "recommended" or "optimal")
 * - Deterministic: same candidate + same availability state = same result
 *
 * INTEGRATION:
 * - Consumed by optimization feasibility evaluation (Phase 1)
 * - Uses RuntimeContext.availabilityState if provided
 * - No modification of AvailabilityState
 * - No live monitoring or polling
 * - No fallback behavior or hidden inference
 */

/**
 * AvailabilityRequirement: What resource availability a candidate action needs
 *
 * RESPONSIBILITY:
 * - Identifies which resource must be available
 * - States what availability status is required
 * - Caller-provided: no generation, no inference
 * - Used to evaluate against available resources
 *
 * SCOPE:
 * - Structural only: what is needed
 * - No policy about acceptable status values
 * - No default values or hidden assumptions
 * - No optimization of availability requirements
 */
export interface AvailabilityRequirement {
  /**
   * Which resource must be available.
   * Caller-provided: identifies the required resource.
   * Links to ResourceAvailability.resourceId in AvailabilityState.
   */
  readonly resourceId: string;

  /**
   * What status is required for this resource.
   * Bounded set: "available" | "unavailable" | "degraded" | "unknown" | "*any*"
   * Caller-provided: which statuses are acceptable for this candidate.
   * "*any*" means any status is acceptable (no restriction).
   */
  readonly acceptableStatuses: ReadonlyArray<"available" | "unavailable" | "degraded" | "unknown" | "*any*">;
}

/**
 * CandidateAvailabilityProfile: Availability requirements for a specific candidate
 *
 * RESPONSIBILITY:
 * - Lists all availability requirements for a candidate
 * - Attached to candidate for feasibility evaluation
 * - Caller-provided: no generation, no inference
 * - Used during feasibility checking
 */
export interface CandidateAvailabilityProfile {
  /**
   * Availability requirements this candidate needs.
   * Empty array if candidate has no specific availability requirements.
   * Caller-provided: what resource conditions this candidate needs.
   */
  readonly requirements: ReadonlyArray<AvailabilityRequirement>;

  /**
   * Does system-wide readiness matter for this candidate?
   * true = candidate only feasible if system is ready (systemReady in AvailabilityState)
   * false = candidate feasible regardless of system readiness
   * Caller-provided: whether global readiness is a constraint for this candidate.
   */
  readonly requiresSystemReady: boolean;
}

/**
 * AvailabilityFeasibility: Outcome of availability feasibility evaluation
 *
 * RESPONSIBILITY:
 * - Shows whether candidate is feasible from availability perspective
 * - Carries evaluation outcome with deterministic semantics
 * - Carries diagnostic information for tracing
 * - No hidden behavior or assumptions
 * - Deterministic: same input = same result
 *
 * OUTCOME STATES:
 * - "yes": candidate evaluated and required resources are available and ready
 * - "no": candidate evaluated and required resources are not available
 * - "unknown": constraint not evaluated due to missing required runtime state (structural, not caller decision)
 */
export interface AvailabilityFeasibility {
  /**
   * Is this candidate feasible from availability perspective?
   * "yes" = evaluated and all required resources available and ready
   * "no" = evaluated and one or more required resources not available
   * "unknown" = not evaluated: required runtime state (availabilityState) not provided
   * ("unknown" is structural fact, not a fallback or caller-decided outcome)
   */
  readonly outcome: "yes" | "no" | "unknown";

  /**
   * Why is this the outcome?
   * Diagnostic information for tracing/debugging.
   * Examples: "resources ready", "resource unavailable", "no availability state provided"
   * Caller can inspect for debugging; not used in optimization logic.
   */
  readonly reason: string;

  /**
   * Which resources were checked (if relevant).
   * List of resourceId values that were evaluated.
   * Used for tracing; empty if not evaluated.
   */
  readonly checkedResources: ReadonlyArray<string>;

  /**
   * Which resources failed (if outcome is "no").
   * List of resourceId values where availability was not met.
   * Used for tracing; empty if outcome is not "no".
   */
  readonly failedResources: ReadonlyArray<string>;

  /**
   * Was system-wide readiness checked (if relevant).
   * true if system readiness requirement was evaluated
   * false if system readiness was not a requirement for this candidate
   * Used for tracing.
   */
  readonly systemReadinessChecked: boolean;
}

/**
 * Availability/Readiness Feasibility Semantics:
 *
 * OUTCOME MEANINGS:
 * - "yes": Constraint successfully evaluated; required resources are available and ready
 * - "no": Constraint successfully evaluated; required resources are not available
 * - "unknown": Constraint not evaluated (structural): required runtime state not provided
 *
 * WHAT THIS ENABLES:
 * - Availability-aware feasibility evaluation during optimization Phase 1
 * - Deterministic filtering of candidates with unavailable resources
 * - Explicit, traceable resource readiness constraint assessment
 * - Structural distinction: evaluated constraint vs unevaluated constraint
 *
 * WHAT THIS IS NOT:
 * - Not resource allocation (execution/operational concern)
 * - Not availability optimization (selection concern; separate from feasibility)
 * - Not real monitoring or live health checking (no integration)
 * - Not fallback behavior ("unknown" is structural, not "assume yes")
 * - Not policy enforcement (just mechanism)
 *
 * UNKNOWN SEMANTICS:
 * - "unknown" is NOT a vague or caller-decided outcome
 * - "unknown" is structural: constraint cannot be evaluated without runtime state
 * - When outcome="unknown": availabilityState was null or candidate had no requirements
 * - How "unknown" is handled at optimization boundary is optimization implementation responsibility (deterministic)
 * - Possible approaches: fail-safe, pass-through, or track separately - but must be deterministic, not vague
 *
 * HOW OPTIMIZATION USES THIS:
 * - Phase 1 (Feasibility): For each candidate, check AvailabilityFeasibility.outcome
 * - outcome="yes": candidate passes this dimension
 * - outcome="no": candidate fails this dimension (rejected)
 * - outcome="unknown": handled deterministically by optimization implementation (not caller-decided)
 *
 * DETERMINISM GUARANTEE:
 * - Same candidate + same AvailabilityState = same AvailabilityFeasibility
 * - No randomness, no adaptive behavior, no hidden state
 * - Result deterministic based on input values only
 * - Fully traceable: can verify result by re-evaluating
 *
 * INTEGRATION PATTERN:
 * - Candidate provides: CandidateAvailabilityProfile with requirements
 * - RuntimeContext provides: AvailabilityState with resource measurements
 * - Feasibility evaluator produces: AvailabilityFeasibility outcome
 * - Optimizer Phase 1 uses outcome for feasibility filtering
 * - No interaction between availability feasibility and selection logic
 *
 * STATUS REPRESENTATION:
 * - Four bounded statuses: available, unavailable, degraded, unknown
 * - "*any*" wildcard for flexible requirements
 * - No interpretation of status meanings (exact match required)
 * - System-wide readiness is separate from individual resource readiness
 */
