/**
 * AccelerationDeceleration.ts
 * Structural representation of second-order change (change in rate).
 * No prediction semantics; represents historical second-order dynamics.
 */

/**
 * AccelerationDeceleration: Second-order change measured over time.
 * Represents how the rate of change itself is changing.
 * No inference of future behavior; structural fact only.
 */
export interface AccelerationDeceleration {
  deltaRate: number;
  /// Change in rate (rate_end - rate_start)
  rateStartMs: number;
  /// Start of observation interval (absolute timestamp, milliseconds)
  rateEndMs: number;
  /// End of observation interval (absolute timestamp, milliseconds)
  rateDurationMs: number;
  /// Computed observation duration (endMs - startMs)
  unitsPerMsSquared: number;
  /// Second-order rate normalized to per-ms² (deltaRate / rateDurationMs)
  unitsPerSecondSquared?: number;
  /// Convenience: per-second² (unitsPerMsSquared * 1000 * 1000)
  unitsPerMinuteSquared?: number;
  /// Convenience: per-minute²
  displayUnit?: string;
  /// Optional unit label for rendering (e.g., "units/ms²")
}
