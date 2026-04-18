/**
 * Optimization Action Category Contract
 * Bounded vocabulary of candidate action types.
 * Structural-only: defines what kinds of candidate actions exist.
 * No execution semantics, no runtime behavior.
 */

/**
 * ActionCategory
 * Explicit, bounded categories for candidate actions.
 * Each category represents a different type of optimization move.
 */
export type ActionCategory =
  | "routing"                // Proposed routing move
  | "stock"                  // Proposed stock action
  | "regional_balancing";    // Proposed regional balancing move

/**
 * Action category behavior:
 * - Bounded vocabulary of candidate action types
 * - Used as discriminant in candidate action union
 * - Each category has responsibility-specific fields
 * - No implicit behavior or hidden semantics
 * - All values are caller-provided; no runtime generation
 */
