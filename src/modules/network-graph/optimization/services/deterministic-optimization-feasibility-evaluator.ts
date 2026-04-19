/**
 * Deterministic Optimization Feasibility Evaluator
 * Protocol-clean runtime implementation of feasibility evaluation.
 * Transforms candidate actions into feasible and rejected references based on constraints.
 * Deterministic: same input always produces same output.
 * No class, no factory, no generated IDs, no any-casts, no mutation.
 * Evaluates only constraints that are structurally determinable from candidates alone.
 * 
 * DETERMINISM & FORBIDDEN ZONE CLOSURE (Phase 5):
 * - Evaluator is fully deterministic: identical candidate + constraint inputs produce identical outputs
 * - All evaluation paths are structural: no ML inference, no adaptive rules, no hidden heuristics
 * - All constraint evaluation is explicit: only ForbiddenActionConstraint and RegionalRestrictionConstraint evaluated
 * - No hidden constraint application: deferred constraints are never evaluated in feasibility phase
 * - No ID generation: all outputs reuse sourceCandidateActionId (no feasibleActionId generation)
 * - No randomness: no probabilistic constraint evaluation
 * - No time-based behavior: no temporal constraints or time-dependent evaluation
 * - EXPLICITLY FORBIDDEN:
 *   - Math.random(): breaks determinism
 *   - Date.now(): breaks reproducibility
 *   - ID generation: all IDs reused from sources
 *   - Generated timestamps: none
 *   - ML-based feasibility: no learned feasibility models
 *   - Hidden weights: no implicit constraint prioritization
 *   - Deferred constraint evaluation: never evaluate capacity/stock/sla/required/control
 *   - Adaptive evaluation: no feedback loops, no heuristic adjustment
 *   - Probabilistic constraint checking: no probabilistic feasibility
 *   - Auto-rejection with side effects: no implicit state mutation
 * - Result is honest: only feasibility-relevant constraints evaluated
 */


import type { OptimizationInput } from "../contracts/optimization-input.contract";
import type { OptimizationCandidateAction } from "../contracts/optimization-candidate-action.contract";
import type { RegionalBalancingCandidateAction } from "../contracts/regional-balancing-candidate-action.contract";
import type { OptimizationConstraintSet } from "../contracts/optimization-constraint.contract";
import type {
  FeasibleCandidateReference,
  RejectedCandidateReference,
  FeasibilityEvaluationResult,
  OptimizationFeasibilityEvaluator,
} from "../contracts/optimization-feasibility-evaluator.contract";

/**
 * Type guard: check if candidate is a regional balancing candidate.
 * Safely narrows union type for region-aware feasibility checks.
 */
const isRegionalBalancingCandidate = (
  candidate: OptimizationCandidateAction,
): candidate is RegionalBalancingCandidateAction => {
  return candidate.category === "regional_balancing";
};

/**
 * Evaluate whether a candidate action satisfies feasibility constraints.
 * Evaluates only constraints that are structurally determinable from the candidate alone.
 * Other constraints (capacity, stock, sla_time, deterministic_control, required_action)
 * require execution/selection context and are intentionally deferred to later phases.
 * @param candidate - Candidate action to evaluate
 * @param constraints - Feasibility boundaries to check against
 * @returns true if candidate satisfies all structurally evaluable constraints, false otherwise
 */
const evaluateCandidateFeasibility = (
  candidate: OptimizationCandidateAction,
  constraints: OptimizationConstraintSet,
): boolean => {
  // If no constraints defined, all candidates are feasible
  if (constraints.constraints.length === 0) {
    return true;
  }

  // Evaluate candidate against each constraint
  // Only structurally meaningful constraints are evaluated
  for (const constraint of constraints.constraints) {
    // ForbiddenActionConstraint: reject if candidate is explicitly forbidden
    if (constraint.kind === "forbidden_action") {
      // Type-safe: discriminated union narrowing by constraint.kind
      if (candidate.candidateId === constraint.forbiddenId) {
        return false;
      }
    }

    // RegionalRestrictionConstraint: check region membership for regional candidates
    if (constraint.kind === "regional_restriction") {
      // Type-safe: discriminated union narrowing by constraint.kind
      // Only evaluate for regional_balancing candidates (they have region information)
      if (isRegionalBalancingCandidate(candidate)) {
        // Reject if destination region is not in allowed regions
        if (!constraint.allowedRegions.includes(candidate.destinationRegionId)) {
          return false;
        }
      }
      // Routing candidates: no evaluable region field
      // Stock candidates: not subject to regional restrictions
    }

    // Other constraint types are intentionally not evaluated in feasibility phase:
    // - CapacityConstraint: requires current capacity state (execution context)
    // - StockConstraint: requires current stock state (execution context)
    // - SLATimeConstraint: requires timing state (execution context)
    // - RequiredActionConstraint: determines selection requirement, not feasibility
    // - DeterministicControlConstraint: ordering preference, not feasibility
    // These are deferred to selection and execution phases
  }

  // All structurally evaluable constraints satisfied
  return true;
};

/**
 * Create a reference to a feasible candidate.
 * Caller will later provide the feasibleActionId.
 * @param candidate - Candidate that passed feasibility check
 * @returns Reference to feasible candidate
 */
const createFeasibleCandidateReference = (
  candidate: OptimizationCandidateAction,
): FeasibleCandidateReference => {
  // All candidates extend CandidateActionIdentity with candidateId and category
  // Direct property access - no cast needed
  return {
    sourceCandidateActionId: candidate.candidateId,
    category: candidate.category,
  };
};

/**
 * Create a reference to a rejected candidate.
 * Caller will later provide the rejectedActionId.
 * @param candidate - Candidate that failed feasibility check
 * @returns Reference to rejected candidate with rejection reason
 */
const createRejectedCandidateReference = (
  candidate: OptimizationCandidateAction,
): RejectedCandidateReference => {
  // All candidates extend CandidateActionIdentity with candidateId and category
  // Direct property access - no cast needed
  return {
    sourceCandidateActionId: candidate.candidateId,
    category: candidate.category,
    rejectionKind: "feasibility_violated",
  };
};

/**
 * Deterministic optimization feasibility evaluator.
 * Minimal constant satisfying OptimizationFeasibilityEvaluator interface.
 * No class, no factory, no generated IDs, no mutation.
 */
export const deterministicOptimizationFeasibilityEvaluator: OptimizationFeasibilityEvaluator = {
  evaluate: (input: OptimizationInput): FeasibilityEvaluationResult => {
    const feasibleCandidates: FeasibleCandidateReference[] = [];
    const rejectedCandidates: RejectedCandidateReference[] = [];

    // Evaluate each candidate action deterministically
    for (const candidate of input.candidateActions) {
      if (evaluateCandidateFeasibility(candidate, input.constraints)) {
        feasibleCandidates.push(createFeasibleCandidateReference(candidate));
      } else {
        rejectedCandidates.push(createRejectedCandidateReference(candidate));
      }
    }

    // Explicit typing ensures result is properly typed without unnecessary casts
    const result: FeasibilityEvaluationResult = {
      feasibleCandidates: Object.freeze(feasibleCandidates),
      rejectedCandidates: Object.freeze(rejectedCandidates),
    };

    return result;
  },
};

