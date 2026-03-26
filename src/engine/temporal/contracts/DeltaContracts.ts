/**
 * DeltaContracts.ts
 * Explicit structural representation of absolute and relative deltas.
 * Zero-denominator cases for relative delta are structurally explicit, not inferred.
 */

/**
 * AbsoluteDelta: Raw numeric difference between two measured values.
 * Does not infer units; carries unit metadata explicitly if needed.
 */
export interface AbsoluteDelta {
  value: number;
  /// Raw signed difference (positive = second greater, negative = first greater)
  precision?: number;
  /// Optional precision information (significant digits, decimal places)
}

/**
 * ZeroDenominatorStrategy: Explicit enumeration of cases where relative delta
 * denominator is zero, preventing inference at consumption time.
 */
export enum ZeroDenominatorStrategy {
  /// Numerator and denominator both zero; ratio undefined
  INDETERMINATE = "indeterminate",
  /// Numerator > 0, denominator = 0; infinite positive magnitude
  INFINITE_POSITIVE = "infinite_positive",
  /// Numerator < 0, denominator = 0; infinite negative magnitude
  INFINITE_NEGATIVE = "infinite_negative",
  /// Numerator = 0, denominator = 0; both zero
  BOTH_ZERO = "both_zero",
}

/**
 * SuccessfulRelativeDelta: Relative change where denominator is non-zero.
 * Percentage form is explicitly computed, not inferred at consumption time.
 */
export interface SuccessfulRelativeDelta {
  kind: "success";
  numerator: number;
  /// Change amount (typically: current - baseline)
  denominator: number;
  /// Baseline value (must be non-zero)
  percentageForm: number;
  /// Numerator / denominator * 100
  displayedAs?: "percentage" | "decimal" | "ratio";
  /// Optional hint for rendering
}

/**
 * ZeroDenominatorRelativeDelta: Explicit representation of undefined ratio cases.
 * Prevents caller from inferring behavior; all paths are structurally visible.
 */
export interface ZeroDenominatorRelativeDelta {
  kind: "zero_denominator";
  numerator: number;
  denominator: 0;
  /// Denominator must be exactly zero
  zeroDenominatorCase: ZeroDenominatorStrategy;
  /// Explicit categorization of the zero case
}

/**
 * RelativeDelta: Proportional change. Always explicit about denominator handling.
 * Discriminated union ensures zero cases are structurally distinct.
 */
export type RelativeDelta = SuccessfulRelativeDelta | ZeroDenominatorRelativeDelta;
