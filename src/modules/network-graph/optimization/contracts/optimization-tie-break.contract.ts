/**
 * Optimization Tie-Break Contract
 * Defines explicit ordering and precedence when multiple equally good solutions exist.
 * Caller-provided deterministic control without hidden weighting logic.
 * No scoring, no inference, no probabilistic behavior.
 */

/**
 * TieBreakStrategy
 * Named tie-break approaches.
 * Each strategy is explicit in its behavior and free of hidden logic.
 */
export type TieBreakStrategy =
  | "explicit_order"           // Use caller-provided explicit ordering
  | "fifo"                      // First in, first out (by arrival order)
  | "cost_ascending"            // Lower cost preferred in tie
  | "cost_descending"           // Higher cost preferred in tie
  | "time_ascending"            // Lower time preferred in tie
  | "time_descending"           // Higher time preferred in tie
  | "capacity_lowest_first"     // Use least capacity first
  | "capacity_highest_first"    // Use most capacity first
  | "availability_highest_first"; // Higher availability preferred

/**
 * ExplicitOrderTieBreak
 * Tie-break using caller-provided explicit ordering of entities.
 * No hidden logic: precedence is exactly as provided.
 */
export interface ExplicitOrderTieBreak {
  readonly strategy: "explicit_order";

  /** Ordered list of entity/action IDs: earlier in list is preferred in tie (caller-provided) */
  readonly order: readonly string[];
}

/**
 * StandardTieBreak
 * Tie-break using standard named strategies.
 * Each strategy has well-defined, non-hidden semantics.
 */
export interface StandardTieBreak {
  readonly strategy: Exclude<TieBreakStrategy, "explicit_order">;

  /** Optional secondary tie-break if primary tie-break still results in tie (caller-provided) */
  readonly secondary?: OptimizationTieBreak;
}

/**
 * OptimizationTieBreak
 * Union of all tie-break approaches.
 * Caller provides explicit ordering without hidden weighting.
 */
export type OptimizationTieBreak = ExplicitOrderTieBreak | StandardTieBreak;

/**
 * Tie-break behavior:
 * - Deterministic, explicit ordering defined by caller
 * - No hidden weights or probabilistic logic
 * - No ML inference or dynamic learning
 * - Used when multiple solutions are equally good relative to objective
 * - All values are caller-provided; no runtime adjustment
 * - Can be nested for multi-level tie-breaking
 */
