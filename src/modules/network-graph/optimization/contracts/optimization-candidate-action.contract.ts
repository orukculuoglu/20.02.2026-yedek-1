/**
 * Optimization Candidate Action Contract
 * Defines the structural surface for candidate actions.
 * Candidate actions are proposed moves that optimization runtime will evaluate.
 * Structural-only: no scoring, no feasibility, no selection state.
 */

import type { ActionCategory } from "./optimization-action-category";
import type { RoutingCandidateAction } from "./routing-candidate-action.contract";
import type { StockCandidateAction } from "./stock-candidate-action.contract";
import type { RegionalBalancingCandidateAction } from "./regional-balancing-candidate-action.contract";

/**
 * CandidateActionIdentity
 * Shared identity surface for all candidate actions.
 * Every candidate has a stable identifier and a category discriminant.
 * Concrete candidate action types extend this interface and narrow the category field.
 */
export interface CandidateActionIdentity {
  /** Stable, unique identifier for this candidate action (caller-provided) */
  readonly candidateId: string;

  /** Category that discriminates the type of candidate action (caller-provided) */
  readonly category: ActionCategory;
}

/**
 * OptimizationCandidateAction
 * Discriminated union of all candidate action types.
 * Each concrete type extends CandidateActionIdentity and narrows the category to a literal discriminant.
 * Each candidate action is a proposed move, not a selected or feasible action.
 */
export type OptimizationCandidateAction =
  | RoutingCandidateAction
  | StockCandidateAction
  | RegionalBalancingCandidateAction;

/**
 * Candidate action behavior:
 * - Structural-only proposal of an optimization move
 * - Concrete types compose shared identity (CandidateActionIdentity)
 * - Each candidate has bounded identity (candidateId, narrowed category discriminant)
 * - No score, no feasibility status, no selection state
 * - Runtime will evaluate candidates separately
 * - Candidate action ≠ feasible action ≠ selected action ≠ recommendation output
 * - All values are caller-provided; no runtime generation or inference
 */
