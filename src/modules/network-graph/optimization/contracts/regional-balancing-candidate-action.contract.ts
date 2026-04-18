/**
 * Regional Balancing Candidate Action Contract
 * Defines a proposed regional balancing move candidate.
 * Structural-only: no execution, no feasibility evaluation.
 * Composes shared candidate identity for clean responsibility separation.
 */

import type { CandidateActionIdentity } from "./optimization-candidate-action.contract";

/**
 * RegionalBalancingCandidateAction
 * Represents a proposed regional balancing move as a candidate for optimization evaluation.
 * Composes shared candidate identity and specifies source region, destination region, and resource quantity for the proposed move.
 */
export interface RegionalBalancingCandidateAction extends CandidateActionIdentity {
  /** Discriminant: marks this as a regional balancing candidate (narrowed from ActionCategory) */
  readonly category: "regional_balancing";

  /** Source region identifier (caller-provided) */
  readonly sourceRegionId: string;

  /** Destination region identifier (caller-provided) */
  readonly destinationRegionId: string;

  /** Quantity of resource to move in the proposed balancing move (caller-provided) */
  readonly resourceQuantity: number;
}

/**
 * Regional balancing candidate action behavior:
 * - Structural-only proposal of a regional balancing move
 * - Extends CandidateActionIdentity for shared identity (candidateId inherited, category narrowed)
 * - Does not execute the balancing change
 * - Does not evaluate feasibility or impact
 * - Does not carry score or recommendation state
 * - Runtime will evaluate this candidate separately
 * - All values are caller-provided; no generation, inference, or evaluation
 */

