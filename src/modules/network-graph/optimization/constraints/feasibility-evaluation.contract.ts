/**
 * Feasibility Evaluation Contract
 *
 * Defines the comprehensive feasibility evaluation surfaces for runtime-aware optimization.
 * Brings together all constraint feasibility checks into a unified evaluation framework.
 *
 * RESPONSIBILITY:
 * - Document all feasibility dimensions checked during optimization
 * - Show how candidates and runtime context together determine feasibility
 * - Carry complete feasibility outcome (pass/fail/unknown on each dimension)
 * - No execution, no policy, no hidden behavior
 * - Structural only: defines surfaces, not algorithms
 *
 * SCOPE:
 * - Feasibility-stage constraints only (pre-selection filtering)
 * - Documents what is checked and why
 * - Enables deterministic feasibility assessment
 * - Aggregate of individual constraint evaluations
 *
 * ARCHITECTURE:
 * - Feasibility evaluation operates in Phase 1 of optimization
 * - Separate from selection logic (Phase 2)
 * - All feasibility outcomes must be "yes" for candidate to proceed to selection
 * - Individual constraint outcomes are included for traceability
 */

import type { CapacityFeasibility } from "./capacity-feasibility.contract";
import type { StockFeasibility } from "./stock-feasibility.contract";
import type { TimeFeasibility } from "./time-feasibility.contract";
import type { AvailabilityFeasibility } from "./availability-feasibility.contract";

/**
 * CandidateFeasibilityEvaluation: Complete feasibility assessment for a candidate
 *
 * RESPONSIBILITY:
 * - Composite of all feasibility checks applied to a single candidate
 * - Shows whether candidate passes all feasibility constraints
 * - Carries individual constraint outcomes for diagnostic purposes
 * - Deterministic: same candidate + same runtime context = same evaluation
 *
 * COMPOSITION:
 * Each feasibility dimension can be checked independently:
 * - Capacity: does candidate fit within resource capacity?
 * - Stock: does candidate have required inventory?
 * - Time: can candidate complete within SLA windows?
 * - Availability: are required resources available and ready?
 *
 * Each dimension outcome is "yes"/"no"/"unknown"
 * Final feasibility is "yes" only if all required dimensions are "yes"
 */
export interface CandidateFeasibilityEvaluation {
  /**
   * Which candidate was evaluated.
   * Caller-provided: identifies the candidate being checked.
   * Used for tracing results back to source.
   */
  readonly candidateId: string;

  /**
   * Capacity feasibility outcome.
   * Included if capacity constraint was evaluated for this candidate.
   * Null if capacity not evaluated (no requirements, no capacity state, etc.).
   */
  readonly capacityFeasibility: CapacityFeasibility | null;

  /**
   * Stock feasibility outcome.
   * Included if stock constraint was evaluated for this candidate.
   * Null if stock not evaluated (no requirements, no stock state, etc.).
   */
  readonly stockFeasibility: StockFeasibility | null;

  /**
   * Time/SLA feasibility outcome.
   * Included if timing constraint was evaluated for this candidate.
   * Null if timing not evaluated (no requirements, no SLA state, etc.).
   */
  readonly timeFeasibility: TimeFeasibility | null;

  /**
   * Availability feasibility outcome.
   * Included if availability constraint was evaluated for this candidate.
   * Null if availability not evaluated (no requirements, no availability state, etc.).
   */
  readonly availabilityFeasibility: AvailabilityFeasibility | null;

  /**
   * Is this candidate feasible overall?
   * "yes" = passes all evaluated constraints
   * "no" = fails at least one constraint
   * "unknown" = unable to fully determine (some dimensions unknown)
   * No "maybe" or "partial" - explicit yes/no/unknown only.
   */
  readonly overallFeasible: "yes" | "no" | "unknown";

  /**
   * Why is the overall feasibility this outcome?
   * Diagnostic summary for tracing/debugging.
   * Examples: "all constraints pass", "stock constraint failed", "partial evaluation"
   * Caller can inspect for debugging; not used in optimization logic.
   */
  readonly overallReason: string;
}

/**
 * CompleteConstraintProfile: All constraint information for a candidate
 *
 * RESPONSIBILITY:
 * - Composed of all constraint profile types
 * - Attached to candidate for comprehensive feasibility evaluation
 * - Caller-provided: no generation, no inference
 * - All profiles are optional; inclusion indicates constraint is relevant
 *
 * PATTERN:
 * Candidate includes CompleteConstraintProfile
 * Optimization feasibility phase evaluates all included profiles
 * Each dimension evaluated produces a feasibility outcome
 * Outcomes combined into CandidateFeasibilityEvaluation
 */
export interface CompleteConstraintProfile {
  /**
   * Capacity requirements (if relevant for this candidate).
   * Null if candidate has no capacity constraints.
   */
  readonly capacity: {
    readonly requirements: ReadonlyArray<{ readonly capacityResourceId: string; readonly requiredCapacity: number }>;
  } | null;

  /**
   * Stock requirements (if relevant for this candidate).
   * Null if candidate has no stock constraints.
   */
  readonly stock: {
    readonly requirements: ReadonlyArray<{ readonly stockItemId: string; readonly requiredQuantity: number }>;
  } | null;

  /**
   * Time/SLA requirements (if relevant for this candidate).
   * Null if candidate has no timing constraints.
   */
  readonly time: {
    readonly requirements: ReadonlyArray<{ readonly slaWindowId: string; readonly estimatedCompletionTimeMs: number }>;
  } | null;

  /**
   * Availability requirements (if relevant for this candidate).
   * Null if candidate has no availability constraints.
   */
  readonly availability: {
    readonly requirements: ReadonlyArray<{
      readonly resourceId: string;
      readonly acceptableStatuses: ReadonlyArray<"available" | "unavailable" | "degraded" | "unknown" | "*any*">;
    }>;
    readonly requiresSystemReady: boolean;
  } | null;
}

/**
 * Feasibility Evaluation Semantics:
 *
 * WHAT THIS ENABLES:
 * - Comprehensive runtime-aware feasibility evaluation
 * - Multi-dimensional constraint checking in single evaluation
 * - Deterministic candidate feasibility assessment
 * - Explicit, traceable constraint handling with full diagnostics
 *
 * WHAT THIS IS NOT:
 * - Not constraint execution (that's operational concern)
 * - Not constraint optimization (that's selection concern)
 * - Not policy enforcement (just mechanism, policy by caller)
 * - Not hidden fallback behavior (explicit "unknown" when unable to evaluate)
 * - Not integration framework (just contracts for interfaces)
 *
 * EVALUATION FLOW:
 * 1. Candidate includes CompleteConstraintProfile
 * 2. RuntimeContext includes relevant state surfaces (capacity, stock, time, availability)
 * 3. Feasibility evaluator checks each dimension:
 *    - If candidate has requirement AND runtime state provided → evaluate
 *    - If candidate has requirement BUT NO runtime state → "unknown"
 *    - If candidate has no requirement → null (not evaluated)
 * 4. Combine all dimension outcomes → overallFeasible
 * 5. No hidden logic; all steps explicit
 *
 * OPTIMIZATION INTEGRATION:
 * - Feasibility Phase (Phase 1): for each candidate, produce CandidateFeasibilityEvaluation
 * - Selection Phase (Phase 2): only candidates with overallFeasible="yes" enter selection
 * - Candidates with overallFeasible="no" are rejected
 * - Candidates with overallFeasible="unknown" are handled deterministically by optimization implementation
 *
 * DETERMINISM GUARANTEE:
 * - Same candidate profile + same RuntimeContext = same evaluation
 * - No randomness, no adaptive behavior, no hidden state
 * - Result deterministic based on input values only
 * - Fully traceable: can verify result by re-evaluating
 * - All diagnostic reasons include enough detail for debugging
 *
 * CONSTRAINT STAGES:
 * ALL constraints are feasibility-stage (not selection-stage):
 * - Capacity: feasibility check, not optimization criterion
 * - Stock: feasibility check, not optimization criterion
 * - Time: feasibility check, not optimization criterion
 * - Availability: feasibility check, not optimization criterion
 * Selection criteria (objective + tieBreak) are independent of constraints.
 * Constraints filter candidates; selection ranks feasible candidates.
 *
 * NO FAKE SUPPORT:
 * - A constraint is either fully supported or not included at all
 * - No partial evaluation, no guessing, no hidden defaults
 * - If constraint cannot be evaluated → explicitly "unknown" (structural, not fallback)
 * - "unknown" means: required runtime state not provided (deterministic)
 * - How optimization handles "unknown" at boundary is implementation responsibility (deterministic, not vague)
 * - No fallback to "assume yes" or "assume no" without explicit implementation
 */
