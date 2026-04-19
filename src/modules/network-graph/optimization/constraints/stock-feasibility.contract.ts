/**
 * Stock Feasibility Contract
 *
 * Defines structural support for stock/inventory-aware feasibility evaluation.
 * Stock constraints determine whether a candidate action can proceed
 * given available inventory levels.
 *
 * RESPONSIBILITY:
 * - Define what stock information is needed for feasibility evaluation
 * - Show how candidates relate to stock requirements
 * - Carry feasibility outcome (can/cannot proceed given stock)
 * - No execution, no persistence, no real inventory data integration
 * - Structural only: defines surfaces, not algorithms
 *
 * SCOPE:
 * - Feasibility-stage constraint (pre-selection filtering)
 * - Evaluates: does candidate require items that are unavailable?
 * - Uses: StockState from RuntimeContext
 * - Output: feasible or infeasible (not "recommended" or "optimal")
 * - Deterministic: same candidate + same stock state = same result
 *
 * INTEGRATION:
 * - Consumed by optimization feasibility evaluation (Phase 1)
 * - Uses RuntimeContext.stockState if provided
 * - No modification of StockState
 * - No fallback behavior or hidden inference
 */

/**
 * StockRequirement: What stock/inventory a candidate action needs
 *
 * RESPONSIBILITY:
 * - Identifies which item is needed
 * - States how much stock is required
 * - Caller-provided: no generation, no inference
 * - Used to evaluate against available inventory
 *
 * SCOPE:
 * - Structural only: what is needed
 * - No policy about how to calculate requirements
 * - No default values or hidden assumptions
 * - No optimization of requirements
 */
export interface StockRequirement {
  /**
   * Which inventory item is needed.
   * Caller-provided: identifies the stock item.
   * Links to StockMeasurement.stockItemId in StockState.
   */
  readonly stockItemId: string;

  /**
   * How much stock is required.
   * Caller-provided: numeric quantity needed.
   * Later evaluated against available inventory.
   */
  readonly requiredQuantity: number;
}

/**
 * CandidateStockProfile: Stock/inventory requirements for a specific candidate
 *
 * RESPONSIBILITY:
 * - Lists all stock requirements for a candidate
 * - Attached to candidate for feasibility evaluation
 * - Caller-provided: no generation, no inference
 * - Used during feasibility checking
 */
export interface CandidateStockProfile {
  /**
   * Stock requirements this candidate needs.
   * Empty array if candidate has no stock requirements.
   * Caller-provided: what this candidate specifically needs.
   */
  readonly requirements: ReadonlyArray<StockRequirement>;
}

/**
 * StockFeasibility: Outcome of stock feasibility evaluation
 *
 * RESPONSIBILITY:
 * - Shows whether candidate is feasible from stock perspective
 * - Carries evaluation outcome with deterministic semantics
 * - Carries diagnostic information for tracing
 * - No hidden behavior or assumptions
 * - Deterministic: same input = same result
 *
 * OUTCOME STATES:
 * - "yes": candidate evaluated and has sufficient stock available
 * - "no": candidate evaluated and does not have required stock
 * - "unknown": constraint not evaluated due to missing required runtime state (structural, not caller decision)
 */
export interface StockFeasibility {
  /**
   * Is this candidate feasible from stock perspective?
   * "yes" = evaluated and sufficient stock available
   * "no" = evaluated and insufficient stock
   * "unknown" = not evaluated: required runtime state (stockState) not provided
   * ("unknown" is structural fact, not a fallback or caller-decided outcome)
   */
  readonly outcome: "yes" | "no" | "unknown";

  /**
   * Why is this the outcome?
   * Diagnostic information for tracing/debugging.
   * Examples: "stock available", "insufficient", "no stock state provided"
   * Caller can inspect for debugging; not used in optimization logic.
   */
  readonly reason: string;

  /**
   * Which items were checked (if relevant).
   * List of stockItemId values that were evaluated.
   * Used for tracing; empty if not evaluated.
   */
  readonly checkedItems: ReadonlyArray<string>;

  /**
   * Which items failed (if outcome is "no").
   * List of stockItemId values where stock was insufficient.
   * Used for tracing; empty if outcome is not "no".
   */
  readonly failedItems: ReadonlyArray<string>;
}

/**
 * Stock Feasibility Semantics:
 *
 * OUTCOME MEANINGS:
 * - "yes": Constraint successfully evaluated; candidate has required stock
 * - "no": Constraint successfully evaluated; candidate lacks required stock
 * - "unknown": Constraint not evaluated (structural): required runtime state not provided
 *
 * WHAT THIS ENABLES:
 * - Stock/inventory-aware feasibility evaluation during optimization Phase 1
 * - Deterministic filtering of candidates without required inventory
 * - Explicit, traceable inventory constraint assessment
 * - Structural distinction: evaluated constraint vs unevaluated constraint
 *
 * WHAT THIS IS NOT:
 * - Not stock allocation (execution/operational concern)
 * - Not inventory optimization (selection concern; separate from feasibility)
 * - Not real inventory data source (no integration yet)
 * - Not fallback behavior ("unknown" is structural, not "assume yes")
 * - Not policy enforcement (just mechanism)
 *
 * UNKNOWN SEMANTICS:
 * - "unknown" is NOT a vague or caller-decided outcome
 * - "unknown" is structural: constraint cannot be evaluated without runtime state
 * - When outcome="unknown": stockState was null or candidate had no requirements
 * - How "unknown" is handled at optimization boundary is optimization implementation responsibility (deterministic)
 * - Possible approaches: fail-safe, pass-through, or track separately - but must be deterministic, not vague
 *
 * HOW OPTIMIZATION USES THIS:
 * - Phase 1 (Feasibility): For each candidate, check StockFeasibility.outcome
 * - outcome="yes": candidate passes this dimension
 * - outcome="no": candidate fails this dimension (rejected)
 * - outcome="unknown": handled deterministically by optimization implementation (not caller-decided)
 *
 * DETERMINISM GUARANTEE:
 * - Same candidate + same StockState = same StockFeasibility
 * - No randomness, no adaptive behavior, no hidden state
 * - Result deterministic based on input values only
 * - Fully traceable: can verify result by re-evaluating
 *
 * INTEGRATION PATTERN:
 * - Candidate provides: CandidateStockProfile with requirements
 * - RuntimeContext provides: StockState with measurements
 * - Feasibility evaluator produces: StockFeasibility outcome
 * - Optimizer Phase 1 uses outcome for feasibility filtering
 * - No interaction between stock feasibility and selection logic
 */
