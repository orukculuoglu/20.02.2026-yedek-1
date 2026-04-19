/**
 * SLA/Time State Contract
 *
 * Structural carrier for SLA and timing-related runtime state.
 * Represents time constraints at a point in time.
 * Does not compute or interpret timing; only carries caller-provided values.
 *
 * RESPONSIBILITY:
 * - Carries SLA/timing information for later layer evaluation
 * - Used by constraint or operational layers for timing-aware decisions
 * - Immutable: represents snapshot of timing state
 * - All values caller-provided: no generation, no inference
 *
 * SCOPE:
 * - Structural-only: no real time/event service integration yet
 * - No system clock, no timestamp generation
 * - No SLA computation from external sources
 * - No persistence of timing state
 * - No analytics or reporting
 * - Just a contract for how SLA/timing information is carried
 *
 * KEY CHARACTERISTICS:
 * - SLATimeState is immutable
 * - All values are caller-provided (deterministic)
 * - No generation, no inference, no derived fields
 * - Available for later evaluation by consuming layers
 *
 * NOTE ON TIME REPRESENTATION:
 * - All timestamps are caller-provided (no Date.now())
 * - Represented as ISO 8601 strings for clarity and determinism
 * - Durations as numeric milliseconds for structural clarity
 * - No status/interpretation in this foundation layer
 */

/**
 * SLAWindow: A single SLA/timing constraint definition
 *
 * Represents timing information for constraint consideration.
 * Caller provides: what timing constraint, reference time, deadline, duration.
 * No status or interpretation; just structural timing data.
 */
export interface SLAWindow {
  /**
   * Identifier for this SLA/timing constraint.
   * Caller-provided: identifies which timing constraint.
   */
  readonly slaWindowId: string;

  /**
   * Current reference time (for evaluation purposes).
   * Caller-provided: "now" from caller perspective.
   * ISO 8601 string (deterministic, not Date.now()).
   * Later layers evaluate relative to this reference time.
   */
  readonly referenceTime: string;

  /**
   * Deadline for completion or constraint expiration.
   * Caller-provided: when this timing constraint matters.
   * ISO 8601 string or null if no specific deadline.
   * Later layers compare against referenceTime for evaluation.
   */
  readonly deadline: string | null;

  /**
   * SLA duration allowed (milliseconds).
   * Caller-provided: how long SLA window is open.
   * Numeric: milliseconds.
   * Later layers use for timing evaluation.
   */
  readonly slaDurationMs: number;
}

/**
 * SLATimeState: Complete SLA/timing state surface
 *
 * Minimal carrier for SLA and timing-related runtime state.
 * Composed of individual SLA windows.
 * No computed/derived fields; pure structural carrier.
 *
 * RESPONSIBILITY:
 * - Carries SLA/timing information for later layer use
 * - Later layers may use for timing-aware decisions
 * - No timing logic or status interpretation in this foundation
 * - Immutable: snapshot state only
 */
export interface SLATimeState {
  /**
   * Unique identifier for this SLA/time state snapshot.
   * Caller-provided: identifies this state point.
   */
  readonly slaTimeStateId: string;

  /**
   * Current reference time (for all timing evaluations).
   * Caller-provided: "now" from evaluation perspective.
   * ISO 8601 string (all timing comparisons relative to this).
   */
  readonly referenceTime: string;

  /**
   * SLA/timing constraints relevant for evaluation.
   * Each window represents timing requirements or constraints.
   * Later layers evaluate these against referenceTime and other conditions.
   * No status/interpretation here; just structural data.
   */
  readonly slaWindows: ReadonlyArray<SLAWindow>;
}

/**
 * SLA/Time State Semantics:
 *
 * WHAT THIS IS:
 * - Structural carrier for timing/SLA information
 * - Snapshot of timing constraints at evaluation time
 * - Foundation for later timing-aware decisions
 *
 * WHAT THIS IS NOT:
 * - Not constraint evaluation (that's deferred to later layers)
 * - Not real time/event service (no integration yet)
 * - Not system time generation (Date.now() forbidden)
 * - Not persistence (immutable snapshot only)
 * - Not analytics (no aggregation, no metrics)
 * - Not interpretation (no status fields, no derived evaluation)
 * - Not generated from external sources (all caller-provided)
 *
 * HOW LATER LAYERS USE THIS:
 * - Later constraint or operational layer receives SLATimeState
 * - Evaluates: actions complete within timing window?
 * - Evaluates: deadline satisfied?
 * - Evaluates: SLA requirements met?
 * - Makes decisions based on timing constraints
 * - This layer provides structural data only
 * - Not in scope yet; prepared for later layers
 *
 * TIME REPRESENTATION NOTES:
 * - ISO 8601 strings for deterministic comparison
 * - Milliseconds for duration representation
 * - All times caller-provided (no generation)
 * - Evaluation always relative to referenceTime (caller controls time)
 * - No status/interpretation fields here
 */

