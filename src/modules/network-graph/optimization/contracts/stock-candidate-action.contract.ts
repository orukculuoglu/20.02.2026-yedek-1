/**
 * Stock Candidate Action Contract
 * Defines a proposed stock action candidate.
 * Structural-only: no execution, no feasibility evaluation.
 * Composes shared candidate identity for clean responsibility separation.
 */

import type { CandidateActionIdentity } from "./optimization-candidate-action.contract";

/**
 * StockActionType
 * Explicit bounded vocabulary for stock action types.
 */
export type StockActionType =
  | "increase"  // Increase available stock
  | "decrease"  // Decrease available stock
  | "maintain"; // Maintain current stock level

/**
 * StockCandidateAction
 * Represents a proposed stock action as a candidate for optimization evaluation.
 * Composes shared candidate identity and specifies an item, action type, and quantity for the proposed change.
 */
export interface StockCandidateAction extends CandidateActionIdentity {
  /** Discriminant: marks this as a stock candidate (narrowed from ActionCategory) */
  readonly category: "stock";

  /** Stock item identifier (caller-provided) */
  readonly itemId: string;

  /** Type of stock action proposed (caller-provided) */
  readonly actionType: StockActionType;

  /** Quantity involved in the proposed action (caller-provided) */
  readonly quantity: number;
}

/**
 * Stock candidate action behavior:
 * - Structural-only proposal of a stock action
 * - Extends CandidateActionIdentity for shared identity (candidateId inherited, category narrowed)
 * - Does not execute the stock change
 * - Does not evaluate feasibility or impact
 * - Does not carry score or recommendation state
 * - Runtime will evaluate this candidate separately
 * - All values are caller-provided; no generation, inference, or evaluation
 */

