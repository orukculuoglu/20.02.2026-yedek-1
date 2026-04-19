/**
 * Capacity State Contract
 *
 * Structural carrier for capacity-related runtime state.
 * Represents measured capacity conditions at a point in time.
 * Does not measure or compute capacity; only carries caller-provided values.
 *
 * RESPONSIBILITY:
 * - Carries capacity measurement for constraint evaluation
 * - Used by deferred capacity constraint areas for later evaluation
 * - Immutable: represents snapshot of capacity state
 * - All values caller-provided: no generation, no inference
 *
 * SCOPE:
 * - Structural-only: no real capacity data integration yet
 * - No database/API integration for capacity measurement
 * - No persistence of capacity state
 * - No analytics or reporting
 * - Just a contract for how capacity state is carried
 *
 * KEY CHARACTERISTICS:
 * - CapacityState is immutable
 * - All measurements are caller-provided (deterministic)
 * - No generation, no inference, no defaults
 * - Available for later constraint evaluation
 */

/**
 * CapacityMeasurement: A single capacity measurement
 *
 * Represents one point of capacity measurement.
 * Caller provides: what's being measured, available/used/limit values.
 */
export interface CapacityMeasurement {
  /**
   * Identifier for this capacity resource being measured.
   * Caller-provided: identifies which capacity dimension this measures.
   */
  readonly capacityResourceId: string;

  /**
   * Available capacity (unallocated/free amount).
   * Caller-provided: current available amount.
   * Numeric: non-negative value representing available capacity.
   */
  readonly available: number;

  /**
   * Used/allocated capacity.
   * Caller-provided: current used amount.
   * Numeric: non-negative value representing used capacity.
   */
  readonly used: number;

  /**
   * Maximum capacity limit.
   * Caller-provided: capacity ceiling.
   * Numeric: non-negative value representing capacity limit.
   */
  readonly limit: number;
}

/**
 * CapacityState: Complete capacity state surface
 *
 * Minimal carrier for capacity-related runtime state.
 * Composed of individual capacity measurements.
 *
 * RESPONSIBILITY:
 * - Carries capacity measurements for later layer use
 * - Later layers may use for capacity-related decisions
 * - No constraint logic in this foundation
 * - Immutable: snapshot state only
 */
export interface CapacityState {
  /**
   * Unique identifier for this capacity state snapshot.
   * Caller-provided: identifies this state point.
   */
  readonly capacityStateId: string;

  /**
   * Capacity measurements for various resources.
   * Each measurement is a single capacity dimension.
   * Later constraint evaluation will analyze these.
   */
  readonly measurements: ReadonlyArray<CapacityMeasurement>;
}

/**
 * Capacity State Semantics:
 *
 * WHAT THIS IS:
 * - Structural carrier for capacity measurements
 * - Snapshot of capacity conditions at evaluation time
 * - Foundation for later layer decisions
 *
 * WHAT THIS IS NOT:
 * - Not constraint evaluation (that's deferred)
 * - Not real capacity data source (no integration yet)
 * - Not persistence (immutable snapshot only)
 * - Not analytics (no aggregation, no metrics)
 * - Not generated from external sources (all caller-provided)
 *
 * HOW LATER LAYERS MAY USE THIS:
 * - Later layers receive CapacityState
 * - May evaluate: does binding fit within capacity?
 * - May determine: which actions fit capacity constraints
 * - May produce: capacity-related outcomes or decisions
 * - Foundation ready; layer-specific logic deferred
 */
