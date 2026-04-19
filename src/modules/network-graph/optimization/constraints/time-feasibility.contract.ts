/**
 * Time/SLA Feasibility Contract
 *
 * Defines structural support for time/SLA-aware feasibility evaluation.
 * Time constraints determine whether a candidate action can proceed
 * within applicable timing and SLA windows.
 *
 * RESPONSIBILITY:
 * - Define what timing information is needed for feasibility evaluation
 * - Show how candidates relate to time/SLA requirements
 * - Carry feasibility outcome (can/cannot proceed within timing window)
 * - No execution, no persistence, no real time service integration
 * - Structural only: defines surfaces, not algorithms
 *
 * SCOPE:
 * - Feasibility-stage constraint (pre-selection filtering)
 * - Evaluates: can candidate complete within SLA/timing constraints?
 * - Uses: SLATimeState from RuntimeContext
 * - Output: feasible or infeasible (not "recommended" or "optimal")
 * - Deterministic: same candidate + same SLA state = same result
 *
 * INTEGRATION:
 * - Consumed by optimization feasibility evaluation (Phase 1)
 * - Uses RuntimeContext.slaTimeState if provided
 * - No modification of SLATimeState
 * - No time generation or system clock integration
 * - No fallback behavior or hidden inference
 */

/**
 * TimeRequirement: What timing a candidate action needs
 *
 * RESPONSIBILITY:
 * - Identifies which SLA window applies
 * - States estimated completion time needed
 * - Caller-provided: no generation, no inference
 * - Used to evaluate against SLA constraints
 *
 * SCOPE:
 * - Structural only: what is needed
 * - No policy about how to calculate timing requirements
 * - No default values or hidden assumptions
 * - No optimization of timing requirements
 */
export interface TimeRequirement {
  /**
   * Which SLA window constraint applies to this candidate.
   * Caller-provided: identifies the relevant SLA window.
   * Links to SLAWindow.slaWindowId in SLATimeState.
   */
  readonly slaWindowId: string;

  /**
   * How much time this candidate needs to complete (milliseconds).
   * Caller-provided: numeric duration estimate.
   * Later evaluated against SLA window constraints.
   */
  readonly estimatedCompletionTimeMs: number;
}

/**
 * CandidateTimeProfile: Time/SLA requirements for a specific candidate
 *
 * RESPONSIBILITY:
 * - Lists all timing/SLA requirements for a candidate
 * - Attached to candidate for feasibility evaluation
 * - Caller-provided: no generation, no inference
 * - Used during feasibility checking
 */
export interface CandidateTimeProfile {
  /**
   * Timing/SLA requirements this candidate needs.
   * Empty array if candidate has no timing requirements.
   * Caller-provided: what timing constraints apply to this candidate.
   */
  readonly requirements: ReadonlyArray<TimeRequirement>;
}

/**
 * TimeFeasibility: Outcome of time/SLA feasibility evaluation
 *
 * RESPONSIBILITY:
 * - Shows whether candidate is feasible from timing perspective
 * - Carries evaluation outcome with deterministic semantics
 * - Carries diagnostic information for tracing
 * - No hidden behavior or assumptions
 * - Deterministic: same input = same result
 *
 * OUTCOME STATES:
 * - "yes": candidate evaluated and can complete within SLA windows
 * - "no": candidate evaluated and cannot complete within SLA constraints
 * - "unknown": constraint not evaluated due to missing required runtime state (structural, not caller decision)
 */
export interface TimeFeasibility {
  /**
   * Is this candidate feasible from timing perspective?
   * "yes" = evaluated and can complete within SLA constraints
   * "no" = evaluated and cannot complete within SLA constraints
   * "unknown" = not evaluated: required runtime state (slaTimeState) not provided
   * ("unknown" is structural fact, not a fallback or caller-decided outcome)
   */
  readonly outcome: "yes" | "no" | "unknown";

  /**
   * Why is this the outcome?
   * Diagnostic information for tracing/debugging.
   * Examples: "within window", "exceeds deadline", "no SLA state provided"
   * Caller can inspect for debugging; not used in optimization logic.
   */
  readonly reason: string;

  /**
   * Which SLA windows were checked (if relevant).
   * List of slaWindowId values that were evaluated.
   * Used for tracing; empty if not evaluated.
   */
  readonly checkedWindows: ReadonlyArray<string>;

  /**
   * Which SLA windows failed (if outcome is "no").
   * List of slaWindowId values where timing was infeasible.
   * Used for tracing; empty if outcome is not "no".
   */
  readonly failedWindows: ReadonlyArray<string>;
}

/**
 * Time/SLA Feasibility Semantics:
 *
 * OUTCOME MEANINGS:
 * - "yes": Constraint successfully evaluated; candidate can complete within timing constraints
 * - "no": Constraint successfully evaluated; candidate cannot complete within timing constraints
 * - "unknown": Constraint not evaluated (structural): required runtime state not provided
 *
 * WHAT THIS ENABLES:
 * - Time/SLA-aware feasibility evaluation during optimization Phase 1
 * - Deterministic filtering of candidates that cannot meet timing constraints
 * - Explicit, traceable SLA constraint assessment
 * - Structural distinction: evaluated constraint vs unevaluated constraint
 *
 * WHAT THIS IS NOT:
 * - Not time allocation (execution/operational concern)
 * - Not timing optimization (selection concern; separate from feasibility)
 * - Not real time service or clock (no Date.now(), no system integration)
 * - Not fallback behavior ("unknown" is structural, not "assume yes")
 * - Not policy enforcement (just mechanism)
 *
 * UNKNOWN SEMANTICS:
 * - "unknown" is NOT a vague or caller-decided outcome
 * - "unknown" is structural: constraint cannot be evaluated without runtime state
 * - When outcome="unknown": slaTimeState was null or candidate had no requirements
 * - How "unknown" is handled at optimization boundary is optimization implementation responsibility (deterministic)
 * - Possible approaches: fail-safe, pass-through, or track separately - but must be deterministic, not vague
 *
 * HOW OPTIMIZATION USES THIS:
 * - Phase 1 (Feasibility): For each candidate, check TimeFeasibility.outcome
 * - outcome="yes": candidate passes this dimension
 * - outcome="no": candidate fails this dimension (rejected)
 * - outcome="unknown": handled deterministically by optimization implementation (not caller-decided)
 *
 * DETERMINISM GUARANTEE:
 * - Same candidate + same SLATimeState = same TimeFeasibility
 * - No randomness, no adaptive behavior, no hidden state
 * - Result deterministic based on input values only
 * - Fully traceable: can verify result by re-evaluating
 * - Time comparison is value-based (ISO 8601 strings), not system-clock-based
 *
 * INTEGRATION PATTERN:
 * - Candidate provides: CandidateTimeProfile with SLA requirements
 * - RuntimeContext provides: SLATimeState with timing windows
 * - Feasibility evaluator produces: TimeFeasibility outcome
 * - Optimizer Phase 1 uses outcome for feasibility filtering
 * - No interaction between timing feasibility and selection logic
 */
