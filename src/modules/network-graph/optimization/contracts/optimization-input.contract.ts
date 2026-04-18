/**
 * Optimization Input Contract
 * Defines the explicit input surface to optimization.
 * Structural-only composition of all optimization input requirements.
 * No runtime generation, no inference, no mutation.
 */

import type { OptimizationObjective } from "./optimization-objective.contract";
import type { OptimizationConstraintSet } from "./optimization-constraint.contract";
import type { OptimizationTieBreak } from "./optimization-tie-break.contract";
import type { OptimizationCandidateAction } from "./optimization-candidate-action.contract";

/**
 * OptimizationInput
 * Explicit composition of all structural inputs required for optimization.
 * This is the authoritative input surface to any optimization process.
 * All inputs are caller-provided and immutable.
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
}

/**
 * Optimization input behavior:
 * - Explicit composition of all input surfaces
 * - All values are caller-provided; no generation or inference
 * - Immutable structure with readonly fields
 * - No mutation during optimization process
 * - Serves as explicit input boundary
 */
