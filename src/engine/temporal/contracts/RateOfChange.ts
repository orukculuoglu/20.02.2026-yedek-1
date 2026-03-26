/**
 * RateOfChange.ts
 * Explicit representation of rate of change over defined intervals.
 * Interval basis is always explicit, preventing implicit assumptions.
 */

/**
 * RateOfChange: Change over explicit time interval.
 * Interval boundaries are mandatory; rate is normalized to multiple units
 * to allow consumers to choose their preferred representation.
 */
export interface RateOfChange {
  deltaValue: number;
  /// Change in value (current - baseline)
  intervalStartMs: number;
  /// Interval start absolute timestamp (milliseconds)
  intervalEndMs: number;
  /// Interval end absolute timestamp (milliseconds)
  intervalDurationMs: number;
  /// Computed duration (endMs - startMs)
  unitsPerMs: number;
  /// Rate normalized to per-millisecond (delta / durationMs)
  unitsPerSecond?: number;
  /// Convenience normalization to per-second (unitsPerMs * 1000)
  unitsPerMinute?: number;
  /// Convenience normalization to per-minute (unitsPerMs * 60000)
  unitsPerHour?: number;
  /// Convenience normalization to per-hour (unitsPerMs * 3600000)
}
