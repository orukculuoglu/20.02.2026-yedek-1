/**
 * Routing Candidate Action Contract
 * Defines a proposed routing move candidate.
 * Structural-only: no execution, no feasibility evaluation.
 * Composes shared candidate identity for clean responsibility separation.
 */

import type { CandidateActionIdentity } from "./optimization-candidate-action.contract";

/**
 * RoutingCandidateAction
 * Represents a proposed routing move as a candidate for optimization evaluation.
 * Composes shared candidate identity and specifies source and destination nodes for the proposed routing change.
 */
export interface RoutingCandidateAction extends CandidateActionIdentity {
  /** Discriminant: marks this as a routing candidate (narrowed from ActionCategory) */
  readonly category: "routing";

  /** Source node identifier for the proposed routing move (caller-provided) */
  readonly sourceNodeId: string;

  /** Destination node identifier for the proposed routing move (caller-provided) */
  readonly destinationNodeId: string;
}

/**
 * Routing candidate action behavior:
 * - Structural-only proposal of a routing move
 * - Extends CandidateActionIdentity for shared identity (candidateId inherited, category narrowed)
 * - Does not execute the routing change
 * - Does not evaluate feasibility or impact
 * - Does not carry score or recommendation state
 * - Runtime will evaluate this candidate separately
 * - All values are caller-provided; no generation, inference, or evaluation
 */

