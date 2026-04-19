/**
 * Stock State Contract
 *
 * Structural carrier for stock/inventory-related runtime state.
 * Represents measured inventory conditions at a point in time.
 * Does not measure or compute stock; only carries caller-provided values.
 *
 * RESPONSIBILITY:
 * - Carries stock/inventory measurement for constraint evaluation
 * - Used by deferred stock constraint areas for later evaluation
 * - Immutable: represents snapshot of stock state
 * - All values caller-provided: no generation, no inference
 *
 * SCOPE:
 * - Structural-only: no real stock data integration yet
 * - No database/API integration for stock measurement
 * - No persistence of stock state
 * - No analytics or reporting
 * - Just a contract for how stock state is carried
 *
 * KEY CHARACTERISTICS:
 * - StockState is immutable
 * - All measurements are caller-provided (deterministic)
 * - No generation, no inference, no defaults
 * - Available for later constraint evaluation
 */

/**
 * StockMeasurement: A single inventory/stock measurement
 *
 * Represents inventory levels for one item or dimension.
 * Caller provides: what's being measured, on-hand/reserved/available values.
 */
export interface StockMeasurement {
  /**
   * Identifier for this stock item being measured.
   * Caller-provided: identifies which item/part/dimension.
   */
  readonly stockItemId: string;

  /**
   * On-hand quantity (physically available).
   * Caller-provided: current on-hand amount.
   * Numeric: non-negative integer representing inventory.
   */
  readonly onHand: number;

  /**
   * Reserved quantity (allocated but not yet consumed).
   * Caller-provided: currently reserved amount.
   * Numeric: non-negative integer.
   */
  readonly reserved: number;

  /**
   * Available quantity for new allocation (on-hand minus reserved).
   * Caller-provided: currently available for allocation.
   * Numeric: non-negative integer (typically onHand - reserved).
   */
  readonly available: number;

  /**
   * Minimum stock level (reorder point).
   * Caller-provided: minimum before reordering.
   * Numeric: non-negative integer.
   */
  readonly minimum: number;
}

/**
 * StockState: Complete stock/inventory state surface
 *
 * Minimal carrier for stock-related runtime state.
 * Composed of individual stock measurements.
 *
 * RESPONSIBILITY:
 * - Carries stock measurements for later layer use
 * - Later layers may use for stock-related decisions
 * - No constraint logic in this foundation
 * - Immutable: snapshot state only
 */
export interface StockState {
  /**
   * Unique identifier for this stock state snapshot.
   * Caller-provided: identifies this state point.
   */
  readonly stockStateId: string;

  /**
   * Stock measurements for various items.
   * Each measurement is a single inventory item or dimension.
   * Later constraint evaluation will analyze these.
   */
  readonly measurements: ReadonlyArray<StockMeasurement>;
}

/**
 * Stock State Semantics:
 *
 * WHAT THIS IS:
 * - Structural carrier for stock/inventory measurements
 * - Snapshot of inventory conditions at evaluation time
 * - Foundation for later layer decisions
 *
 * WHAT THIS IS NOT:
 * - Not constraint evaluation (that's deferred)
 * - Not real stock data source (no integration yet)
 * - Not persistence (immutable snapshot only)
 * - Not analytics (no aggregation, no metrics)
 * - Not generated from external sources (all caller-provided)
 *
 * HOW LATER LAYERS MAY USE THIS:
 * - Later layers receive StockState
 * - May evaluate: enough stock for binding?
 * - May determine: which actions can proceed given stock levels
 * - May produce: stock-related outcomes or decisions
 * - Foundation ready; layer-specific logic deferred
 */
