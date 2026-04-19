/**
 * Availability/Operational Readiness State Contract
 *
 * Structural carrier for operational readiness and availability-related state.
 * Represents readiness conditions at a point in time.
 * Does not evaluate readiness; only carries caller-provided values.
 *
 * RESPONSIBILITY:
 * - Carries operational readiness/availability information for constraint evaluation
 * - Used by deferred availability/readiness constraint areas for later evaluation
 * - Immutable: represents snapshot of operational state
 * - All values caller-provided: no generation, no inference
 *
 * SCOPE:
 * - Structural-only: no real system integration yet
 * - No service/resource monitoring integration
 * - No live health/status checking
 * - No persistence of availability state
 * - No analytics or reporting
 * - Just a contract for how availability is carried
 *
 * KEY CHARACTERISTICS:
 * - AvailabilityState is immutable
 * - All measurements are caller-provided (deterministic)
 * - No generation, no inference, no defaults
 * - Available for later constraint evaluation
 */

/**
 * ResourceAvailability: A single resource availability measurement
 *
 * Represents operational status of a resource or service.
 * Caller provides: what's being measured, availability status, readiness level.
 */
export interface ResourceAvailability {
  /**
   * Identifier for the resource being measured.
   * Caller-provided: identifies which resource/service.
   */
  readonly resourceId: string;

  /**
   * Operational status indicator.
   * Caller-provided: whether resource is operational.
   * Bounded: "available" | "unavailable" | "degraded" | "unknown"
   */
  readonly status: "available" | "unavailable" | "degraded" | "unknown";

  /**
   * Readiness indicator (is resource ready for use).
   * Caller-provided: whether resource is ready.
   * Boolean: true if ready, false if not.
   */
  readonly isReady: boolean;

  /**
   * Optional reason for unavailability or degradation.
   * Caller-provided: explanation of status if needed.
   * String or null.
   */
  readonly statusReason: string | null;
}

/**
 * AvailabilityState: Complete operational readiness state surface
 *
 * Minimal carrier for operational readiness and availability state.
 * Composed of individual resource availability measurements.
 *
 * RESPONSIBILITY:
 * - Carries availability measurements for later layer use
 * - Later layers may use for availability-related decisions
 * - No constraint logic in this foundation
 * - Immutable: snapshot state only
 */
export interface AvailabilityState {
  /**
   * Unique identifier for this availability state snapshot.
   * Caller-provided: identifies this state point.
   */
  readonly availabilityStateId: string;

  /**
   * Resource/service availability measurements.
   * Each measurement represents one resource's operational status.
   * Later constraint evaluation will analyze these.
   */
  readonly resources: ReadonlyArray<ResourceAvailability>;

  /**
   * Overall system readiness indicator.
   * Caller-provided: whether system as a whole is ready.
   * Boolean: true if overall system ready, false otherwise.
   */
  readonly systemReady: boolean;
}

/**
 * Availability State Semantics:
 *
 * WHAT THIS IS:
 * - Structural carrier for availability/readiness measurements
 * - Snapshot of operational conditions at evaluation time
 * - Foundation for later layer decisions
 *
 * WHAT THIS IS NOT:
 * - Not constraint evaluation (that's deferred)
 * - Not real system monitoring (no integration yet)
 * - Not live health checking (no polling, no real-time updates)
 * - Not persistence (immutable snapshot only)
 * - Not analytics (no aggregation, no metrics)
 * - Not generated from external sources (all caller-provided)
 *
 * HOW LATER LAYERS MAY USE THIS:
 * - Later layers receive AvailabilityState
 * - May evaluate: required resources available for binding?
 * - May determine: which actions can proceed given availability
 * - May produce: availability-related outcomes or decisions
 * - Foundation ready; layer-specific logic deferred
 */
