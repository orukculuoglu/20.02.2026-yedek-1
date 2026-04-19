/**
 * Optimization Input Contract
 * Defines the explicit input surface to optimization.
 * Structural-only composition of all optimization input requirements.
 * No runtime generation, no inference, no mutation.
 *
 * RUNTIME-AWARE EXPANSION (Phase: Advanced Constraint / Selection Expansion):
 * OptimizationInput now optionally includes RuntimeContext for runtime-aware feasibility evaluation.
 * This enables previously deferred constraint areas: capacity, stock, time, availability.
 * All constraints remain feasibility-stage (pre-selection filtering).
 * Selection logic remains caller responsibility (not implicit in constraints).
 */

import type { OptimizationObjective } from "./optimization-objective.contract";
import type { OptimizationConstraintSet } from "./optimization-constraint.contract";
import type { OptimizationTieBreak } from "./optimization-tie-break.contract";
import type { OptimizationCandidateAction } from "./optimization-candidate-action.contract";
import type { RuntimeContext } from "../../runtime-state";

/**
 * OptimizationInput
 * Explicit composition of all structural inputs required for optimization.
 * This is the authoritative input surface to any optimization process.
 * All inputs are caller-provided and immutable.
 *
 * RUNTIME CONTEXT INTEGRATION:
 * - runtimeContext is optional; optimization works without it
 * - When provided: enables runtime-aware feasibility evaluation
 * - Contains capacity, stock, SLA/time, and availability state surfaces
 * - Used for feasibility filtering in Phase 1 of optimization
 * - Does NOT influence selection logic (Phase 2)
 */
export interface OptimizationInput {
  /** What to optimize towards (caller-provided) */
  readonly objective: OptimizationObjective;

  /** Feasibility boundaries to respect (caller-provided) */
  readonly constraints: OptimizationConstraintSet;

  /** Deterministic ordering rules for equivalent solutions (caller-provided) */
  readonly tieBreak: OptimizationTieBreak;

  /** Candidate actions proposed for evaluation (caller-provided collection) */
  readonly candidateActions: readonly OptimizationCandidateAction[];

  /**
   * Runtime conditions for feasibility evaluation (optional, caller-provided).
   * When provided: enables runtime-aware constraint checking
   * - Capacity state for capacity feasibility evaluation
   * - Stock state for inventory feasibility evaluation
   * - SLA/time state for timing feasibility evaluation
   * - Availability state for resource readiness evaluation
   *
   * When not provided (null): feasibility evaluation uses only base constraints
   * - Runtime-aware constraints cannot be evaluated (produce "unknown" outcomes)
   * - Base constraints (forbidden/regional) still applied
   * - Selection proceeds without runtime context
   *
   * All candidate constraint profiles are matched against provided runtime state.
   * If candidate has requirements but runtime state not provided → feasibility "unknown"
   */
  readonly runtimeContext: RuntimeContext | null;
}

/**
 * Optimization input behavior:
 * - Explicit composition of all input surfaces
 * - All values are caller-provided; no generation or inference
 * - Immutable structure with readonly fields
 * - No mutation during optimization process
 * - Serves as explicit input boundary
 *
 * RUNTIME-AWARE BEHAVIOR:
 * - If runtimeContext is null: no runtime-aware feasibility evaluation
 * - If runtimeContext provided: feasibility evaluation uses relevant state surfaces
 * - Candidate must include constraint profiles (capacity, stock, time, availability) if runtime-aware checking desired
 * - Each constraint independently evaluated; failure on any constraint = infeasible
 * - No hidden defaults: constraints not in profile = constraint not evaluated
 */
