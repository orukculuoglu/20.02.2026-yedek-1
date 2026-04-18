/**
 * Optimization Result Contract
 * Defines the structural output of an optimization process.
 * Structural-only: no runtime optimization, no scoring, no decision logic.
 * Carries selected actions and rejected candidates explicitly.
 */

import type { SelectedAction } from "./selected-action.contract";
import type { RejectedCandidateAction } from "./rejected-candidate-action.contract";

/**
 * OptimizationResult
 * Represents the structural output of an optimization execution.
 * Deterministically carries selected actions and rejected candidates.
 * Does not perform optimization, scoring, or selection - purely structural.
 */
export interface OptimizationResult {
  /** Unique identifier for this optimization result (caller-provided) */
  readonly resultId: string;

  /** Selected actions chosen by optimization process (caller-provided collection) */
  readonly selectedActions: readonly SelectedAction[];

  /** Rejected candidate actions not carried forward (caller-provided collection) */
  readonly rejectedCandidates: readonly RejectedCandidateAction[];
}

/**
 * Optimization result behavior:
 * - Structural-only carrier of optimization output
 * - Selected actions are explicit, not implied
 * - Rejected candidates are explicit, not implied
 * - No score, recommendation, or execution state
 * - No runtime optimization engine embedded
 * - All values are caller-provided; no generation or inference
 * - Pure structural output surface
 */
